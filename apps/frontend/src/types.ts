export type User = {
  id: string;
  username: string;
};

export type Model = {
  id: string;
  name: string;
  isSample?: boolean;
};

export type Video = {
  videoId: string;
  title: string;
  prompt: string;
  status: "pending" | "done" | "error";
  duration: number;
  width: number;
  height: number;
  startFrame: string | null;
  endFrame: string | null;
  videoUrl?: string;
  previewImage?: string;
  isSample?: boolean;
};

export type AvatarImage = {
  id: string;
  type: string;
  url: string;
};

export type Avatar = {
  avatarId: string;
  name: string;
  userId: string;
  images: AvatarImage[];
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};
