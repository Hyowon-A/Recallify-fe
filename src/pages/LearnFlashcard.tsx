import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import FinalResultModal from "../components/FinalResultModal";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

type Flashcard = { id: string; front: string; back: string; interval_hours: number; ef: number; repetitions: number; srsType: string};
type ApiFlashcard = { id?: string | number; front?: string; back?: string; interval_hours: number; ef: number; repetitions: number; srsType: string};

// map API → UI
function mapCard(c: ApiFlashcard, i: number): Flashcard {
  return { id: String(c.id ?? i), front: c.front ?? "", back: c.back ?? "" , interval_hours: c.interval_hours, ef: c.ef, repetitions: c.repetitions, srsType: c.srsType};
}

function estimateNextInterval(grade: number, ef: number, rep: number, interval: number): string {
  let nextReps = rep;
  let nextEf = ef;
  let nextInterval = 0;

  if (grade < 2) {
    // Forgot
    if (rep === 0) {
      nextInterval = 1;
    } else {
      nextInterval = 24; // reset to 1 day
    }
    nextReps = 0;
    nextEf = Math.max(1.3, ef - 0.2); // drop EF
  } else {
    // Remembered
    nextReps += 1;

    if (nextReps === 1) {
      if (grade === 2) nextInterval = 12;
      else if (grade === 3) nextInterval = 24;
      else if (grade === 4) nextInterval = 48;
    } else if (nextReps === 2) {
      if (grade === 2) nextInterval = 72;
      else if (grade === 3) nextInterval = 144;
      else if (grade === 4) nextInterval = 288;
    } else {
      nextInterval = interval * nextEf;
      if (grade === 2) {
        nextInterval *= 0.8; // hard review skips EF
      } else if (grade === 4) {
        nextInterval *= 1.3; // easy bonus
      }
    }

    // EF update (only if ≥ 3)
    nextEf = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    nextEf = Math.max(1.3, nextEf);
  }

  nextInterval = Math.min(nextInterval, 1440); // 60 days max
  return formatInterval(nextInterval);
}

function formatInterval(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }

  const days = hours / 24;
  if (days < 30) {
    return `${days.toFixed(1)}d`;
  }

  return `${(days / 30).toFixed(1)}mo`;
}

export default function LearnFlashcard() {
  const { setId } = useParams<{ setId: string }>();

  const location = useLocation();
  const state = location.state as { cards?: Flashcard[]; deckTitle?: string } | undefined;

  const [cards, setCards] = useState<Flashcard[] | null>(
    state?.cards ? filterLearnAndDue(state.cards) : null
  );
    const [deckTitle, setDeckTitle] = useState<string>(state?.deckTitle ?? "Flashcard Deck");


  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // session UI state
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { t } = useTranslation();

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

        const res = await fetchWithAuth(`${API_BASE_URL}/flashcard/get/${setId}`, {
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        const arr: Flashcard[] = Array.isArray(data)
          ? data.map(mapCard)
          : (data.cards ?? []).map(mapCard);
        setCards(filterLearnAndDue(arr));
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

  const gradeButtons = useMemo(() => {
    if (!card || !revealed) return [];
  
    return [1, 2, 3, 4].map((grade) => {
      const label = [(t("study.label.again")),(t("study.label.hard")),(t("study.label.good")),(t("study.label.easy"))][grade-1] ?? `Grade ${grade}`;
      const intervalText = estimateNextInterval(grade, card.ef, card.repetitions, card.interval_hours);
      return { grade, label, intervalText };
    });
  }, [card, revealed]);
  
  const progressPct = total > 0 ? Math.round((index / total) * 100) : 0;

  // keyboard: Space flip; 1 = knew; 2 = unsure; Enter = next if revealed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === " " && !revealed) {
        e.preventDefault();
        setRevealed(true);
      } else if (e.key === "1" && revealed) {
        handleGrade(1);
      } else if (e.key === "2" && revealed) {
        handleGrade(2);
      } else if (e.key === "3" && revealed) {
        handleGrade(3);
      } else if (e.key === "4" && revealed) {
        handleGrade(4);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed]);

  function handleFlip() {
    if (!revealed) setRevealed(true);
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

  function filterLearnAndDue(cards: Flashcard[]): Flashcard[] {
    return cards.filter(c => c.srsType === "newC" || c.srsType === "learn" || c.srsType === "due");
  }  

  async function handleGrade(grade: number) {
    if (!card) return;

    handleNext();

    await fetchWithAuth(`${API_BASE_URL}/flashcard/SRS/update/${card.id}`, {
      method: "POST",
      body: JSON.stringify({
        grade,
        ef: card.ef,
        interval_hours: card.interval_hours,
        repetitions: card.repetitions,
      }),
    })
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
        mode="FLASHCARD"
        correct={0}
        total={cards.length}
        open={showResults}
      />

      <div className="rounded-2xl border bg-gray-100 p-6 md:p-8">
        <h2 className="mb-4 text-xl md:text-2xl font-semibold">{(t("set.card"))} {index + 1}</h2>

        {/* card body */}
        <div className="rounded-2xl bg-white border p-6 md:p-10 min-h-[160px] space-y-4">
          <div className="text-lg font-semibold whitespace-pre-wrap">{card.front}</div>
          {revealed && (
            <div className="text-lg text-gray-700 whitespace-pre-wrap border-t pt-4">{card.back}</div>
          )}
        </div>

        {/* controls */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {!revealed ? (
            <button
              onClick={handleFlip}
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              {(t("study.answer"))}
            </button>
          ) : (
            <>
              {gradeButtons.map((btn) => (
                <button
                  key={btn.grade}
                  onClick={() => handleGrade(btn.grade)}
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 border text-sm"
                  title={`Grade ${btn.grade}`}
                >
                  {btn.label} <span className="text-gray-500">({btn.intervalText})</span>
                </button>
              ))}
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
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/sets/${setId}`} className="text-sm text-emerald-700 hover:underline">
            {(t("set.backButton"))}
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