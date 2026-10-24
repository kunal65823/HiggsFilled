import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest, withUserId } from "../api";
import type { Avatar, Model, User, Video } from "../types";

type AuthMode = "signin" | "signup";

type VideoResult = {
  outputPath: string;
};

type AvatarResult = {
  filename: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function useStudio() {
  const [user, setUser] = useState<User | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [videoPending, setVideoPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [avatarResult, setAvatarResult] = useState<AvatarResult | null>(null);

  const loadDashboard = useCallback(async (userId?: string) => {
    setLoading(true);
    setLoadingError("");

    const results = await Promise.allSettled([
      apiRequest<User>(withUserId("/me", userId)),
      apiRequest<Model[]>("/models"),
      apiRequest<Video[]>(withUserId("/videos", userId)),
      apiRequest<Avatar[]>(withUserId("/avatars", userId)),
    ]);

    const failures: string[] = [];
    const [meResult, modelsResult, videosResult, avatarsResult] = results;

    if (meResult.status === "fulfilled") setUser(meResult.value.data);
    else failures.push(`Profile: ${errorMessage(meResult.reason)}`);

    if (modelsResult.status === "fulfilled") setModels(modelsResult.value.data);
    else failures.push(`Models: ${errorMessage(modelsResult.reason)}`);

    if (videosResult.status === "fulfilled") setVideos(videosResult.value.data);
    else failures.push(`Videos: ${errorMessage(videosResult.reason)}`);

    if (avatarsResult.status === "fulfilled") setAvatars(avatarsResult.value.data);
    else failures.push(`Avatars: ${errorMessage(avatarsResult.reason)}`);

    if (failures.length) setLoadingError(failures.join(" · "));
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("higgsfield-user");
    let userId: string | undefined;

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        if (parsedUser.id && parsedUser.username) {
          userId = parsedUser.id;
          setUser(parsedUser);
        } else {
          localStorage.removeItem("higgsfield-user");
        }
      } catch {
        localStorage.removeItem("higgsfield-user");
      }
    }

    void loadDashboard(userId);
  }, [loadDashboard]);

  const authenticate = async (
    mode: AuthMode,
    event: FormEvent<HTMLFormElement>,
  ): Promise<boolean> => {
    event.preventDefault();
    setAuthError("");
    setAuthPending(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await apiRequest<User>(mode === "signup" ? "/signup" : "/signin", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("higgsfield-user", JSON.stringify(response.data));
      setUser(response.data);
      await loadDashboard(response.data.id);
      return true;
    } catch (error) {
      setAuthError(errorMessage(error));
      return false;
    } finally {
      setAuthPending(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("higgsfield-user");
    setUser(null);
    void loadDashboard();
  };

  const generateVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setVideoError("");
    setVideoResult(null);
    setVideoPending(true);

    const formData = new FormData(form);
    const prompt = String(formData.get("prompt") ?? "").trim();
    const imageUrls = String(formData.get("imageUrls") ?? "")
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);
    const outputPath = String(formData.get("outputPath") ?? "").trim();

    try {
      const response = await apiRequest<VideoResult>("/video", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          imageUrls,
          ...(outputPath ? { outputPath } : {}),
        }),
      });
      setVideoResult(response.data);
      form.reset();
      await loadDashboard(user?.id);
    } catch (error) {
      setVideoError(errorMessage(error));
    } finally {
      setVideoPending(false);
    }
  };

  const generateAvatar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setAvatarError("");
    setAvatarResult(null);
    setAvatarPending(true);

    const formData = new FormData(form);
    const image = String(formData.get("image") ?? "").trim();

    try {
      const response = await apiRequest<AvatarResult>("/avatar", {
        method: "POST",
        body: JSON.stringify({ image }),
      });
      setAvatarResult(response.data);
      form.reset();
    } catch (error) {
      setAvatarError(errorMessage(error));
    } finally {
      setAvatarPending(false);
    }
  };

  return {
    user,
    models,
    videos,
    avatars,
    loading,
    loadingError,
    authError,
    authPending,
    videoPending,
    avatarPending,
    videoError,
    avatarError,
    videoResult,
    avatarResult,
    loadDashboard,
    authenticate,
    clearAuthError: () => setAuthError(""),
    signOut,
    generateVideo,
    generateAvatar,
  };
}
