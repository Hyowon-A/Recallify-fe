import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type Option = { id: string; option: string; correct?: boolean; explanation?: string};
type Question = { id: string; question: string; options: Option[]; explanation?: string};


type ApiOption = { id?: string; option?: string; correct?: boolean; explanation?: string };
type ApiMcq = { id: string | number; question?: string; prompt?: string; options?: ApiOption[]; explanation?: string };

// small helper to map API → UI
function mapQuestion(q: ApiMcq, qIdx: number): Question {
  return {
    id: String(q.id ?? qIdx),
    question: q.question ?? "",
    explanation: q.explanation ?? "",
    options: (q.options ?? []).map((o, i) => ({
      id: o.id ?? "",
      option: o.option ?? "",
      correct: Boolean(o.correct),
      explanation: o.explanation ?? "",
    })),
  };
}

export default function LearnMCQ() {
  const { deckId } = useParams<{ deckId: string }>();
  const nav = useNavigate();

  const [deckTitle, setDeckTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // quiz UI state
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!deckId) return;

    const token = localStorage.getItem("token") || "";
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
        const res = await fetch(`/api/mcq/get/${deckId}`, {
          headers: { Authorization: `Bearer ${token}` },
            signal: ctl.signal,
        })

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to load deck");
        }

        const data = await res.json();

        console.log(data)

        const questions: Question[] = (Array.isArray(data) ? data : data.mcqs ?? []).map(mapQuestion);
        setDeckTitle(data.title ?? "MCQ Deck");
        setQuestions(questions);

        // Optional: shuffle options per question (uncomment if desired)
        // qs.forEach(q => q.options.sort(() => Math.random() - 0.5));
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => ctl.abort();
  }, [deckId, nav]);

  // --- Derived data
  const q = questions?.[index];
  const total = questions?.length ?? 0;
  const progressPct = total > 0 ? Math.round((index / total) * 100) : 0;

  const correctId = useMemo(
    () => (q?.options.find((o) => o.correct)?.id ?? ""),
    [q]
  );

  // --- Keyboard shortcuts: 1..4 select, Enter to submit/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (q.options[i]) setSelected(q.options[i].id);
      } else if (e.key === "Enter") {
        if (!revealed && selected) handleSubmit();
        else if (revealed) handleNext();
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

  function handleNext() {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      alert(`Done! Score: ${score}/${questions.length}`);
      setIndex(0);
      setSelected(null);
      setRevealed(false);
      setScore(0);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
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
        <Header deckTitle="Loading…" total={0} index={0} progressPct={0} />
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
        <Header deckTitle="Error" total={0} index={0} progressPct={0} />
        <div className="rounded-2xl border bg-red-50 p-6 text-red-700">
          {err}
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !q) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <Header deckTitle={deckTitle || "MCQ Deck"} total={0} index={0} progressPct={0} />
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
        total={questions.length}
        index={index}
        progressPct={progressPct}
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
          {!revealed ? (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`rounded-lg px-5 py-2 font-semibold text-white ${
                selected
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-300 cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Next
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

      </div>
    </div>
  );
}

function Header({
  deckTitle,
  total,
  index,
  progressPct,
}: {
  deckTitle: string;
  total: number;
  index: number;
  progressPct: number;
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-emerald-700 hover:underline">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{deckTitle}</h1>
            <p className="text-sm text-gray-500">
              {total > 0 ? `${total} questions` : "—"}
            </p>
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border bg-white text-emerald-600 font-bold">
          H
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
          {total > 0 ? `${index + 1} / ${total}` : ""}
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