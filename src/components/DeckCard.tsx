export type Deck = { id: string; title: string; count: number };

export default function DeckCard({ deck }: { deck: Deck }) {
  return (
    <div className="rounded-2xl bg-gray-200 p-5 hover:bg-gray-300 transition">
      <div className="font-semibold truncate">{deck.title}</div>
      <div className="mt-1 text-sm text-gray-700">{deck.count} questions</div>
    </div>
  );
}
