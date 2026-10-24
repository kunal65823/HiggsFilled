import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { apiRequest, withUserId } from "./api";
import { AvatarCard, EmptyState, ModelCard, VideoCard } from "./components/MediaCards";
import { Sidebar, type PageKey } from "./components/Sidebar";
import type { Avatar, Model, User, Video } from "./types";
import "./index.css";

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

function SectionTitle({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  );
}

export function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");
  const [user, setUser] = useState<User | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
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

    const mePath = withUserId("/me", userId);
    const videoPath = withUserId("/videos", userId);
    const avatarPath = withUserId("/avatars", userId);
    const results = await Promise.allSettled([
      apiRequest<User>(mePath),
      apiRequest<Model[]>("/models"),
      apiRequest<Video[]>(videoPath),
      apiRequest<Avatar[]>(avatarPath),
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

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthPending(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const endpoint = authMode === "signup" ? "/signup" : "/signin";

    try {
      const response = await apiRequest<User>(endpoint, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("higgsfield-user", JSON.stringify(response.data));
      setUser(response.data);
      setActivePage("overview");
      await loadDashboard(response.data.id);
    } catch (error) {
      setAuthError(errorMessage(error));
    } finally {
      setAuthPending(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("higgsfield-user");
    setUser(null);
    setActivePage("overview");
    void loadDashboard();
  };

  const handleVideoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setVideoError("");
    setVideoResult(null);
    setVideoPending(true);

    const formData = new FormData(event.currentTarget);
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

  const handleAvatarSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setAvatarError("");
    setAvatarResult(null);
    setAvatarPending(true);

    const formData = new FormData(event.currentTarget);
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

  const mainContent = () => {
    if (activePage === "create") {
      return (
        <>
          <SectionTitle
            eyebrow="Veo studio"
            title="Create a video"
            detail="Turn a prompt and reference images into a new video."
          />
          <section className="panel form-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">New generation</span>
                <h2>Describe your scene</h2>
              </div>
              <span className="model-chip">✦ Veo 3.1</span>
            </div>
            <form className="studio-form" onSubmit={handleVideoSubmit}>
              <label htmlFor="video-prompt">Prompt</label>
              <textarea
                id="video-prompt"
                name="prompt"
                placeholder="A cinematic close-up of a flower opening in the first light of dawn..."
                minLength={1}
                required
                rows={5}
              />
              <label htmlFor="video-images">Reference image URLs</label>
              <textarea
                id="video-images"
                name="imageUrls"
                placeholder={"https://example.com/image-1.png\nhttps://example.com/image-2.png"}
                required
                rows={3}
              />
              <span className="field-hint">Add one or more publicly accessible image URLs, one per line.</span>
              <label htmlFor="output-path">Output file name <span className="optional-label">Optional</span></label>
              <input id="output-path" name="outputPath" placeholder="output.mp4" />
              {videoError && <p className="form-error" role="alert">{videoError}</p>}
              {videoResult && (
                <div className="success-message" role="status">
                  Video generated. Saved to <strong>{videoResult.outputPath}</strong>
                </div>
              )}
              <button className="primary-button generate-button" disabled={videoPending} type="submit">
                {videoPending ? <><span className="spinner" /> Generating video...</> : <>✦ Generate video</>}
              </button>
              <p className="form-footnote">Generation may take a few minutes. Keep this page open while it completes.</p>
            </form>
          </section>
        </>
      );
    }

    if (activePage === "avatars") {
      return (
        <>
          <SectionTitle
            eyebrow="Your library"
            title="Avatars"
            detail="Your saved avatars and generated portrait images."
          />
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Portrait generator</span>
                <h2>Generate an avatar image</h2>
              </div>
              <span className="model-chip">✧ Gemini image</span>
            </div>
            <form className="inline-form" onSubmit={handleAvatarSubmit}>
              <input
                aria-label="Source image URL"
                name="image"
                placeholder="Paste a publicly accessible image URL"
                required
                type="url"
              />
              <button className="primary-button" disabled={avatarPending} type="submit">
                {avatarPending ? "Generating..." : "Generate"}
              </button>
            </form>
            {avatarError && <p className="form-error" role="alert">{avatarError}</p>}
            {avatarResult && (
              <div className="success-message" role="status">
                Avatar image generated and saved as <strong>{avatarResult.filename}</strong>.
              </div>
            )}
          </section>
          <section className="content-section">
            <div className="section-heading">
              <div><span className="eyebrow">Saved</span><h2>Your avatars</h2></div>
              <span className="subtle-count">{avatars.length} total</span>
            </div>
            {avatars.length ? (
              <div className="avatar-grid">{avatars.map((avatar) => <AvatarCard key={avatar.avatarId} avatar={avatar} />)}</div>
            ) : (
              <EmptyState
                title="Your avatar library is empty"
                detail="Avatars are loaded from your backend account. Generate a portrait above or add an avatar record to start your library."
              />
            )}
          </section>
        </>
      );
    }

    if (activePage === "account") {
      return (
        <>
          <SectionTitle
            eyebrow="Profile"
            title="Your account"
            detail="Sign in to view your account-specific videos and avatars."
          />
          {user && user.id !== "user_123" ? (
            <section className="panel account-panel">
              <div className="profile-avatar large">{user.username[0]?.toUpperCase() ?? "U"}</div>
              <div className="account-details">
                <span className="eyebrow">Signed in as</span>
                <h2>{user.username}</h2>
                <p>User ID: <code>{user.id}</code></p>
              </div>
              <button className="secondary-button" onClick={handleSignOut} type="button">Sign out</button>
            </section>
          ) : (
            <section className="panel auth-panel">
              <div className="auth-tabs">
                <button
                  className={authMode === "signin" ? "selected" : ""}
                  onClick={() => { setAuthMode("signin"); setAuthError(""); }}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className={authMode === "signup" ? "selected" : ""}
                  onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                  type="button"
                >
                  Create account
                </button>
              </div>
              <h2>{authMode === "signin" ? "Welcome back" : "Join the studio"}</h2>
              <p className="auth-description">
                {authMode === "signin" ? "Sign in with your username and password." : "Create an account to keep your creative workspace together."}
              </p>
              <form className="studio-form" onSubmit={handleAuth}>
                <label htmlFor="auth-username">Username</label>
                <input id="auth-username" name="username" minLength={3} autoComplete="username" required />
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  minLength={authMode === "signup" ? 8 : 1}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  required
                />
                {authError && <p className="form-error" role="alert">{authError}</p>}
                <button className="primary-button generate-button" disabled={authPending} type="submit">
                  {authPending ? "Please wait..." : authMode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>
              <p className="form-footnote">Your credentials are sent directly to your configured backend.</p>
            </section>
          )}
        </>
      );
    }

    return (
      <>
        <SectionTitle
          eyebrow="Your creative workspace"
          title={`Good to see you${user?.username ? `, ${user.username}` : ""}`}
          detail="Your creative workspace is ready when you are."
          action={
            <button className="primary-button" onClick={() => setActivePage("create")} type="button">
              ✦ Create a video
            </button>
          }
        />

        {loadingError && (
          <div className="notice" role="status">
            <span>Backend connection issue</span>
            <p>{loadingError}</p>
            <button className="text-button" onClick={() => void loadDashboard(user?.id)} type="button">Retry</button>
          </div>
        )}

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon blue">▶</span>
            <span className="stat-label">Videos</span>
            <strong>{videos.length}</strong>
            <small>in your library</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon violet">◉</span>
            <span className="stat-label">Avatars</span>
            <strong>{avatars.length}</strong>
            <small>ready to create with</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon green">✧</span>
            <span className="stat-label">AI models</span>
            <strong>{models.length}</strong>
            <small>available in workspace</small>
          </article>
        </div>

        <section className="content-section">
          <div className="section-heading">
            <div><span className="eyebrow">Your creations</span><h2>Recent videos</h2></div>
            <button className="text-button" onClick={() => void loadDashboard(user?.id)} type="button">
              Refresh ↻
            </button>
          </div>
          {loading ? (
            <div className="loading-state"><span className="spinner" /> Loading your workspace...</div>
          ) : videos.length ? (
            <div className="video-grid">{videos.slice(0, 4).map((video) => <VideoCard key={video.videoId} video={video} />)}</div>
          ) : (
            <EmptyState
              title="Your next idea starts here"
              detail="Generated videos saved in your backend library will appear here."
              action={<button className="secondary-button" onClick={() => setActivePage("create")} type="button">Start creating</button>}
            />
          )}
        </section>

        <section className="content-section models-section">
          <div className="section-heading">
            <div><span className="eyebrow">Powered by AI</span><h2>Available models</h2></div>
          </div>
          {models.length ? (
            <div className="models-grid">{models.map((model) => <ModelCard key={model.id} model={model} />)}</div>
          ) : (
            <EmptyState title="Models unavailable" detail="Make sure the backend is running, then retry the connection." />
          )}
        </section>
      </>
    );
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} username={user?.username} />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>{activePage === "create" ? "Create video" : activePage[0]?.toUpperCase() + activePage.slice(1)}</strong></div>
          <div className="topbar-right">
            <span className="connection-status"><span className="status-dot" /> API :3000</span>
            <button className="topbar-avatar" onClick={() => setActivePage("account")} title="Open account" type="button">
              {user?.username?.[0]?.toUpperCase() ?? "G"}
            </button>
          </div>
        </header>
        <div className="page-content">{mainContent()}</div>
      </main>
    </div>
  );
}

export default App;
