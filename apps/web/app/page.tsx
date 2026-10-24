import styles from "./page.module.css";

type UserData = {
  id: string;
  username?: string;
};

type ModelData = {
  id: string;
  name: string;
};

type VideoData = {
  videoId: string;
  title: string;
  prompt?: string;
  status?: string;
  duration?: number;
  width?: number;
  height?: number;
};

type AvatarData = {
  avatarId: string;
  name: string;
  userId?: string;
  images?: Array<{ id: string; type?: string; url?: string }>;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`http://localhost:3000${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload: ApiResponse<T> = await response.json();
    return payload.data;
  } catch {
    return null;
  }
}

function UserCard({ user }: { user: UserData | null }) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <span className={styles.kicker}>User</span>
        <h2>Current profile</h2>
      </div>

      {user ? (
        <div className={styles.userInfo}>
          <div className={styles.avatarBadge}>{user.username?.[0]?.toUpperCase() ?? "U"}</div>
          <div>
            <p className={styles.label}>ID</p>
            <strong>{user.id}</strong>
          </div>
          <div>
            <p className={styles.label}>Username</p>
            <strong>{user.username ?? "Demo user"}</strong>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>User data not available.</p>
      )}
    </section>
  );
}

function ModelList({ models }: { models: ModelData[] }) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <span className={styles.kicker}>Models</span>
        <h2>Available models</h2>
      </div>

      <div className={styles.grid}>
        {models.map((model) => (
          <article key={model.id} className={styles.itemCard}>
            <h3>{model.name}</h3>
            <p>{model.id}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function VideoList({ videos }: { videos: VideoData[] }) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <span className={styles.kicker}>Videos</span>
        <h2>Recent videos</h2>
      </div>

      <div className={styles.list}>
        {videos.map((video) => (
          <article key={video.videoId} className={styles.itemCard}>
            <div className={styles.listRow}>
              <h3>{video.title}</h3>
              <span className={styles.tag}>{video.status ?? "pending"}</span>
            </div>
            <p>{video.prompt ?? "No prompt provided."}</p>
            <div className={styles.metaRow}>
              <span>{video.duration ?? 0}s</span>
              <span>{video.width ?? 0}x{video.height ?? 0}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AvatarList({ avatars }: { avatars: AvatarData[] }) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <span className={styles.kicker}>Avatars</span>
        <h2>Avatar library</h2>
      </div>

      <div className={styles.grid}>
        {avatars.map((avatar) => (
          <article key={avatar.avatarId} className={styles.itemCard}>
            <h3>{avatar.name}</h3>
            <p>{avatar.avatarId}</p>
            <div className={styles.thumbRow}>
              {avatar.images?.slice(0, 3).map((image) => (
                <img
                  key={image.id}
                  src={image.url ?? ""}
                  alt={avatar.name}
                  className={styles.thumb}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [user, models, videos, avatars] = await Promise.all([
    fetchApi<UserData>("/api/v1/me"),
    fetchApi<ModelData[]>("/api/v1/models"),
    fetchApi<VideoData[]>("/api/v1/videos"),
    fetchApi<AvatarData[]>("/api/v1/avatars"),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div>
            <span className={styles.kicker}>Dashboard</span>
            <h1>AI media components</h1>
          </div>
        </header>

        <div className={styles.layout}>
          <UserCard user={user} />
          <ModelList models={models ?? []} />
          <VideoList videos={videos ?? []} />
          <AvatarList avatars={avatars ?? []} />
        </div>
      </div>
    </main>
  );
}
