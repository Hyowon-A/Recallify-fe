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

  const unit = deck.type === "FLASHCARD" ? (t("set.unit.flashcard")) : (t("set.unit.mcq"));
  return (
    <Link
      to={`/sets/${deck.id}`}
      state={deck}
      className="flex justify-between items-start rounded-3xl bg-gray-200 p-6 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div>
        <div className="text-xl font-semibold">{deck.title}</div>
        <p className="mt-2 text-gray-700 text-sm">
          {deck.isPublic ? (
            <span className="text-emerald-600 font-medium">{(t("set.visibility.public"))}</span>
          ) : (
            <span className="text-gray-500">{(t("set.visibility.private"))}</span>
          )}
        </p>

        {/* 🔹 Show progress only if available */}
        {(deck.isOwner === true) && (
          <div className="mt-3 flex gap-3 text-xs font-medium">
            <span className="text-blue-600">{(t("set.status.new"))} {deck.newC}</span>
            <span className="text-yellow-600">{(t("set.status.learn"))} {deck.learn}</span>
            <span className="text-red-600">{(t("set.status.due"))} {deck.due}</span>
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-gray-600 whitespace-nowrap mt-1">
        {!isEnglish
          ? `${deck.count}${unit}`
          : `${deck.count} ${unit}${deck.count !== 1 ? "s" : ""}`}
      </div>
    </Link>
  );
}