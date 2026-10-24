import { useState } from "react";
import { AccountPage } from "./components/pages/AccountPage";
import { AvatarsPage } from "./components/pages/AvatarsPage";
import { CreateVideoPage } from "./components/pages/CreateVideoPage";
import { OverviewPage } from "./components/pages/OverviewPage";
import { Sidebar, type PageKey } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { useStudio } from "./hooks/useStudio";
import "./index.css";

export function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");
  const studio = useStudio();

  const handleAuthentication = async (
    mode: "signin" | "signup",
    event: Parameters<typeof studio.authenticate>[1],
  ) => {
    if (await studio.authenticate(mode, event)) {
      setActivePage("overview");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "create":
        return (
          <CreateVideoPage
            pending={studio.videoPending}
            error={studio.videoError}
            result={studio.videoResult}
            onSubmit={studio.generateVideo}
          />
        );
      case "avatars":
        return (
          <AvatarsPage
            avatars={studio.avatars}
            pending={studio.avatarPending}
            error={studio.avatarError}
            result={studio.avatarResult}
            onSubmit={studio.generateAvatar}
          />
        );
      case "account":
        return (
          <AccountPage
            user={studio.user}
            pending={studio.authPending}
            error={studio.authError}
            onAuthenticate={(mode, event) => void handleAuthentication(mode, event)}
            onClearError={studio.clearAuthError}
            onSignOut={() => {
              studio.signOut();
              setActivePage("overview");
            }}
          />
        );
      case "overview":
        return (
          <OverviewPage
            user={studio.user}
            models={studio.models}
            videos={studio.videos}
            avatars={studio.avatars}
            loading={studio.loading}
            error={studio.loadingError}
            onRefresh={() => void studio.loadDashboard(studio.user?.id)}
            onNavigate={setActivePage}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        username={studio.user?.username}
      />
      <main className="main-area">
        <Topbar
          activePage={activePage}
          username={studio.user?.username}
          onAccountClick={() => setActivePage("account")}
        />
        <div className="page-content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
