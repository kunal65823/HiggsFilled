
import express from "express";
import { prisma } from "./db";
import { CreateuserSchema, SigninuserSchema, AvtarSchema } from "./types";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import axios from "axios";
import { generatevideo } from "./video.ts";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ??
    "http://localhost:3001,http://127.0.0.1:3001"
  ).split(",").map((origin) => origin.trim());
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-User-Id",
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

// Initialize Google GenAI
const apiKey = process.env.GOOGLE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --------------------------------------------------
// SIGN UP
// POST /api/v1/signup
// --------------------------------------------------
app.post("/api/v1/signup", async (req, res) => {
  try {
    const result = CreateuserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      });
    }

    const { username, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return res.status(201).json({
      message: "Signup successful",
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// --------------------------------------------------
// SIGN IN
// POST /api/v1/signin
// --------------------------------------------------
app.post("/api/v1/signin", async (req, res) => {
  try {
    const result = SigninuserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      });
    }

    const { username, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
        success: false,
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid username or password",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Signin successful",
      success: true,
      data: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// --------------------------------------------------
// GENERATE AVATAR IMAGE
// POST /api/v1/avatar
// --------------------------------------------------
app.post("/api/v1/avatar", async (req, res) => {
  try {
    const result = AvtarSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        success: false,
        errors: result.error.issues.map((issue) => issue.message),
      });
    }

    if (!ai) {
      return res.status(500).json({
        message: "GOOGLE_API_KEY is not configured",
        success: false,
      });
    }

    const { image } = result.data;

    const response = await axios.get(image, {
      responseType: "arraybuffer",
      timeout: 15000,
    });

    const base64Image = Buffer.from(response.data).toString("base64");

    const contentType = response.headers["content-type"];

    const mimeType =
      typeof contentType === "string" &&
      ["image/png", "image/jpeg", "image/webp"].includes(contentType)
        ? contentType
        : "image/png";

    const interaction = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Create a professional left-facing profile headshot based on the provided user's image. Preserve the person's identity and make the result suitable for a portfolio.",
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const parts =
      interaction.candidates?.flatMap(
        (candidate) => candidate.content?.parts ?? []
      ) ?? [];

    const generatedImage = parts.find(
      (part) => part.inlineData?.data
    )?.inlineData;

    if (!generatedImage?.data) {
      return res.status(502).json({
        message: "No image was returned by the AI model",
        success: false,
      });
    }

    const outputPath = "gemini-native-image.png";

    await fs.promises.writeFile(
      outputPath,
      Buffer.from(generatedImage.data, "base64")
    );

    return res.status(200).json({
      message: "Avatar image generated successfully",
      success: true,
      data: { filename: outputPath },
      filename: outputPath,
    });
  } catch (error) {
    console.error("Avatar generation error:", error);

    return res.status(500).json({
      message: "Avatar generation failed",
      success: false,
    });
  }
});

// --------------------------------------------------
// CREATE VIDEO
// POST /api/v1/video
// --------------------------------------------------
app.post("/api/v1/video", async (req, res) => {
  try {
    const {
      prompt,
      imageUrls,
      voice = "en-US-Wavenet-F",
      language = "en-US",
      outputPath = "output.mp4",
    } = req.body ?? {};

    if (!prompt || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        message: "Prompt and imageUrls are required",
        success: false,
      });
    }

    await generatevideo(prompt, imageUrls, voice, language, outputPath);

    return res.status(200).json({
      message: "Video generation started",
      success: true,
      data: { outputPath },
    });
  } catch (error) {
    console.error("Video generation error:", error);

    return res.status(500).json({
      message: "Video generation failed",
      success: false,
    });
  }
});

