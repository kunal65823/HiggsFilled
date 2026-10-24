import type { ReactNode } from "react";
import type { Avatar, Model, Video } from "../types";

export function ModelCard({ model }: { model: Model }) {
  const isVideoModel = model.id.startsWith("veo");

  return (
    <article className="model-card">
      <span className={`model-symbol ${isVideoModel ? "violet" : "blue"}`}>
        {isVideoModel ? "▶" : "✧"}
      </span>
      <div className="model-copy">
        <strong>{model.name}</strong>
        <span>{isVideoModel ? "Video generation" : "Image generation"}</span>
      </div>
      <span className={model.isSample ? "sample-model-status" : "model-status"}>
        {model.isSample ? "Sample" : "Ready"}
      </span>
    </article>
  );
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="video-card">
      <div className="video-preview">
        {video.videoUrl ? (
          <video
            className="video-media"
            controls
            playsInline
            preload="none"
            poster={video.previewImage}
            src={video.videoUrl}
          />
        ) : (
          <>
            {video.previewImage && (
              <img className="video-poster" src={video.previewImage} alt="" />
            )}
            <span className="preview-play" aria-hidden="true">▶</span>
          </>
        )}
        {video.isSample && <span className="sample-pill">Sample</span>}
        <span className={`status-pill status-${video.status}`}>{video.status}</span>
        <span className="video-duration">{video.duration}s</span>
      </div>
      <div className="video-copy">
        <strong>{video.title || "Untitled video"}</strong>
        <span>{video.prompt}</span>
        <small>{video.width} × {video.height}</small>
      </div>
    </article>
  );
}

export function AvatarCard({ avatar }: { avatar: Avatar }) {
  const image = avatar.images[0];

  return (
    <article className="avatar-card">
      {image ? (
        <img src={image.url} alt={`${avatar.name} avatar`} />
      ) : (
        <div className="avatar-placeholder">{avatar.name[0]?.toUpperCase() ?? "A"}</div>
      )}
      <div className="avatar-copy">
        <strong>{avatar.name}</strong>
        <span>{avatar.images.length} {avatar.images.length === 1 ? "image" : "images"}</span>
      </div>
      <span className="avatar-arrow">↗</span>
    </article>
  );
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">✳</span>
      <strong>{title}</strong>
      <p>{detail}</p>
      {action}
    </div>
  );
}
