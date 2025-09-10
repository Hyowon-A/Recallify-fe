import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FinalResultModal from "../components/FinalResultModal";

type Flashcard = { id: string; front: string; back: string };
type ApiFlashcard = { id?: string | number; front?: string; back?: string };

// map API → UI
function mapCard(c: ApiFlashcard, i: number): Flashcard {
  return { id: String(c.id ?? i), front: c.front ?? "", back: c.back ?? "" };
}

export default function LearnFlashcard() {
  const { setId } = useParams<{ setId: string }>();
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";

  const location = useLocation();
  const state = location.state as { cards?: Flashcard[]; deckTitle?: string } | undefined;

  const [cards, setCards] = useState<Flashcard[] | null>(state?.cards ?? null);
  const [deckTitle, setDeckTitle] = useState<string>(state?.deckTitle ?? "Flashcard Deck");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // session UI state
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0); // like "correct" count
  const [showResults, setShowResults] = useState(false);

  // load from API if state missing
  useEffect(() => {
    if (cards || !setId) {
      setLoading(false);
      return;
    }
    const ctl = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setErr(null);
        setCards(null);
        setIndex(0);
        setRevealed(false);
        setKnown(0);

        const res = await fetch(`/api/flashcard/get/${setId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        const arr: Flashcard[] = Array.isArray(data)
          ? data.map(mapCard)
          : (data.cards ?? []).map(mapCard);
        setCards(arr);
        setDeckTitle(data.title ?? "Flashcard Deck");
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => ctl.abort();
  }, [setId]); // same pattern as MCQ

  // derived
  const total = cards?.length ?? 0;
  const card = cards?.[index];
  const progressPct = total > 0 ? Math.round((index / total) * 100) : 0;

  // keyboard: Space flip; 1 = knew; 2 = unsure; Enter = next if revealed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === " ") {
        e.preventDefault();
        setRevealed((r) => !r);
      } else if (e.key === "1" && revealed) {
        handleKnew();
      } else if (e.key === "2" && revealed) {
        handleUnsure();
      } else if (e.key === "Enter" && revealed) {
        handleNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed]);

  function handleFlip() {
    setRevealed((r) => !r);
  }

  function handleNext() {
    if (!cards) return;
    if (index + 1 >= cards.length) {
      setShowResults(true);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  function handleKnew() {
    setKnown((k) => k + 1);
    handleNext();
  }

  function handleUnsure() {
    handleNext();
  }

  // --- render states
  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle="Loading…" setId={setId || ""} total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-gray-100 p-6 md:p-8">
          <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-gray-200" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle="Error" setId={setId || ""} total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-red-50 p-6 text-red-700">{err}</div>
      </div>
    );
  }

  if (!cards || cards.length === 0 || !card) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle={deckTitle} setId={setId || ""} total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-white p-6 text-gray-600">No cards found for this deck.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Header
        deckTitle={deckTitle}
        setId={setId || ""}
        total={cards.length}
        index={index}
        progressPct={progressPct}
      />

      <FinalResultModal
        correct={known}
        total={cards.length}
        open={showResults}
        onRestart={() => {
          setShowResults(false);
          setKnown(0);
          setIndex(0);
          setRevealed(false);
        }}
      />

      <div className="rounded-2xl border bg-gray-100 p-6 md:p-8">
        <h2 className="mb-4 text-xl md:text-2xl font-semibold">Card {index + 1}</h2>

        {/* card body */}
        <div className="rounded-2xl bg-white border p-6 md:p-10 min-h-[160px]">
          {!revealed ? (
            <div className="text-lg whitespace-pre-wrap">{card.front}</div>
          ) : (
            <div className="text-lg whitespace-pre-wrap">{card.back}</div>
          )}
        </div>

        {/* controls */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {!revealed ? (
            <button
              onClick={handleFlip}
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Show answer (Space)
            </button>
          ) : (
            <>
              <button
                onClick={handleUnsure}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                title="2"
              >
                Unsure (2)
              </button>
              <button
                onClick={handleKnew}
                className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
                title="1"
              >
                I knew it (1)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// shared header (same look as MCQ)
function Header({
  deckTitle,
  setId,
  total,
  index,
  progressPct,
}: {
  deckTitle: string;
  setId: string;
  total: number;
  index: number;
  progressPct: number;
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/sets/${setId}`} className="text-sm text-emerald-700 hover:underline">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{deckTitle}</h1>
            <p className="text-sm text-gray-500">{total > 0 ? `${total} cards` : "—"}</p>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="w-24 text-right text-sm text-gray-600">
          {total > 0 ? `${index} / ${total}` : ""}
        </div>
      </div>
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="h-40 md:h-52 animate-pulse rounded-2xl bg-gray-200" />
  );
}