// GET VIDEO BY ID
app.get("/api/v1/video/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        message: "Video ID is required",
        success: false,
      });
    }

    const video = await prisma.avatarVideo.findUnique({
      where: { id: videoId },
      include: {
        references: {
          select: {
            id: true,
            avatarId: true,
          },
        },
      },
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get video by ID",
      success: true,
      data: {
        videoId: video.id,
        title: video.prompt.slice(0, 80),
        prompt: video.prompt,
        status: video.status,
        duration: video.duration,
        width: video.width,
        height: video.height,
        startFrame: video.startFrame,
        endFrame: video.endFrame,
        references: video.references,
      },
    });
  } catch (error) {
    console.error("Get video by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch video",
      success: false,
    });
  }
});

// GET ALL VIDEOS
app.get("/api/v1/videos", async (req, res) => {
  try {
    const userId =
      (typeof req.query.userId === "string" && req.query.userId) ||
      (typeof req.headers["x-user-id"] === "string" && req.headers["x-user-id"]);

    const videos = await prisma.avatarVideo.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { id: "desc" },
      select: {
        id: true,
        prompt: true,
        status: true,
        duration: true,
        width: true,
        height: true,
        startFrame: true,
        endFrame: true,
      },
    });

    return res.status(200).json({
      message: "Get all videos",
      success: true,
      data: videos.map((video) => ({
        videoId: video.id,
        title: video.prompt.slice(0, 80),
        prompt: video.prompt,
        status: video.status,
        duration: video.duration,
        width: video.width,
        height: video.height,
        startFrame: video.startFrame,
        endFrame: video.endFrame,
      })),
    });
  } catch (error) {
    console.error("Get videos error:", error);

    return res.status(500).json({
      message: "Failed to fetch videos",
      success: false,
    });
  }
});

// CURRENT USER
app.get("/api/v1/me", async (req, res) => {
  try {
    const userId =
      (typeof req.query.userId === "string" && req.query.userId) ||
      (typeof req.headers["x-user-id"] === "string" && req.headers["x-user-id"]);

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      return res.status(200).json({
        message: "Current user",
        success: true,
        data: {
          id: user.id,
          username: user.username,
        },
      });
    }

    return res.status(200).json({
      message: "Current user",
      success: true,
      data: {
        id: "user_123",
        username: "demo-user",
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to fetch current user",
      success: false,
    });
  }
});

// GET ALL MODELS
app.get("/api/v1/models", (req, res) => {
  return res.status(200).json({
    message: "Get all models",
    success: true,
    data: [
      { id: "gemini-3.1-flash-image", name: "Gemini 3.1 Flash Image" },
      { id: "veo-3.1-generate-preview", name: "Veo 3.1 Generate Preview" },
    ],
  });
});

// GET AVATAR BY ID
app.get("/api/v1/avatar/:avatarId", async (req, res) => {
  try {
    const { avatarId } = req.params;

    if (!avatarId) {
      return res.status(400).json({
        message: "Avatar ID is required",
        success: false,
      });
    }

    const avatar = await prisma.avatar.findUnique({
      where: { id: avatarId },
      include: {
        images: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    });

    if (!avatar) {
      return res.status(404).json({
        message: "Avatar not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get avatar by ID",
      success: true,
      data: {
        avatarId: avatar.id,
        name: avatar.name,
        userId: avatar.userId,
        images: avatar.images,
      },
    });
  } catch (error) {
    console.error("Get avatar by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch avatar",
      success: false,
    });
  }
});

// GET ALL AVATARS
app.get("/api/v1/avatars", async (req, res) => {
  try {
    const userId =
      (typeof req.query.userId === "string" && req.query.userId) ||
      (typeof req.headers["x-user-id"] === "string" && req.headers["x-user-id"]);

    const avatars = await prisma.avatar.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { id: "desc" },
      include: {
        images: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Get all avatars",
      success: true,
      data: avatars.map((avatar) => ({
        avatarId: avatar.id,
        name: avatar.name,
        userId: avatar.userId,
        images: avatar.images,
      })),
    });
  } catch (error) {
    console.error("Get avatars error:", error);

    return res.status(500).json({
      message: "Failed to fetch avatars",
      success: false,
    });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
