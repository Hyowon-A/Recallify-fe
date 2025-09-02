import { useEffect, useState, type JSX } from "react";
import { Routes, Route, Navigate} from "react-router-dom";
import Landing from "./pages/Landing";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import Dashboard from "./pages/Dashboard";
import PublicLibrary from "./pages/PublicLibrary";
import LearnMCQ from "./pages/LearnMCQ";
import _Layout from "./pages/_Layout"
import CreateMCQs from "./pages/CreateMCQs";
import Layout from "./pages/_Layout";
import DeckDetails from "./pages/DeckDetails";

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
    if (token && email && name) setUser({ name, email });
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
  const handleLogout = () => {
    localStorage.removeItem("token");
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
            path="/learn/:deckId"
            element={
              <ProtectedRoute user={user}>
                <LearnMCQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks/:setId"
            element={
              <ProtectedRoute user={user}>
                <DeckDetails />
              </ProtectedRoute>
            }
          />
          <Route path="/MCQ" element={<CreateMCQs />} />
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
        onSave={(u) => setUser(u)}
        onLogout={handleLogout}
      />
    </>
  );
}
