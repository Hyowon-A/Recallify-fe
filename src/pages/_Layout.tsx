import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

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
    <div className="flex min-h-screen flex-col bg-gray-50">
    {/* Fixed Header */}
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur border-b">
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
          >
            {user.name?.[0].toUpperCase() ?? "U"}
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
      <div className="flex flex-1 pt-[57px]">
        <Sidebar />
        <main className="flex-1 ml-60 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </div>
    ) : (
      <main className="flex-1 pt-[57px] overflow-y-auto mx-auto max-w-[1630px] px-6 py-6">
        {children}
      </main>
    )}
     <Footer />
  </div>  
  );
}