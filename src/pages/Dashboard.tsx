import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DeckCard from "../components/DeckCard";
import SectionHeader from "../components/SectionHeader";

type Deck = { id: string; title: string; count: number; isPublic: boolean, 
              type: "MCQ" | "FLASHCARD", isOwner: boolean, newC: number, learn: number, due: number};

type ApiDeck = {
  id: string | number;
  title: string;
  count?: number;
  isPublic?: boolean;
  type: "MCQ" | "FLASHCARD";
  isOwner: boolean;
  newC: number;
  learn: number;
  due: number;
};

export default function Dashboard() {
  const nav = useNavigate();
  const [mcq, setMcq] = useState<Deck[] | null>(null);
  const [flash, setFlash] = useState<Deck[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapDeck = (d: ApiDeck): Deck => ({
    id: String(d.id),
    title: d.title,
    count: Number(d.count ?? 0),
    isPublic: Boolean(d.isPublic),
    type: d.type,
    isOwner: d.isOwner,
    newC: d.newC,
    learn: d.learn,
    due: d.due
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const ctl = new AbortController();
  
    async function fetchAll() {
      try {
        setError(null);
        setMcq(null);
        setFlash(null);
  
        const res = await fetch("/api/set/my", {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(await res.text());
  
        const all: ApiDeck[] = await res.json();
  
        const [mcqs, flashes] = all.reduce<[Deck[], Deck[]]>((acc, d) => {
          const deck = mapDeck(d);
          if (d.type === "MCQ") acc[0].push(deck);
          else if (d.type === "FLASHCARD") acc[1].push(deck);
          return acc;
        }, [[], []]);
  
        setMcq(mcqs);
        setFlash(flashes);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load decks");
        setMcq([]);
        setFlash([]);
      }
    }
  
    fetchAll();
    return () => ctl.abort();
  }, []);

const handleAddMCQ = () => nav("/create", { state: { type: "MCQ" } });
const handleAddFlash = () => nav("/create", { state: { type: "FLASHCARD" } });

  return (
    <>
      {/* MCQ sets */}
      <section className="mb-14">
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
              <DeckCard key={d.id} deck={d} />
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