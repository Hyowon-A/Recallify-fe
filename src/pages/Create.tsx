import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";

export default function CreateMCQs() {
  const loc = useLocation() as { state?: { type?: "MCQ" | "FLASHCARD" } };

  const [deckTitle, setDeckTitle] = useState("");
  const [deckType, setDeckType] = useState<"MCQ" | "FLASHCARD">(loc.state?.type ?? "MCQ");
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  const [file, setFile] = useState<File | null>(null);
  const [paste, setPaste] = useState("");

  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false)

  const navigate = useNavigate();

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
    if (!deckTitle.trim()) { alert("Please enter a deck title."); return; }
    if (activeTab === "upload" && !file) { alert("Please upload a file."); return; }
    if (activeTab === "paste" && paste.trim().length < 20) { alert("Paste a bit more text."); return; }

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
    if (file) form.append("file", file);
    if (paste && paste.trim()) form.append("text", paste.trim());

    const genUrl =
      deckType === "MCQ" ? `${API_BASE_URL}/mcq/generate-from-pdf` : `${API_BASE_URL}/flashcard/generate-from-pdf`;  

    const genRes = await fetch(genUrl, {
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {deckType === "MCQ" ? "Create MCQs" : "Create Flashcards"}
          </h1>
          <p className="text-sm text-gray-500">Upload notes or paste text → AI generates questions.</p>
        </div>
        <div className="flex gap-3">
          <input
            placeholder="Deck title"
            className="w-56 rounded-lg border border-gray-300 px-3 py-2"
            value={deckTitle}
            onChange={e => setDeckTitle(e.target.value)}
          />
          <select
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={deckType}
            onChange={e => setDeckType(e.target.value as any)}
          >
            <option value="MCQ">MCQ</option>
            <option value="FLASHCARD">Flashcard</option>
          </select>
        </div>
      </div>

      {/* Input tabs */}
      <div className="mb-4 inline-flex rounded-full bg-gray-100 p-1">
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab==="upload"?"bg-white shadow":"text-gray-600"}`}
          onClick={()=>setActiveTab("upload")}
        >Upload</button>
        {/* <button
          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab==="paste"?"bg-white shadow":"text-gray-600"}`}
          onClick={()=>setActiveTab("paste")}
        >Paste text</button> */}
      </div>

      {activeTab === "upload" ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          className="mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center"
        >
          <p className="font-medium">Drag & drop a PDF</p>
          <p className="text-sm text-gray-500">or</p>
          <label className="mt-3 inline-block cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            Choose file
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={onSelectFile} />
          </label>
          {file && <p className="mt-3 text-sm text-gray-600">Selected: {file.name}</p>}
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            value={paste}
            onChange={e=>setPaste(e.target.value)}
            placeholder="Paste your notes here…"
            rows={8}
            className="w-full rounded-2xl border border-gray-300 p-4"
          />
        </div>
      )}

      {/* Config + Generate */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3">
        <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Questions</label>

            {/* numeric input (kept in sync) */}
            <input
            type="number"
            min={1}
            max={40}
            value={count}
            onChange={(e) => {
                const v = Math.max(1, Math.min(40, Number(e.target.value) || 0));
                setCount(v);
            }}
            className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-right"
            />

            <span className="text-sm text-gray-500">/ 40</span>
        </div>

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


        <button
            onClick={handleGenerate}
            disabled={loading}
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
            loading ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
        >
            {loading
              ? "Generating…"
              : deckType === "MCQ" ? "Generate MCQs" : "Generate Flashcards"}
        </button>
        </div>


      {/* Progress / Preview */}
      {loading && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent" />
          Extracting, chunking and generating questions…
        </div>
      )}
    </div>
  );
}