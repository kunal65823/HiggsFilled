import axios from "axios";
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export async function generatevideo(
  prompt: string,
  imageUrls: string[],
  voice: string,
  language: string,
  outputPath: string,
) {
  void voice;
  void language;

  const referenceImages = await Promise.all(
    imageUrls.map(async (url) => {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });

      const base64Image = Buffer.from(response.data).toString("base64");

      return {
        image: {
          imageBytes: base64Image,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      };
    }),
  );

  let operation = await ai.models.generateVideos({
    model: "veo-3.1-generate-preview",
    prompt,
    config: {
      referenceImages,
    },
  });

  while (!operation.done) {
    console.log("Waiting for video generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation,
    });
  }

  const generatedVideo = operation.response?.generatedVideos?.[0];

  if (!generatedVideo?.video) {
    throw new Error("No generated video was returned by the model.");
  }

  await ai.files.download({
    file: generatedVideo.video,
    downloadPath: outputPath,
  });

  console.log(`Generated video saved to ${outputPath}`);
}

