import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useState } from "react";

type User = { name: string; email: string } | null;

export default function Layout({
  user,
  onOpenLogin,
  onOpenSignup,
  onOpenProfile,
  children,
}: {
  user: User;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenProfile: () => void;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 w-full">
          <Link
            to={user ? "/dashboard" : "/"}
            className="brand-font text-2xl sm:text-3xl font-extrabold text-emerald-600"
          >
            Recallify
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Mobile toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
              <button
                onClick={onOpenProfile}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-600 font-bold border shadow-sm"
              >
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </button>
            </div>
          ) : (
            <nav className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="rounded-lg px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
              >
                Log in
              </button>
              <button
                onClick={onOpenSignup}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
              >
                Sign up
              </button>
            </nav>
          )}
        </div>
      </header>

      <div className="flex flex-1 pt-[64px]">
        {user && (
          <>
            {/* Sidebar (desktop) */}
            <aside className="hidden md:block w-60 border-r bg-white">
              <Sidebar />
            </aside>

            {/* Sidebar (mobile, slide-in) */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 flex">
                <div className="w-60 bg-white border-r p-4">
                  <Sidebar />
                </div>
                <div
                  className="flex-1 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
              </div>
            )}
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}