import { Link } from "react-router-dom";
export type Deck = { id: string; title: string; count: number };

export default function DeckCard({ 
  deck,
  onOpen,
}: { 
  deck: Deck;
  onOpen?: (id: string) => void | Promise<void>;
}) {
  return (
    <Link
      to={`/decks/${deck.id}`}
      className="block rounded-2xl bg-white p-5 shadow-sm border hover:shadow-md transition cursor-pointer"
    >
      <div className="font-semibold truncate">{deck.title}</div>
      <div className="mt-1 text-sm text-gray-700">{deck.count} questions</div>
    </Link>
  );
}