import DeckCard, { type Deck } from "../components/DeckCard";
import Layout from "./_Layout";

const pubMcq: Deck[] = Array.from({ length: 8 }, (_, i) => ({
  id: `pub-mcq-${i + 1}`,
  title: "Comp. Architecture",
  count: 30,
}));
const pubFlash: Deck[] = Array.from({ length: 4 }, (_, i) => ({
  id: `pub-fc-${i + 1}`,
  title: "Comp. Architecture",
  count: 30,
}));

export default function PublicLibrary() {
  return (
    <Layout>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-semibold">MCQ sets</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pubMcq.map((d) => <DeckCard key={d.id} deck={d} />)}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold">Flashcard sets</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pubFlash.map((d) => <DeckCard key={d.id} deck={d} />)}
          </div>
        </section>
      </main>
    </Layout>
  );
}
