import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeckCard from "../components/DeckCard";
import SectionHeader from "../components/SectionHeader";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

type Deck = {
  id: string;
  title: string;
  count: number;
  isPublic: boolean;
  type: "MCQ" | "FLASHCARD";
  isOwner: boolean;
  newC: number;
  learn: number;
  due: number;
};

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

  const [isLoading, setIsLoading] = useState(true);

  const { t } = useTranslation();

  const mapDeck = (d: ApiDeck): Deck => ({
    id: String(d.id),
    title: d.title,
    count: Number(d.count ?? 0),
    isPublic: Boolean(d.isPublic),
    type: d.type,
    isOwner: d.isOwner,
    newC: d.newC,
    learn: d.learn,
    due: d.due,
  });

  useEffect(() => {
    const ctl = new AbortController();

    async function fetchAll() {
      try {
        setError(null);
        setMcq(null);
        setFlash(null);
        setIsLoading(true);

        const res = await fetchWithAuth(`${API_BASE_URL}/set/my`, {
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(await res.text());

        const all: ApiDeck[] = await res.json();

        const [mcqs, flashes] = all.reduce<[Deck[], Deck[]]>(
          (acc, d) => {
            const deck = mapDeck(d);
            if (d.type === "MCQ") acc[0].push(deck);
            else if (d.type === "FLASHCARD") acc[1].push(deck);
            return acc;
          },
          [[], []],
        );

        setMcq(mcqs);
        setFlash(flashes);
        setIsLoading(false);
      } catch (e: any) {
        if (e.name !== "AbortError")
          setError(e.message || "Failed to load decks");
        setMcq([]);
        setFlash([]);
      }
    }

    fetchAll();
    return () => ctl.abort();
  }, []);

  const handleAddMCQ = () => nav("/create", { state: { type: "MCQ" } });
  const handleAddFlash = () => nav("/create", { state: { type: "FLASHCARD" } });
  const totalDecks = (mcq?.length ?? 0) + (flash?.length ?? 0);
  const totalItems = [...(mcq ?? []), ...(flash ?? [])].reduce(
    (sum, deck) => sum + deck.count,
    0,
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="glass-panel rounded-[36px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700/80">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              Your study workspace
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Keep MCQs and flashcards organized in one place, then review what
              is new, in progress, and due.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Total decks", String(totalDecks)],
              ["Study items", String(totalItems)],
              [
                "Public sets",
                String(
                  [...(mcq ?? []), ...(flash ?? [])].filter(
                    (deck) => deck.isPublic,
                  ).length,
                ),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[24px] bg-white/85 px-4 py-4 text-center soft-ring"
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <section className="surface-card rounded-[34px] px-6 py-6 sm:px-8">
          <SectionHeader
            title={t("sectionHeader.setType.mcq")}
            onAdd={handleAddMCQ}
          />
          {isLoading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : mcq?.length === 0 ? (
            <EmptyState message={t("dashboard.noMcq")} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {mcq?.map((d) => (
                <DeckCard key={d.id} deck={d} />
              ))}
            </div>
          )}
        </section>

        <section className="surface-card rounded-[34px] px-6 py-6 sm:px-8">
          <SectionHeader
            title={t("sectionHeader.setType.flashcard")}
            onAdd={handleAddFlash}
          />
          {isLoading ? (
            <SkeletonGrid />
          ) : flash?.length === 0 ? (
            <EmptyState message={t("dashboard.noFlash")} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {flash?.map((d) => (
                <DeckCard key={d.id} deck={d} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-[28px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(228,236,229,0.9))]"
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-8 text-slate-600">
      {message}
    </div>
  );
}
