import type { Avatar, Video } from "./types";

export const sampleModels = [
  { id: "gemini-3.1-flash-image", name: "Gemini 3.1 Flash Image", isSample: true },
  { id: "veo-3.1-generate-preview", name: "Veo 3.1 Generate Preview", isSample: true },
];

const sampleVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const sampleVideos: Video[] = [
  {
    videoId: "sample-video-flower",
    title: "First light",
    prompt: "A flower opening in the warm light of morning.",
    status: "done",
    duration: 5,
    width: 1280,
    height: 720,
    startFrame: null,
    endFrame: null,
    videoUrl: sampleVideoUrl,
    previewImage:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=960&q=80",
    isSample: true,
  },
  {
    videoId: "sample-video-coast",
    title: "Coastal escape",
    prompt: "A quiet coastline beneath a pastel sunset.",
    status: "done",
    duration: 8,
    width: 1920,
    height: 1080,
    startFrame: null,
    endFrame: null,
    videoUrl: sampleVideoUrl,
    previewImage:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=960&q=80",
    isSample: true,
  },
  {
    videoId: "sample-video-mountain",
    title: "Above the clouds",
    prompt: "Sunrise spilling over a mountain valley.",
    status: "done",
    duration: 6,
    width: 1280,
    height: 720,
    startFrame: null,
    endFrame: null,
    videoUrl: sampleVideoUrl,
    previewImage:
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=960&q=80",
    isSample: true,
  },
];

export const sampleAvatars: Avatar[] = [
  {
    avatarId: "sample-avatar-1",
    name: "Creative portrait",
    userId: "sample",
    images: [
      {
        id: "sample-avatar-image-1",
        type: "Model",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=80",
      },
    ],
  },
  {
    avatarId: "sample-avatar-2",
    name: "Studio portrait",
    userId: "sample",
    images: [
      {
        id: "sample-avatar-image-2",
        type: "Model",
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80",
      },
    ],
  },
  {
    avatarId: "sample-avatar-3",
    name: "Editorial portrait",
    userId: "sample",
    images: [
      {
        id: "sample-avatar-image-3",
        type: "Model",
        url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&h=240&q=80",
      },
    ],
  },
];
