export type PageKey = "overview" | "create" | "avatars" | "account";

const navItems: Array<{ id: PageKey; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "create", label: "Create video", icon: "✳" },
  { id: "avatars", label: "Avatars", icon: "◉" },
  { id: "account", label: "Account", icon: "◎" },
];

type SidebarProps = {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  username?: string;
};

export function Sidebar({ activePage, onNavigate, username }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
        <span className="brand-mark">h</span>
        <span>higgsfield<span className="brand-dot">.</span></span>
      </a>

      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={`nav-item${activePage === item.id ? " active" : ""}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
            {item.id === "create" && <span className="nav-plus">+</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="credits-card">
          <span className="credits-icon">✦</span>
          <div>
            <strong>Creative studio</strong>
            <span>Bring your ideas to life</span>
          </div>
        </div>
        <button className="profile-button" onClick={() => onNavigate("account")} type="button">
          <span className="profile-avatar">{username?.[0]?.toUpperCase() ?? "G"}</span>
          <span className="profile-name">{username ?? "Guest account"}</span>
          <span className="profile-menu">•••</span>
        </button>
      </div>
    </aside>
  );
}
