
import express from "express";
import { prisma } from "./db";
import { CreateuserSchema, SigninuserSchema, AvtarSchema } from "./types";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import axios from "axios";
import { generatevideo } from "./video";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

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
app.get("/api/v1/video/:videoId", (req, res) => {
  const { videoId } = req.params;

  return res.status(200).json({
    message: "Get video by ID",
    success: true,
    data: {
      videoId,
      title: "Sample video",
    },
  });
});

// GET ALL VIDEOS
app.get("/api/v1/videos", (req, res) => {
  return res.status(200).json({
    message: "Get all videos",
    success: true,
    data: [
      { videoId: "1", title: "Sample video 1" },
      { videoId: "2", title: "Sample video 2" },
    ],
  });
});

// CURRENT USER (demo endpoint)
app.get("/api/v1/me", (req, res) => {
  return res.status(200).json({
    message: "Current user",
    success: true,
    data: {
      id: "user_123",
      name: "Demo User",
      email: "demo@example.com",
    },
  });
});

// GET ALL MODELS (demo endpoint)
app.get("/api/v1/models", (req, res) => {
  return res.status(200).json({
    message: "Get all models",
    success: true,
    data: [
      { id: "model_1", name: "GPT-4o" },
      { id: "model_2", name: "Claude Sonnet" },
    ],
  });
});

// GET AVATAR BY ID (demo endpoint)
app.get("/api/v1/avatar/:avatarId", (req, res) => {
  const { avatarId } = req.params;

  return res.status(200).json({
    message: "Get avatar by ID",
    success: true,
    data: {
      avatarId,
      name: "Sample Avatar",
      style: "professional",
    },
  });
});

// GET ALL AVATARS (demo endpoint)
app.get("/api/v1/avatars", (req, res) => {
  return res.status(200).json({
    message: "Get all avatars",
    success: true,
    data: [
      { avatarId: "avatar_1", name: "Avatar 1" },
      { avatarId: "avatar_2", name: "Avatar 2" },
    ],
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
