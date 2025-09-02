import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeckCard from "../components/DeckCard";
import SectionHeader from "../components/SectionHeader";

type Deck = { id: string; title: string; count: number };

type ApiDeck = {
  id: string | number;
  title: string;
  numQuestions?: number;
  type?: "MCQ" | "FLASHCARD";
};

export default function Dashboard() {
  const nav = useNavigate();
  const [mcq, setMcq] = useState<Deck[] | null>(null);
  const [flash, setFlash] = useState<Deck[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // small helper to map API → UI
  function mapDeck(d: ApiDeck): Deck {
    return {
      id: String(d.id),
      title: d.title,
      count: (d.numQuestions ?? 0) as number,
    };
  }

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const ctl = new AbortController();

    async function fetchDecks() {
      try {
        setError(null);
        const [mcqRes, flashRes] = await Promise.all([
          fetch("/api/mcqSet/my", {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctl.signal,
          }),
          fetch("/api/mcqSet/my", {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctl.signal,
          }),
        ]);

        if (!mcqRes.ok || !flashRes.ok) {
          const m1 = mcqRes.ok ? "" : await mcqRes.text();
          const m2 = flashRes.ok ? "" : await flashRes.text();
          throw new Error(m1 || m2 || "Failed to load decks");
        }

        const mcqData: ApiDeck[] = await mcqRes.json();
        const flashData: ApiDeck[] = await flashRes.json();
        setMcq(mcqData.map(mapDeck));
        setFlash(flashData.map(mapDeck));
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Network error");
        setMcq([]);
        setFlash([]);
      }
    }

    fetchDecks();
    return () => ctl.abort();
  }, []);

  const handleAddMCQ = () => nav("/MCQ");
  const handleAddFlash = () => nav("/flashcards/new");

  const openDetails = (d: Deck) => nav(`/decks/${d.id}`, { state: { id: d.id, title: d.title, count: d.count } });

  return (
    <>
      {/* MCQ sets */}
      <section className="mb-8">
        <SectionHeader title="MCQ sets" onAdd={handleAddMCQ} />
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {mcq === null ? (
          <SkeletonGrid />
        ) : mcq.length === 0 ? (
          <EmptyState message="No MCQ sets yet. Click Add to create one." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {mcq.map((d) => (
              <DeckCard key={d.id} deck={d} />
            ))}
          </div>
        )}
      </section>

      {/* Flashcard sets */}
      <section>
        <SectionHeader title="Flashcard sets" onAdd={handleAddFlash} />
        {flash === null ? (
          <SkeletonGrid />
        ) : flash.length === 0 ? (
          <EmptyState message="No flashcard sets yet. Click Add to create one." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {flash.map((d) => (
              <DeckCard key={d.id} deck={d} onOpen={() => openDetails(d)} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
      {message}
    </div>
  );
}