import { Link } from "react-router-dom";

export type Deck = {
  id: string;
  title: string;
  count: number;
  isPublic?: boolean;
};

export default function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Link
      to={`/sets/${deck.id}`}
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
      </div>

      <div className="text-sm font-medium text-gray-600 whitespace-nowrap mt-1">
        {deck.count} question{deck.count === 1 ? "" : "s"}
      </div>
    </Link>
  );
}