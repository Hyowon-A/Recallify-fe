import { useTranslation } from "react-i18next";

export default function SectionHeader({
  title,
  onAdd,
  disabled,
}: {
  title: string;
  onAdd?: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700/80">
          Decks
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          disabled={disabled}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            disabled
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800"
          }`}
        >
          {t("sectionHeader.add")}
        </button>
      )}
    </div>
  );
}
