import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FinalResultModal from "../components/FinalResultModal";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

type Option = { id: string; option: string; correct?: boolean; explanation?: string,};
type Question = { id: string; question: string; options: Option[]; explanation?: string; interval_hours: number; ef: number; repetitions: number; srsType: string};

type ApiOption = { id?: string; option?: string; correct?: boolean; explanation?: string };
type ApiMcq = { id: string | number; question?: string; prompt?: string; options?: ApiOption[]; explanation?: string; interval_hours: number; ef: number; repetitions: number; srsType: string};

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

// small helper to map API → UI
function mapQuestion(q: ApiMcq, qIdx: number): Question {
  return {
    id: String(q.id ?? qIdx),
    question: q.question ?? "",
    explanation: q.explanation ?? "",
    options: (q.options ?? []).map((o) => ({
      id: o.id ?? "",
      option: o.option ?? "",
      correct: Boolean(o.correct),
      explanation: o.explanation ?? "",
    })),
    interval_hours: q.interval_hours,
    ef: q.ef,
    repetitions: q.repetitions,
    srsType: q.srsType,
  };
}

export default function LearnMCQ() {

  const { setId } = useParams<{ setId: string }>();
  const nav = useNavigate();

  const location = useLocation();
  const state = location.state as { questions: Question[]; deckTitle: string } | undefined;
  const [questions, setQuestions] = useState<Question[] | null>(
    state?.questions ? filterLearnAndDue(state.questions) : null);
  const [deckTitle, setDeckTitle] = useState<string>(state?.deckTitle ?? "");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // quiz UI state
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const [showResults, setShowResults] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (questions || !setId) {
      setLoading(false);
      return;
    }

    const ctl = new AbortController();

    async function run() {
      setLoading(true);
      setErr(null);
      setQuestions(null);
      setIndex(0);
      setSelected(null);
      setRevealed(false);
      setScore(0);

      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/mcq/get/${setId}`, {
          signal: ctl.signal,
        })

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to load deck");
        }

        const data = await res.json();

        const questions: Question[] = (Array.isArray(data) ? data : data.mcqs ?? []).map(mapQuestion);
        setDeckTitle(data.title ?? "MCQ Deck");
        setQuestions(filterLearnAndDue(questions));

      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => ctl.abort();
  }, [setId, nav]);

  // --- Derived data
  const q = questions?.[index];
  const total = questions?.length ?? 0;
  const progressPct = total > 0 ? Math.round((index / total) * 100) : 0;

  const correctId = useMemo(
    () => (q?.options.find((o) => o.correct)?.id ?? ""),
    [q]
  );

  const gradeButtons = useMemo(() => {
    if (!q || !revealed) return [];
  
    const isCorrect = selected === correctId;
  
    const allButtons = [1, 2, 3, 4].map((grade) => {
      const label = [(t("study.label.again")),(t("study.label.hard")),(t("study.label.good")),(t("study.label.easy"))][grade-1] ?? `Grade ${grade}`;
      const intervalText = estimateNextInterval(grade, q.ef, q.repetitions, q.interval_hours);
      return { grade, label, intervalText };
    });
  
    if (isCorrect) {
      // correct → only Good/Easy
      return allButtons.filter((b) => b.grade >= 3);
    } else {
      // incorrect → only Again/Hard
      return allButtons.filter((b) => b.grade <= 2);
    }
  }, [q, revealed, selected, correctId]);

  // --- Keyboard shortcuts: 1..4 select, Enter to submit/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        if (!revealed) {
          const i = Number(e.key) - 1;
          if (q.options[i]) setSelected(q.options[i].id);
        } else {
          handleGrade(Number(e.key));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, revealed, selected]);

  // --- Handlers
  function handleSubmit() {
    if (!q || !selected) return;
    if (selected === correctId) setScore((s) => s + 1);
    setRevealed(true);
  }

  async function handleNext() {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      setShowResults(true);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/score/store`, {
          method: "POST",
          body: JSON.stringify({
            setId: setId,
            score: score,
          }),
        });
  
        if (!res.ok) {
          console.error("Failed to store score:", await res.text());
        }
      } catch (err) {
        console.error("Error storing score:", err);
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  async function handleGrade(grade: number) {
    if (!q) return;

    handleNext();

    await fetchWithAuth(`${API_BASE_URL}/mcq/SRS/update/${q.id}`, {
      method: "POST",
      body: JSON.stringify({
        grade: grade,
        ef: q.ef,
        interval_hours: q.interval_hours,
        repetitions: q.repetitions,
      }),
    })
  }

  function filterLearnAndDue(questions: Question[]): Question[] {
    return questions.filter(q => q.srsType === "newC" || q.srsType === "learn" || q.srsType === "due");
  }  

  const base =
    "w-full text-left rounded-2xl border px-5 py-8 md:py-10 transition";
  const styleFor = (id: string) => {
    if (!revealed)
      return selected === id
        ? `${base} border-emerald-500 bg-emerald-50`
        : `${base} border-gray-200 hover:bg-gray-50`;
    if (id === correctId) return `${base} border-emerald-500 bg-emerald-50`;
    if (id === selected && id !== correctId)
      return `${base} border-red-400 bg-red-50`;
    return `${base} border-gray-200 opacity-70`;
  };

  // --- Render
  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle="Loading…" setId={setId || ""} total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-gray-100 p-6 md:p-8">
          <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-gray-200" />
          <SkeletonOptions />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle="Error" setId={setId || ""} total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-red-50 p-6 text-red-700">
          {err}
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !q) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle={deckTitle || "MCQ Deck"} setId={setId || ""} total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-white p-6 text-gray-600">
          No questions found for this deck.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Header
        deckTitle={deckTitle || "MCQ Deck"}
        setId={setId || ""}
        total={questions.length}
        index={index}
        progressPct={progressPct}
      />

      <FinalResultModal
        mode = "MCQ"
        correct={score}
        total={questions.length}
        open={showResults}
      />

      <div className="rounded-2xl border bg-gray-100 p-6 md:p-8">
        <h2 className="mb-6 text-xl md:text-2xl font-semibold">
          Q{index + 1}. {q.question}
        </h2>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {q.options.map((o) => (
            <button
              key={o.id}
              className={styleFor(o.id)}
              onClick={() => setSelected(o.id)}
              disabled={revealed}
            >
              <span className="mr-3 font-semibold">{o.id}.</span> {o.option}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {!revealed && (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`rounded-lg px-5 py-2 font-semibold text-white ${
                selected
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-300 cursor-not-allowed"
              }`}
            >
              {(t("study.submit"))}
            </button>
          )}
        </div>

        {revealed && q && (
          <div className="mt-4 space-y-3">
            {/* Correct answer explanation */}
            <div className="rounded-lg border border-emerald-200 bg-white p-4 text-sm">
              <div className="font-semibold text-emerald-700 mb-1">✅ Correct Answer</div>
              <div>
                <span className="font-semibold">{q.options.find(o => o.correct)?.id}.</span>{" "}
                {q.options.find(o => o.correct)?.option}
              </div>
              <div className="text-emerald-800 mt-2">
                {q.options.find(o => o.correct)?.explanation || q.explanation || "This is the correct choice."}
              </div>
            </div>

            {/* Wrong choice explanation (only if user picked incorrectly) */}
            {selected && selected !== correctId && (
              <div className="rounded-lg border border-red-200 bg-white p-4 text-sm">
                <div className="font-semibold text-red-700 mb-1">❌ Your Answer</div>
                <div>
                  <span className="font-semibold">{q.options.find(o => o.id === selected)?.id}.</span>{" "}
                  {q.options.find(o => o.id === selected)?.option}
                </div>
                <div className="text-red-800 mt-2">
                  {q.options.find(o => o.id === selected)?.explanation || "This option is incorrect."}
                </div>
              </div>
            )}
          </div>
        )}

        {revealed && gradeButtons.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {gradeButtons.map((btn) => (
              <button
                key={btn.grade}
                onClick={() => handleGrade(btn.grade)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
              >
                {btn.label} <span className="ml-2 text-sm text-emerald-200">({btn.intervalText})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
            <p className="text-sm text-gray-500">
              {total > 0 ? `${total} questions` : "—"}
            </p>
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

function SkeletonOptions() {
  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
      ))}
    </div>
  );
}