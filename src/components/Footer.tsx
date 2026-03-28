export default function Footer() {
  return (
    <footer className="px-3 pb-4 pt-2 sm:px-5">
      <div className="glass-panel mx-auto flex max-w-[1400px] flex-col gap-4 rounded-[28px] px-5 py-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="brand-font text-lg font-bold text-slate-900">Recallify</p>
          <p className="mt-1">© {new Date().getFullYear()} Recallify. All rights reserved.</p>
        </div>
        <div className="flex gap-5">
          <a
            href="https://github.com/Hyowon-A/Recallify#"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-emerald-700"
          >
            GitHub
          </a>
          <span className="text-slate-300">About</span>
          <span className="text-slate-300">Privacy</span>
        </div>
      </div>
    </footer>
  );
}
