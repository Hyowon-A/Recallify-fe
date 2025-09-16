import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

type Question = {
  id: string;
  question: string;
  options: { id: string; option: string; correct?: boolean; explanation?: string }[];
  explanation?: string;
};

type DeckMeta = { id: string; title: string; isPublic?: boolean; type: string};

export default function EditMCQs() {
  const location = useLocation();
  const state = location.state as { meta: DeckMeta; questions: Question[] };

  const [title, setTitle] = useState(state?.meta.title || "");
  const [isPublic, setIsPublic] = useState(state?.meta.isPublic ?? false);
  const [questions, setQuestions] = useState<Question[]>(state?.questions || []);

  const [saving, setSaving] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const nav = useNavigate();

  const { t } = useTranslation();

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

      await fetchWithAuth(`${API_BASE_URL}/set/edit`, {
        method: "POST",
        body: JSON.stringify(body),        
      });
      nav(`/sets/${state.meta.id}`);
    } catch (e) {

    } finally {
      setSaving(false);
    }
  }

  if (!state) return <div className="p-6">No data passed to editor.</div>;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <Link to={`/sets/${state.meta.id}`} className="text-sm text-emerald-700 hover:underline">
            {(t("set.backButton"))}
      </Link>
      <h1 className="text-2xl font-semibold mb-4">{(t("set.edit"))}: {title}</h1>

      <div className="mb-4 flex items-center justify-between gap-3">
        {/* Left side: title input + public/private toggle */}
        <div className="flex items-center gap-3">
          <input
            className="border rounded px-3 py-2 w-full max-w-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
              isPublic ? "bg-white shadow" : "text-gray-600"
            }`}
            onClick={() => setIsPublic(true)}
          >
            {(t("set.visibility.public"))}
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
              !isPublic ? "bg-white shadow" : "text-gray-600"
            }`}
            onClick={() => setIsPublic(false)}
          >
            {(t("set.visibility.private"))}
          </button>
        </div>

        {/* Right side: Save button */}
        <button
          disabled={saving}
          onClick={handleSave}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
            saving ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {saving ? (t("set.save.ing")) : (t("set.save.change"))}
        </button>
      </div>


      <QuestionsPreview 
        questions={questions} 
        onDelete={(idx) => {
          setQuestions((qs) => {
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

function QuestionsPreview({
  questions,
  onDelete,
}: {
  questions: Question[];
  onDelete?: (index: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 mt-5">
      {questions.map((q, idx) => (
        <div key={q.id} className="relative rounded-xl border bg-white p-5">
          {onDelete && (
            <button
              onClick={() => onDelete(idx)}
              className="absolute top-3 right-3 rounded-md bg-white p-2 text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
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
              <summary className="cursor-pointer text-sm text-gray-600">{(t("set.explanation"))}</summary>
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

