import type { FormEvent } from "react";
import { PageHeader } from "../PageHeader";

type CreateVideoPageProps = {
  pending: boolean;
  error: string;
  result: { outputPath: string } | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateVideoPage({ pending, error, result, onSubmit }: CreateVideoPageProps) {
  return (
    <>
      <PageHeader
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
        <form className="studio-form" onSubmit={onSubmit}>
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
          <label htmlFor="output-path">
            Output file name <span className="optional-label">Optional</span>
          </label>
          <input id="output-path" name="outputPath" placeholder="output.mp4" />
          {error && <p className="form-error" role="alert">{error}</p>}
          {result && (
            <div className="success-message" role="status">
              Video generated. Saved to <strong>{result.outputPath}</strong>
            </div>
          )}
          <button className="primary-button generate-button" disabled={pending} type="submit">
            {pending ? <><span className="spinner" /> Generating video...</> : <>✦ Generate video</>}
          </button>
          <p className="form-footnote">Generation may take a few minutes. Keep this page open while it completes.</p>
        </form>
      </section>
    </>
  );
}
