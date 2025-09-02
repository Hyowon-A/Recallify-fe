import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

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
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto flex max-w-[1630px] items-center justify-between px-4 py-3">
          <Link
            to={user ? "/dashboard" : "/"}
            className="brand-font text-3xl font-extrabold text-emerald-600"
          >
            Recallify
          </Link>

          {user ? (
            <button
              onClick={onOpenProfile}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-600 font-bold border shadow-sm"
              aria-label="Open profile"
            >
              {user.name?.[0] ?? "U"}
            </button>
          ) : (
            <nav className="flex items-center gap-3">
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

      {user ? (
        <div className="flex w-full">
          <Sidebar />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      ) : (
        <main className="mx-auto max-w-[1630px] px-6 py-6">{children}</main>
      )}
    </div>
  );
}