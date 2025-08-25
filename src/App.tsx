import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [auth, setAuth] = useState<null | "login" | "signup">(null);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="brand-font text-2xl font-extrabold text-emerald-600">
            Recallify
          </Link>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setAuth("login")}
              className="rounded-lg px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
            >
              Log in
            </button>
            <button
              onClick={() => setAuth("signup")}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
            >
              Sign up
            </button>
          </nav>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Landing onGetStarted={() => setAuth("signup")} />} />
      </Routes>

      {/* Auth Modal */}
      {auth && (
        <AuthModal
          mode={auth}
          onClose={() => setAuth(null)}
          onSwitch={(m) => setAuth(m)}
        />
      )}
    </div>
  );
}
