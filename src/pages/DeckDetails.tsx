import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import DeckDeleteModal from "../components/DeckDeleteModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DeckType = "MCQ" | "FLASHCARD";

type DeckMeta = { id: string; title: string; count: number; isPublic?: boolean; type: DeckType; isOwner: boolean };
type ApiDeckMeta = { id: string | number; title: string; count?: number; isPublic?: boolean; type: DeckType; isOwner: boolean };

type Option = { id: string; option: string; correct?: boolean; explanation?: string };
type Question = { id: string; question: string; options: Option[]; explanation?: string };
type ApiOption = { id?: string; option?: string; text?: string; correct?: boolean; explanation?: string };
type ApiMcq = { id: string | number; question?: string; prompt?: string; options?: ApiOption[]; explanation?: string };

type Flashcard = { id: string; front: string; back: string };
type ApiFlashcard = { id: string | number; front?: string; back?: string };

const mapMeta = (d: ApiDeckMeta): DeckMeta => ({
  id: String(d.id),
  title: d.title,
  count: Number(d.count ?? 0),
  isPublic: Boolean(d.isPublic ?? false),
  type: d.type,
  isOwner: d.isOwner,
});

const mapQuestion = (q: ApiMcq, idx: number): Question => ({
  id: String(q.id ?? idx),
  question: q.question ?? q.prompt ?? "",
  explanation: q.explanation ?? "",
  options: (q.options ?? []).map((o, i) => ({
    id: o.id ?? String.fromCharCode(65 + i),
    option: o.option ?? o.text ?? "",
    correct: !!o.correct,
    explanation: o.explanation ?? "",
  })),
});

const mapCard = (c: ApiFlashcard, idx: number): Flashcard => ({
  id: String(c.id ?? idx),
  front: c.front ?? "",
  back: c.back ?? "",
});

