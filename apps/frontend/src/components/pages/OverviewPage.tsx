import { AvatarCard, EmptyState, ModelCard, VideoCard } from "../MediaCards";
import { PageHeader } from "../PageHeader";
import type { Avatar, Model, User, Video } from "../../types";

type OverviewPageProps = {
  user: User | null;
  models: Model[];
  videos: Video[];
  avatars: Avatar[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onNavigate: (page: "create" | "avatars") => void;
};

export function OverviewPage({
  user,
  models,
  videos,
  avatars,
  loading,
  error,
  onRefresh,
  onNavigate,
}: OverviewPageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Your creative workspace"
        title={`Good to see you${user?.username ? `, ${user.username}` : ""}`}
        detail="Your creative workspace is ready when you are."
        action={
          <button className="primary-button" onClick={() => onNavigate("create")} type="button">
            ✦ Create a video
          </button>
        }
      />

      {error && (
        <div className="notice" role="status">
          <span>Backend connection issue</span>
          <p>{error}</p>
          <button className="text-button" onClick={onRefresh} type="button">Retry</button>
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
          <button className="text-button" onClick={onRefresh} type="button">Refresh ↻</button>
        </div>
        {loading ? (
          <div className="loading-state"><span className="spinner" /> Loading your workspace...</div>
        ) : videos.length ? (
          <div className="video-grid">
            {videos.slice(0, 4).map((video) => <VideoCard key={video.videoId} video={video} />)}
          </div>
        ) : (
          <EmptyState
            title="Your next idea starts here"
            detail="Generated videos saved in your backend library will appear here."
            action={
              <button className="secondary-button" onClick={() => onNavigate("create")} type="button">
                Start creating
              </button>
            }
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

      <section className="content-section">
        <div className="section-heading">
          <div><span className="eyebrow">Your library</span><h2>Recent avatars</h2></div>
          <button className="text-button" onClick={() => onNavigate("avatars")} type="button">View all ↗</button>
        </div>
        {avatars.length ? (
          <div className="avatar-grid">
            {avatars.slice(0, 3).map((avatar) => <AvatarCard key={avatar.avatarId} avatar={avatar} />)}
          </div>
        ) : (
          <EmptyState
            title="No avatars yet"
            detail="Create an avatar or add one to your library to see it here."
            action={
              <button className="secondary-button" onClick={() => onNavigate("avatars")} type="button">
                Browse avatars
              </button>
            }
          />
        )}
      </section>
    </>
  );
}
