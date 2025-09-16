import { useEffect, useState, type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/_Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import PublicLibrary from "./pages/PublicLibrary";
import LearnMCQ from "./pages/LearnMCQ";
import LearnFlashcard from "./pages/LearnFlashcard";
import DeckDetails from "./pages/DeckDetails";
import EditMCQs from "./pages/EditMCQs";
import EditFlashcards from "./pages/EditFlashcards";
import Create from "./pages/Create";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import { getUserFromToken, isTokenExpired } from "./jwt";
import { refreshIfNeeded, fetchWithAuth } from "./auth";
import { API_BASE_URL } from "./config";

type User = { name: string; email: string } | null;

export default function App() {
  const [user, setUser] = useState<User>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [profileOpen, setProfileOpen] = useState(false);

  // Hydrate user on load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const at = (await refreshIfNeeded()) ?? localStorage.getItem("token");
        if (cancelled) return;

        if (at && !isTokenExpired(at)) {
          const u = getUserFromToken(at);
          if (u) {
            setUser(u);
            localStorage.setItem("email", u.email);
            if (u.name) localStorage.setItem("name", u.name);
            return;
          }
        }

        // not logged in
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        setUser(null);
      } finally {
        if (!cancelled) setAuthReady(true); // unblock routing
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Openers
  const openLogin  = () => { setAuthMode("login");  setAuthOpen(true); };
  const openSignup = () => { setAuthMode("signup"); setAuthOpen(true); };
  const openProfile = () => setProfileOpen(true);

  // Auth success
  const handleAuthSuccess = ({ name, email }: { name: string; email: string }) => {
    const u  = { name: name, email: email };
    setUser(u);
    localStorage.setItem("email", u.email);
    localStorage.setItem("name", u.name);
    setAuthOpen(false);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/user/logout`, { method: "POST" });
    } catch {} finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
      setUser(null);
      setProfileOpen(false);
    }
  };

  // Small helpers for protected pages
  const Protected = ({ children }: { children: JSX.Element }) =>
    !authReady ? <div /> : user ? children : <Navigate to="/" replace />;

  return (
    <>
      <Layout user={user} onOpenLogin={openLogin} onOpenSignup={openSignup} onOpenProfile={openProfile}>
        <Routes>
          <Route
            path="/"
            element={
              !authReady ? (
                <Landing onGetStarted={openSignup} />
              ) : user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Landing onGetStarted={openSignup} />
              )
            }
          />

          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/library" element={<Protected><PublicLibrary /></Protected>} />
          <Route path="/learn/MCQ/:setId" element={<Protected><LearnMCQ /></Protected>} />
          <Route path="/learn/Flashcard/:setId" element={<Protected><LearnFlashcard /></Protected>} />
          <Route path="/sets/:setId" element={<Protected><DeckDetails /></Protected>} />
          <Route path="/sets/:setId/MCQ/edit" element={<Protected><EditMCQs /></Protected>} />
          <Route path="/sets/:setId/Flashcard/edit" element={<Protected><EditFlashcards /></Protected>} />
          <Route path="/create" element={<Protected><Create /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitch={setAuthMode}
          onSuccess={handleAuthSuccess}
        />
      )}

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user ?? { name: "", email: "" }}
        onLogout={handleLogout}
        setUser={setUser}
      />
    </>
  );
}