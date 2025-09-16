import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next"

export default function Sidebar() {
  const linkBase =
    "w-full text-center rounded-xl px-4 py-2 font-medium transition";

  const { t } = useTranslation();

  return (
    <aside className="fixed top-[57px] left-0 h-[calc(100vh-57px)] w-60 flex flex-col border-r bg-gray-100">
      <div className="h-10" />

      <nav className="w-full px-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white text-emerald-600" : "hover:bg-white/60"
            }`
          }
        >
          {(t("nav.dashboard"))}
        </NavLink>
      </nav>

      <div className="h-6" />

      <nav className="w-full px-4 space-y-2">
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white text-emerald-600" : "hover:bg-white/60"
            }`
          }
        >
          {(t("nav.library"))}
        </NavLink>
      </nav>

      <div className="flex-1" />
    </aside>
  );
}