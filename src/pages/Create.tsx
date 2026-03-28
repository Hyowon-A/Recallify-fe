import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

export default function CreateMCQs() {
  const loc = useLocation() as { state?: { type?: "MCQ" | "FLASHCARD" } };

  const [deckTitle, setDeckTitle] = useState("");
  const [deckType, setDeckType] = useState<"MCQ" | "FLASHCARD">(
    loc.state?.type ?? "MCQ",
  );
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  const [file, setFile] = useState<File | null>(null);
  const [paste, setPaste] = useState("");

  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const [level, setLevel] = useState<"easy" | "normal" | "hard">("normal");

  const navigate = useNavigate();

  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language.startsWith("en");
  const pageTitle =
    deckType === "MCQ" ? t("create.setType.mcq") : t("create.setType.flashcard");

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleGenerate() {
    if (!deckTitle.trim()) {
      alert(t("create.titleMissing"));
      return;
    }
    if (activeTab === "upload" && !file) {
      alert(t("create.fileMissing"));
      return;
    }
    if (activeTab === "paste" && paste.trim().length < 20) {
      alert("Paste a bit more text.");
      return;
    }

    setLoading(true);

    // 1) Create the set
    const createRes = await fetchWithAuth(`${API_BASE_URL}/set/create`, {
      method: "POST",
      body: JSON.stringify({
        title: deckTitle,
        isPublic: isPublic,
        count: count,
      }),
    });

    if (!createRes.ok) {
      const msg = await createRes.text();
      throw new Error(`Create set failed: ${msg}`);
    }

    const { id: setId } = await createRes.json();

    // 2) Generate MCQs for that set
    const form = new FormData();
    form.append("setId", String(setId));
    form.append("count", String(count));
    form.append("level", String(level));
    if (file) form.append("file", file);
    if (paste && paste.trim()) form.append("text", paste.trim());

    const genUrl =
      deckType === "MCQ"
        ? `${API_BASE_URL}/mcq/generate-from-pdf`
        : `${API_BASE_URL}/flashcard/generate-from-pdf`;

    const genRes = await fetchWithAuth(genUrl, {
      method: "POST",
      body: form,
    });

    if (!genRes.ok) throw new Error(await genRes.text());

    if (!genRes.ok) {
      const msg = await genRes.text();
      throw new Error(`Generate MCQs failed: ${msg}`);
    }

    const data = await genRes.json();
    navigate("/dashboard");
    return { setId, mcqs: data.mcqs ?? data };
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="glass-panel rounded-[36px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700/80">
              Create deck
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              {pageTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {t("create.uploadText")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field-shell flex min-w-[220px] items-center rounded-2xl px-4 py-3">
              <input
                placeholder={t("create.title")}
                className="w-full bg-transparent outline-none"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
              />
            </label>
            <label className="field-shell flex min-w-[220px] items-center rounded-2xl px-4 py-3">
              <select
                className="w-full bg-transparent outline-none"
                value={deckType}
                onChange={(e) => setDeckType(e.target.value as "MCQ" | "FLASHCARD")}
              >
                <option value="MCQ">{t("set.type.mcq")}</option>
                <option value="FLASHCARD">{t("set.type.flashcard")}</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[34px] p-6 sm:p-8">
        <div className="mb-5 inline-flex rounded-full bg-slate-100 p-1">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            {t("create.upload")}
          </button>
        </div>

        {activeTab === "upload" ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="rounded-[32px] border-2 border-dashed border-emerald-200 bg-[linear-gradient(180deg,_rgba(243,252,247,0.95),_rgba(255,255,255,0.95))] p-10 text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-2xl shadow-sm">
              PDF
            </div>
            <p className="text-lg font-semibold text-slate-900">{t("create.drop")}</p>
            <p className="mt-2 text-sm text-slate-500">{t("create.or")}</p>
            <label className="mt-5 inline-flex cursor-pointer rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
              {t("create.chooseFile")}
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={onSelectFile}
              />
            </label>
            {file && (
              <div className="mx-auto mt-5 max-w-md rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 soft-ring">
                {t("create.selected")} {file.name}
              </div>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Paste your notes here..."
              rows={8}
              className="field-shell w-full rounded-[28px] p-4 outline-none"
            />
          </div>
        )}
      </section>

      <section className="surface-card rounded-[34px] p-6 sm:p-8">
        <div className="flex flex-col gap-8">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                {t("create.questions")}
              </label>
              <div className="field-shell flex items-center rounded-2xl px-4 py-3">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={count}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(40, Number(e.target.value) || 0));
                    setCount(v);
                  }}
                  className="w-full bg-transparent text-right text-2xl font-semibold outline-none"
                />
                <span className="ml-3 text-base text-slate-400">/ 40</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Visibility
              </label>
              <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1">
                <button
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isPublic ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                  onClick={() => setIsPublic(true)}
                >
                  {t("set.visibility.public")}
                </button>
                <button
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    !isPublic ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                  onClick={() => setIsPublic(false)}
                >
                  {t("set.visibility.private")}
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as const).map((value) => (
                  <button
                    key={value}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      level === value
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    onClick={() => setLevel(value)}
                  >
                    {t(`create.level.${value}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,_rgba(244,252,248,0.96),_rgba(255,255,255,0.98))] p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                Generation summary
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {count} {deckType === "MCQ" ? t("set.unit.mcq") : t("set.unit.flashcard")}
                {count !== 1 && isEnglish ? "s" : ""} with {level} difficulty.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isPublic ? t("set.visibility.public") : t("set.visibility.private")} deck
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`min-w-[220px] rounded-full px-6 py-3.5 font-semibold text-white transition ${
                loading ? "bg-emerald-300" : "bg-slate-900 hover:-translate-y-0.5 hover:bg-slate-800"
              }`}
            >
              {loading
                ? t("create.generate.loading")
                : deckType === "MCQ"
                  ? t("create.generate.mcq")
                  : t("create.generate.flashcard")}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-5 flex items-center gap-3 text-sm text-slate-600">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            {t("create.loadingMsg")}
          </div>
        )}
      </section>
    </div>
  );
}
