import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export type Deck = {
  id: string;
  title: string;
  count: number;
  isPublic?: boolean;
  type: "MCQ" | "FLASHCARD";
  isOwner: boolean;
  newC?: number;   // optional
  learn?: number; // optional
  due?: number;   // optional
};

export default function DeckCard({ deck }: { deck: Deck }) {
  const { i18n, t } = useTranslation();

  const isEnglish = i18n.language.startsWith("en");

  const unit = deck.type === "FLASHCARD" ? t("set.unit.flashcard") : t("set.unit.mcq");

  return (
    <Link
      to={`/sets/${deck.id}`}
      state={deck}
      className="surface-card group flex h-full flex-col rounded-[30px] p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(17,40,31,0.12)]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-900">
              {deck.title}
            </div>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
            {deck.type}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {deck.isPublic ? (
              <span className="font-semibold text-emerald-700">{t("set.visibility.public")}</span>
            ) : (
              <span>{t("set.visibility.private")}</span>
            )}
          </p>
          <div className="text-sm font-medium whitespace-nowrap text-slate-500">
            {!isEnglish
              ? `${deck.count}${unit}`
              : `${deck.count} ${unit}${deck.count !== 1 ? "s" : ""}`}
          </div>
        </div>

        {deck.isOwner === true && (
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-semibold">
            <span className="rounded-2xl bg-sky-50 px-3 py-2 text-center text-sky-700">
              {t("set.status.new")} {deck.newC}
            </span>
            <span className="rounded-2xl bg-amber-50 px-3 py-2 text-center text-amber-700">
              {t("set.status.learn")} {deck.learn}
            </span>
            <span className="rounded-2xl bg-rose-50 px-3 py-2 text-center text-rose-700">
              {t("set.status.due")} {deck.due}
            </span>
          </div>
        )}
      </div>

    </Link>
  );
}
