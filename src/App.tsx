import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppShell } from "./components/AppShell";
import { useSettings, applyTheme } from "./store/settings";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Conversation from "./pages/Conversation";
import SessionDetail from "./pages/SessionDetail";
import Review from "./pages/Review";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
  const { onboarded, theme } = useSettings();

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="/talk/:scenarioId" element={onboarded ? <Conversation /> : <Navigate to="/welcome" replace />} />
        {!onboarded && <Route path="/" element={<Landing />} />}
        <Route element={onboarded ? <AppShell /> : <Navigate to="/" replace />}>
          {onboarded && <Route path="/" element={<Home />} />}
          <Route path="/review" element={<Review />} />
          <Route path="/history" element={<History />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
