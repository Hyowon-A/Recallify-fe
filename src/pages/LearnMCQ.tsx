import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Option = { id: string; text: string; correct?: boolean };
type Question = { id: string; prompt: string; options: Option[]; explanation?: string };

const sample: Question[] = [
  {
    id: "q1",
    prompt: "What is the main function of the ALU?",
    options: [
      { id: "A", text: "Performs arithmetic and logic", correct: true },
      { id: "B", text: "Stores long-term data" },
      { id: "C", text: "Handles I/O scheduling" },
      { id: "D", text: "Renders graphics" },
    ],
    explanation: "ALU = Arithmetic Logic Unit.",
  },
  {
    id: "q2",
    prompt: "Which memory is volatile?",
    options: [
      { id: "A", text: "SSD" },
      { id: "B", text: "HDD" },
      { id: "C", text: "RAM", correct: true },
      { id: "D", text: "Optical disk" },
    ],
  },
];

export default function LearnMCQ({
  deckTitle = "Comp. Architecture",
  questions = sample,
}: {
  deckTitle?: string;
  questions?: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[index];
  const total = questions.length;
  const progressPct = Math.round(((index) / total) * 100);

  const correctId = useMemo(
    () => q.options.find(o => o.correct)?.id ?? "",
    [q],
  );

  // Keyboard shortcuts: 1..4 select, Enter to submit/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["1","2","3","4"].includes(e.key)) {
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

  function handleSubmit() {
    if (!selected) return;
    const isCorrect = selected === correctId;
    if (isCorrect) setScore(s => s + 1);
    setRevealed(true);
  }

  function handleNext() {
    if (index + 1 >= total) {
      // finished — you could navigate to a summary page here
      alert(`Done! Score: ${score}/${total}`);
      setIndex(0); setSelected(null); setRevealed(false); setScore(0);
      return;
    }
    setIndex(i => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  const base =
    "w-full text-left rounded-2xl border px-5 py-8 md:py-10 transition";
  const styleFor = (id: string) => {
    if (!revealed) return selected === id
      ? `${base} border-emerald-500 bg-emerald-50`
      : `${base} border-gray-200 hover:bg-gray-50`;
    // revealed:
    if (id === correctId) return `${base} border-emerald-500 bg-emerald-50`;
    if (id === selected && id !== correctId) return `${base} border-red-400 bg-red-50`;
    return `${base} border-gray-200 opacity-70`;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      {/* Header row: back + deck title + avatar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-emerald-700 hover:underline">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{deckTitle}</h1>
            <p className="text-sm text-gray-500">{total} questions</p>
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border bg-white text-emerald-600 font-bold">
          H
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="w-24 text-right text-sm text-gray-600">
          {index + 1} / {total}
        </div>
      </div>

      {/* MCQ Card */}
      <div className="rounded-2xl border bg-gray-100 p-6 md:p-8">
        <h2 className="mb-6 text-xl md:text-2xl font-semibold">
          Q{index + 1}. {q.prompt}
        </h2>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              className={styleFor(o.id)}
              onClick={() => setSelected(o.id)}
              disabled={revealed}
            >
              <span className="mr-3 font-semibold">{o.id}.</span> {o.text}
            </button>
          ))}
        </div>

        {/* Footer actions */}
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

        {/* Explanation */}
        {revealed && q.explanation && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4 text-sm text-emerald-800">
            {q.explanation}
          </div>
        )}
      </div>
    </div>
  );
}