import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate} from "react-router-dom";
import Landing from "./pages/Landing";
import AuthModal from "./components/AuthModal";
import Dashboard from "./pages/Dashboard";
import PublicLibrary from "./pages/PublicLibrary";

export default function App() {
  const [auth, setAuth] = useState<null | "login" | "signup">(null);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Landing onGetStarted={() => setAuth("signup")} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<PublicLibrary />} />
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
