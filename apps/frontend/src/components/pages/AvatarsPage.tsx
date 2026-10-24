import type { FormEvent } from "react";
import { AvatarCard, EmptyState } from "../MediaCards";
import { PageHeader } from "../PageHeader";
import type { Avatar } from "../../types";

type AvatarsPageProps = {
  avatars: Avatar[];
  pending: boolean;
  error: string;
  result: { filename: string } | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AvatarsPage({ avatars, pending, error, result, onSubmit }: AvatarsPageProps) {
  return (
    <>
      <PageHeader
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
        <form className="inline-form" onSubmit={onSubmit}>
          <input
            aria-label="Source image URL"
            name="image"
            placeholder="Paste a publicly accessible image URL"
            required
            type="url"
          />
          <button className="primary-button" disabled={pending} type="submit">
            {pending ? "Generating..." : "Generate"}
          </button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
        {result && (
          <div className="success-message" role="status">
            Avatar image generated and saved as <strong>{result.filename}</strong>.
          </div>
        )}
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div><span className="eyebrow">Saved</span><h2>Your avatars</h2></div>
          <span className="subtle-count">{avatars.length} total</span>
        </div>
        {avatars.length ? (
          <div className="avatar-grid">
            {avatars.map((avatar) => <AvatarCard key={avatar.avatarId} avatar={avatar} />)}
          </div>
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
