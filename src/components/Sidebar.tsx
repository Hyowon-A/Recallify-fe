import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkBase =
    "w-full text-left rounded-xl px-4 py-2 font-medium transition";
  return (
    <aside className="w-60 shrink-0 border-r bg-gray-100">
      <div className="px-6 py-6">
        <div className="text-2xl font-extrabold text-emerald-600">Recallify</div>
      </div>
      <nav className="px-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "bg-white text-emerald-600" : "hover:bg-white/60"}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "bg-white text-emerald-600" : "hover:bg-white/60"}`
          }
        >
          Public Library
        </NavLink>
      </nav>
    </aside>
  );
}
