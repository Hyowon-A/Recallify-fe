export type Deck = { id: string; title: string; count: number };

export default function DeckCard({
  deck,
  onLearn,
  onEdit,
}: {
  deck: Deck;
  onLearn: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-gray-200 p-5 shadow-sm">
      <div className="font-semibold truncate">{deck.title}</div>
      <div className="mt-1 text-sm text-gray-700">{deck.count} questions</div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onLearn(deck.id)}
          className="rounded-full bg-white px-5 py-2 font-semibold shadow hover:bg-gray-50"
        >
          Learn
        </button>
        <button
          onClick={() => onEdit(deck.id)}
          className="rounded-full bg-white px-5 py-2 font-semibold shadow hover:bg-gray-50"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
