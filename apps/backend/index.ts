import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/v1/signup", (req, res) => {
  res.status(200).json({
    message: "Signup endpoint",
    success: true,
    data: req.body,
  });
});

app.post("/api/v1/signin", (req, res) => {
  res.status(200).json({
    message: "Signin endpoint",
    success: true,
    data: req.body,
  });
});

app.post("/api/v1/avatar", (req, res) => {
  res.status(200).json({
    message: "Avatar endpoint",
    success: true,
    data: req.body,
  });
});

app.post("/api/v1/video", (req, res) => {
  res.status(200).json({
    message: "Video endpoint",
    success: true,
    data: req.body,
  });
});

app.get("/api/v1/video/:videoId", (req, res) => {
  const { videoId } = req.params;

  res.status(200).json({
    message: "Get video by ID",
    success: true,
    data: {
      videoId,
      title: "Sample video",
    },
  });
});

app.get("/api/v1/videos", (req, res) => {
  res.status(200).json({
    message: "Get all videos",
    success: true,
    data: [
      { videoId: "1", title: "Sample video 1" },
      { videoId: "2", title: "Sample video 2" },
    ],
  });
});

app.get("/api/v1/me", (req, res) => {
  res.status(200).json({
    message: "Current user",
    success: true,
    data: {
      id: "user_123",
      name: "Demo User",
      email: "demo@example.com",
    },
  });
});

app.get("/api/v1/models", (req, res) => {
  res.status(200).json({
    message: "Get all models",
    success: true,
    data: [
      { id: "model_1", name: "GPT-4o" },
      { id: "model_2", name: "Claude Sonnet" },
    ],
  });
});

app.get("/api/v1/avatar/:avatarId", (req, res) => {
  const { avatarId } = req.params;

  res.status(200).json({
    message: "Get avatar by ID",
    success: true,
    data: {
      avatarId,
      name: "Sample Avatar",
      style: "cartoon",
    },
  });
});

app.get("/api/v1/avatars", (req, res) => {
  res.status(200).json({
    message: "Get all avatars",
    success: true,
    data: [
      { avatarId: "avatar_1", name: "Avatar 1" },
      { avatarId: "avatar_2", name: "Avatar 2" },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});