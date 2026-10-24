import type { PageKey } from "./Sidebar";

type TopbarProps = {
  activePage: PageKey;
  username?: string;
  onAccountClick: () => void;
};

export function Topbar({ activePage, username, onAccountClick }: TopbarProps) {
  const pageTitle = activePage === "create"
    ? "Create video"
    : `${activePage[0]?.toUpperCase()}${activePage.slice(1)}`;

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-separator">/</span>
        <strong>{pageTitle}</strong>
      </div>
      <div className="topbar-right">
        <span className="connection-status"><span className="status-dot" /> API :3000</span>
        <button
          className="topbar-avatar"
          onClick={onAccountClick}
          title="Open account"
          type="button"
        >
          {username?.[0]?.toUpperCase() ?? "G"}
        </button>
      </div>
    </header>
  );
}
