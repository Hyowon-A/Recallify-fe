import { useEffect, useState, type JSX } from "react";
import { Routes, Route, Navigate} from "react-router-dom";
import Landing from "./pages/Landing";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import Dashboard from "./pages/Dashboard";
import PublicLibrary from "./pages/PublicLibrary";
import LearnMCQ from "./pages/LearnMCQ";
import _Layout from "./pages/_Layout"
import Create from "./pages/Create";
import Layout from "./pages/_Layout";
import DeckDetails from "./pages/DeckDetails";
import EditMCQs from "./pages/EditMCQs";
import { isTokenExpired } from "./jwt";
import EditFlashcards from "./pages/EditFlashcards";
import LearnFlashcard from "./pages/LearnFlashcard";

type User = { name: string; email: string } | null;

function ProtectedRoute({ user, children }: { user: User; children: JSX.Element }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}
function PublicOnlyRoute({ user, children }: { user: User; children: JSX.Element }) {
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState<User>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [profileOpen, setProfileOpen] = useState(false);

  // hydrate user once on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const name  = localStorage.getItem("name");
    
    if (token && email && name && !isTokenExpired(token)) {
      setUser({ name, email });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
      setUser(null);
    }
  }, []);

  // helpers to open modals from Layout
  const openLogin  = () => { setAuthMode("login");  setAuthOpen(true); };
  const openSignup = () => { setAuthMode("signup"); setAuthOpen(true); };
  const openProfile = () => setProfileOpen(true);

  // handle auth success from modal
  const handleAuthSuccess = ({ name, email }: { name: string; email: string }) => {
    // token/email/name should already be in localStorage (set in AuthModal)
    setUser({ name, email });
    setAuthOpen(false);
  };

  // logout (used by ProfileModal)
  const handleLogout = async () => {
    await fetch("/api/user/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });    

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    setUser(null);
    setProfileOpen(false);
  };

  return (
    <>
      <Layout
        user={user}
        onOpenLogin={openLogin}
        onOpenSignup={openSignup}
        onOpenProfile={openProfile}
      >
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute user={user}>
                <Landing onGetStarted={openSignup} />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute user={user}>
                <PublicLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/MCQ/:setId"
            element={
              <ProtectedRoute user={user}>
                <LearnMCQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/Flashcard/:setId"
            element={
              <ProtectedRoute user={user}>
                <LearnFlashcard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sets/:setId"
            element={
              <ProtectedRoute user={user}>
                <DeckDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sets/:setId/MCQ/edit"
            element={
              <ProtectedRoute user={user}>
                <EditMCQs  />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sets/:setId/Flashcard/edit"
            element={
              <ProtectedRoute user={user}>
                <EditFlashcards  />
              </ProtectedRoute>
            }
          />
          <Route path="/create" element={<Create />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {/* mount modals ONCE */}
      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitch={(m) => setAuthMode(m)}
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