export default function DeckDetails() {
  const { setId } = useParams<{ setId: string }>();
  const nav = useNavigate();
  const location = useLocation();
  const passedMeta = (location.state as DeckMeta | undefined) ?? undefined;

  const [meta, setMeta] = useState<DeckMeta | null>(passedMeta ?? null);

  // Content states
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [cards, setCards] = useState<Flashcard[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("token") ?? "";
  const [scores, setScores] = useState<{ score: number; takenAt: string }[]>([]); // MCQ only

  const handleDelete = async () => {
    if (!setId) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      await fetch(`/api/set/delete/${setId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      nav("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  // Fetch meta if not provided (hybrid)
  useEffect(() => {
    if (!setId) return;
    const ctl = new AbortController();
    async function loadMetaIfNeeded() {
      if (meta) return;
      try {
        const res = await fetch(`/api/set/meta/${setId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(await res.text());
        const data: ApiDeckMeta = await res.json();
        setMeta(mapMeta(data));
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Failed to load deck info");
      }
    }
    loadMetaIfNeeded();
    return () => ctl.abort();
  }, [setId, meta, token]);

  // Fetch content (MCQs or Flashcards) after we know meta.type
  useEffect(() => {
    if (!setId || !meta?.type) return;
    const ctl = new AbortController();

    async function loadContent() {
      setLoading(true);
      setErr(null);
      try {
        if (meta?.type === "MCQ") {
          const res = await fetch(`/api/mcq/get/${setId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctl.signal,
          });
          if (!res.ok) throw new Error(await res.text());
          const data: ApiMcq[] | { mcqs: ApiMcq[] } = await res.json();
          const mcqs = Array.isArray(data) ? data : (data.mcqs ?? []);
          setQuestions(mcqs.map(mapQuestion));
          setCards(null);
        } else {
          const res = await fetch(`/api/flashcard/get/${setId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctl.signal,
          });
          if (!res.ok) throw new Error(await res.text());
          const data: ApiFlashcard[] | { cards: ApiFlashcard[] } = await res.json();
          const arr = Array.isArray(data) ? data : (data.cards ?? []);
          setCards(arr.map(mapCard));
          setQuestions(null);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
    return () => ctl.abort();
  }, [setId, meta?.type, token]);

  // Scores only for MCQ sets
  useEffect(() => {
    if (!setId || meta?.type !== "MCQ") return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/score/get/${setId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setScores(data || []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [setId, meta?.type, token]);

  const startStudy = () => {
    if (!setId) return;
    if (meta?.type === "FLASHCARD") {
      nav(`/learn/Flashcard/${setId}`, { state: { mode: "flashcard", cards, deckTitle: meta?.title } });
    } else {
      nav(`/learn/MCQ/${setId}`, { state: { mode: "mcq", questions, deckTitle: meta?.title } });
    }
  };

  const editDeck = () => {
    if (meta?.type === "FLASHCARD") {
      nav(`/sets/${setId}/Flashcard/edit`, { state: { meta, cards }});
    } else {
      nav(`/sets/${setId}/MCQ/edit`, { state: { meta, questions, cards }});
    }
  }

  const deleteDeck = () => setDeleteOpen(true);

  // Loading skeleton
  const contentMissing =
    (meta?.type === "MCQ" && !questions) || (meta?.type === "FLASHCARD" && !cards);

  if ((loading && contentMissing) || !meta) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-6">
        <MetaHeader meta={meta ?? { id: setId ?? "", title: "Loading…", count: 0, type: "MCQ", isOwner: false}} />
        <QuestionsSkeleton />
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <MetaHeader
        meta={meta}
        onStart={startStudy}
        onEdit={editDeck}
        onDelete={deleteDeck}
      />

      {/* Score chart only for MCQ */}
      {meta.type === "MCQ" && (
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">Score Progress (Last 5 Attempts)</h2>
          {scores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={scores.slice(-5).map((s) => ({
                  date: new Date(s.takenAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
                  score: s.score,
                }))}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-500">No attempts yet. Try this quiz to see progress here.</div>
          )}
        </div>
      )}

      {meta.type === "MCQ" && questions && <QuestionsPreview questions={questions} />}
      {meta.type === "FLASHCARD" && cards && <FlashcardsPreview cards={cards} />}

      <DeckDeleteModal
        open={deleteOpen}
        itemName={meta?.title}
        loading={deleting}
        onDelete={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function MetaHeader({
  meta,
  onStart,
  onEdit,
  onDelete,
}: {
  meta: DeckMeta;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const unit = meta.type === "FLASHCARD" ? "card" : "question";
  const startLabel = meta.type === "FLASHCARD" ? "Start review" : "Start quiz";
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <div className="mb-1">
          <Link to="/dashboard" className="text-sm text-emerald-700 hover:underline">
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-semibold">{meta.title}</h1>
        <div className="mt-1 text-sm text-gray-600">
          {meta.count} {unit}
          {meta.count === 1 ? "" : "s"} ·{" "}
          {meta.isPublic ? <span className="text-emerald-700">Public</span> : <span>Private</span>}
        </div>
      </div>

      <div className="flex gap-2">
        {onEdit && meta.isOwner && (
          <button onClick={onEdit} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Edit
          </button>
        )}
        {onDelete && meta.isOwner && (
          <button onClick={onDelete} className="rounded-lg border p-2 text-red-500 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {onStart && meta.isOwner && (
          <button
            onClick={onStart}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {startLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionsPreview({ questions }: { questions: Question[] }) {
  return (
    <div className="space-y-4 mt-5">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border bg-white p-5">
          <div className="mb-3 font-medium">
            Q{idx + 1}. {q.question}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <div
                key={o.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  o.correct ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <span className="mr-2 font-semibold">{o.id}.</span>
                {o.option}
              </div>
            ))}
          </div>

          {(q.explanation || q.options.some((o) => o.explanation)) && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-600">Explanations</summary>
              <div className="mt-2 space-y-2 text-sm">
                {q.explanation && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-emerald-800">
                    {q.explanation}
                  </div>
                )}
                {q.options.map(
                  (o) =>
                    o.explanation && (
                      <div
                        key={o.id}
                        className={`rounded border p-2 ${
                          o.correct
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className="mr-2 font-semibold">{o.id}.</span>
                        {o.explanation}
                      </div>
                    )
                )}
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

function FlashcardsPreview({ cards }: { cards: Flashcard[] }) {
  return (
    <div className="space-y-4 mt-5">
      {cards.map((c, idx) => (
        <div key={c.id} className="rounded-xl border bg-white p-5">
          <div className="mb-2 text-sm text-gray-500">Card {idx + 1}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="text-xs uppercase text-gray-500 mb-1">Front</div>
              <div className="text-sm whitespace-pre-wrap">{c.front}</div>
            </div>
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="text-xs uppercase text-gray-500 mb-1">Back</div>
              <div className="text-sm whitespace-pre-wrap">{c.back}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionsSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-white p-4">
          <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}