import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileModal from "../components/ProfileModal";
import AuthModal from "../components/AuthModal";

type User = { name: string; email: string } | null;

export default function Layout({ children }: { children: React.ReactNode }) {
  // replace with your real auth state
  const [user, setUser] = useState<User>(null); // null => logged out
  const [profileOpen, setProfileOpen] = useState(false);

  // auth modal
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authOpen, setAuthOpen] = useState(false);

  const navigate = useNavigate();

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setUser(user);
    setAuthOpen(false);
  };  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
  
    if (token && email && name) {
      setUser({ name, email });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SINGLE TOP BAR (no second bar) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto flex max-w-[1630px] items-center justify-between px-4 py-3">
        <Link
          to={user ? "/dashboard" : "/"}
          className="brand-font text-3xl font-extrabold text-emerald-600"
        >
          Recallify
        </Link>


          {/* Right side: auth buttons (logged out) OR avatar (logged in) */}
          {user ? (
            <button
              onClick={() => setProfileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-600 font-bold border shadow-sm"
              aria-label="Open profile"
            >
              {user.name?.[0] ?? "U"}
            </button>
          ) : (
            <nav className="flex items-center gap-3">
              <button
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="rounded-lg px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
              >
                Log in
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
              >
                Sign up
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* MAIN AREA */}
      {user ? (
        <div className="flex w-full">
          <Sidebar />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      ) : (
        <main className="mx-auto max-w-[1630px] px-6 py-6">{children}</main>
      )}


      {/* Modals */}
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
        onSave={(u) => { setUser(u); }}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          localStorage.removeItem("name");
          setUser(null);
          setProfileOpen(false);
          navigate("/");
        }}
      />
    </div>
  );
}