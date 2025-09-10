import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type Flashcard = {
  id: string;
  front: string;
  back: string;
};

type DeckMeta = { id: string; title: string; isPublic?: boolean, type: string};

export default function EditFlashcards() {
  const location = useLocation();
  const state = location.state as { meta: DeckMeta; cards: Flashcard[] };

  const [title, setTitle] = useState(state?.meta.title || "");
  const [isPublic, setIsPublic] = useState(state?.meta.isPublic ?? false);
  const [cards, setCards] = useState<Flashcard[]>(state?.cards || []);

  const [saving, setSaving] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const token = localStorage.getItem("token");

  const nav = useNavigate();

  async function handleSave() {
    setSaving(true);

    try {
      const body: any = {
        setId: state.meta.id,
        type: state.meta.type,
      }

      if (title !== state.meta.title && title.trim() !== "") {
        body.title = title;
      }
      if (isPublic !== state.meta.isPublic) {
        body.isPublic = isPublic;
      }
      if (deletedIds.size > 0) {
        body.deletedIds = Array.from(deletedIds);
      }

      const res = await fetch("/api/set/edit", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),        
      });
      nav(`/sets/${state.meta.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (!state) return <div className="p-6">No data passed to editor.</div>;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <Link to={`/sets/${state.meta.id}`} className="text-sm text-emerald-700 hover:underline">
            ← Back
      </Link>
      <h1 className="text-2xl font-semibold mb-4">Edit {title}</h1>

      <div className="mb-4 flex items-center justify-between gap-3">
        {/* Left side: title input + public/private toggle */}
        <div className="flex items-center gap-3">
          <input
            className="border rounded px-3 py-2 w-full max-w-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                isPublic ? "bg-white shadow" : "text-gray-600"
              }`}
              onClick={() => setIsPublic(true)}
            >
              Public
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                !isPublic ? "bg-white shadow" : "text-gray-600"
              }`}
              onClick={() => setIsPublic(false)}
            >
              Private
            </button>
          </div>
        </div>

        {/* Right side: Save button */}
        <button
          disabled={saving}
          onClick={handleSave}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
            saving ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>


      <FlashcardsPreview 
        cards={cards} 
        onDelete={(idx) => {
          setCards((qs) => {
            const qToDelete = qs[idx];
            if (qToDelete) {
              setDeletedIds((prev) => new Set(prev).add(qToDelete.id));
            }
            return qs.filter((_, i) => i !== idx);
          });
      }} />
    </div>
  );
}

function FlashcardsPreview({ 
  cards,
  onDelete,
}: { 
  cards: Flashcard[];
  onDelete?: (index: number) => void;
}) {
  return (
    <div className="space-y-4 mt-5">
      {cards.map((c, idx) => (
        <div key={c.id} className="relative rounded-xl border bg-white p-5">
          {onDelete && (
            <button
              onClick={() => onDelete(idx)}
              className="absolute top-3 right-3 z-10 rounded-md bg-white p-2 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
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