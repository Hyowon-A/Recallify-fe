import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const linkBase =
    "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold transition";

  const { t } = useTranslation();

  return (
    <aside className="glass-panel sticky top-24 flex h-[calc(100vh-7.5rem)] flex-col rounded-[32px] p-5">
      <div className="mb-8 px-2">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700/80">
          Recallify
        </p>
        <p className="mt-2 max-w-[18ch] text-sm leading-6 text-slate-600">
          Study sets, review sessions, and your public library in one workspace.
        </p>
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
            }`
          }
        >
          <span>{t("nav.dashboard")}</span>
          <span className="text-xs opacity-60">01</span>
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
            }`
          }
        >
          <span>{t("nav.library")}</span>
          <span className="text-xs opacity-60">02</span>
        </NavLink>
      </nav>

      <div className="flex-1" />

      <div className="surface-card rounded-[28px] p-4">
        <p className="text-sm font-semibold text-slate-900">Build sharper decks</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Upload notes, choose difficulty, and turn them into practice material fast.
        </p>
      </div>
    </aside>
  );
}
