import { Link, NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const authNavLinkBase =
    "rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(13,154,107,0.14),_transparent_58%)]" />
      <header className="fixed left-0 right-0 top-0 z-30 px-3 pt-3 sm:px-5">
        <div className="glass-panel mx-auto max-w-[1400px] rounded-[28px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={user ? "/dashboard" : "/"}
              className="brand-font text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              <span className="text-slate-900">Recall</span>
              <span className="text-emerald-600">ify</span>
            </Link>
            {user ? (
              <>
                <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 sm:order-2 sm:w-auto sm:flex-1 sm:justify-center sm:pb-0">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `${authNavLinkBase} ${
                        isActive
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "bg-white/75 text-slate-700 hover:bg-white hover:text-slate-900"
                      }`
                    }
                  >
                    {t("nav.dashboard")}
                  </NavLink>
                  <NavLink
                    to="/library"
                    className={({ isActive }) =>
                      `${authNavLinkBase} ${
                        isActive
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "bg-white/75 text-slate-700 hover:bg-white hover:text-slate-900"
                      }`
                    }
                  >
                    {t("nav.library")}
                  </NavLink>
                </nav>
                <button
                  onClick={onOpenProfile}
                  aria-label={t("profile.profile")}
                  className="order-2 ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-sm font-bold text-white shadow-lg shadow-emerald-200/70 transition hover:scale-[1.03] sm:order-3"
                >
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </button>
              </>
            ) : (
              <nav className="ml-auto flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  {t("landing.login")}
                </button>
                <button
                  onClick={onOpenSignup}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t("landing.signup")}
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 px-3 pb-8 pt-32 sm:px-5 sm:pt-28">
        <main className="min-w-0 flex-1 overflow-y-auto rounded-[32px]">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
