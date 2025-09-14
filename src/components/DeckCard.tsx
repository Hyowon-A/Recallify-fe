import { Link } from "react-router-dom";

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
  const unit = deck.type === "FLASHCARD" ? "card" : "question";

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
            <span className="text-emerald-600 font-medium">Public</span>
          ) : (
            <span className="text-gray-500">Private</span>
          )}
        </p>

        {/* 🔹 Show progress only if available */}
        {(deck.isOwner === true) && (
          <div className="mt-3 flex gap-3 text-xs font-medium">
            <span className="text-blue-600">New {deck.newC}</span>
            <span className="text-yellow-600">Learning {deck.learn}</span>
            <span className="text-red-600">Due {deck.due}</span>
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-gray-600 whitespace-nowrap mt-1">
        {deck.count} {unit}
        {deck.count === 1 ? "" : "s"}
      </div>
    </Link>
  );
}