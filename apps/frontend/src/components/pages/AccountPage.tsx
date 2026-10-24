import { useState, type FormEvent } from "react";
import { PageHeader } from "../PageHeader";
import type { User } from "../../types";

type AuthMode = "signin" | "signup";

type AccountPageProps = {
  user: User | null;
  pending: boolean;
  error: string;
  onAuthenticate: (mode: AuthMode, event: FormEvent<HTMLFormElement>) => void;
  onClearError: () => void;
  onSignOut: () => void;
};

export function AccountPage({
  user,
  pending,
  error,
  onAuthenticate,
  onClearError,
  onSignOut,
}: AccountPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const isSignedIn = user !== null && user.id !== "user_123";

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Your account"
        detail="Sign in to view your account-specific videos and avatars."
      />
      {isSignedIn ? (
        <section className="panel account-panel">
          <div className="profile-avatar large">{user.username[0]?.toUpperCase() ?? "U"}</div>
          <div className="account-details">
            <span className="eyebrow">Signed in as</span>
            <h2>{user.username}</h2>
            <p>User ID: <code>{user.id}</code></p>
          </div>
          <button className="secondary-button" onClick={onSignOut} type="button">Sign out</button>
        </section>
      ) : (
        <section className="panel auth-panel">
          <div className="auth-tabs">
            <button
              className={authMode === "signin" ? "selected" : ""}
              onClick={() => {
                setAuthMode("signin");
                onClearError();
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={authMode === "signup" ? "selected" : ""}
              onClick={() => {
                setAuthMode("signup");
                onClearError();
              }}
              type="button"
            >
              Create account
            </button>
          </div>
          <h2>{authMode === "signin" ? "Welcome back" : "Join the studio"}</h2>
          <p className="auth-description">
            {authMode === "signin"
              ? "Sign in with your username and password."
              : "Create an account to keep your creative workspace together."}
          </p>
          <form className="studio-form" onSubmit={(event) => onAuthenticate(authMode, event)}>
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
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button generate-button" disabled={pending} type="submit">
              {pending ? "Please wait..." : authMode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="form-footnote">Your credentials are sent directly to your configured backend.</p>
        </section>
      )}
    </>
  );
}
