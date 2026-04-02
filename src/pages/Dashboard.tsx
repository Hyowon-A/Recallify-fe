import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";

type Folder = {
  id: string;
  publicId: string;
  title: string;
  isPublic: boolean;
  mcqSetCount: number;
  flashSetCount: number;
};

type ApiFolder = {
  id: string | number;
  publicId: string;
  title: string;
  isPublic: boolean;
  mcqSetCount: number;
  flashSetCount: number;
};

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [folderTitle, setFolderTitle] = useState("");
  const [folderIsPublic, setFolderIsPublic] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const mapFolder = (folder: ApiFolder): Folder => ({
    id: String(folder.id),
    publicId: folder.publicId,
    title: folder.title,
    isPublic: Boolean(folder.isPublic),
    mcqSetCount: Number(folder.mcqSetCount ?? 0),
    flashSetCount: Number(folder.flashSetCount ?? 0),
  });

  async function fetchFolders(
    signal?: AbortSignal,
    options?: { preserveExisting?: boolean },
  ) {
    const preserveExisting = options?.preserveExisting ?? false;

    try {
      setError(null);
      if (!preserveExisting) {
        setFolders(null);
        setIsLoading(true);
      }

      const res = await fetchWithAuth(`${API_BASE_URL}/folder/my`, {
        signal,
      });
      if (!res.ok) throw new Error(await res.text());

      const all: ApiFolder[] = await res.json();
      setFolders(all.map(mapFolder));
      setIsLoading(false);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Failed to load folders");
        if (!preserveExisting) {
          setFolders([]);
        }
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const ctl = new AbortController();
    fetchFolders(ctl.signal);
    return () => ctl.abort();
  }, []);

  async function handleCreateFolder() {
    const title = folderTitle.trim();
    if (!title) {
      setCreateError("Enter a folder title.");
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      const res = await fetchWithAuth(`${API_BASE_URL}/folder/create`, {
        method: "POST",
        body: JSON.stringify({
          title,
          isPublic: folderIsPublic,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setFolderTitle("");
      setFolderIsPublic(false);
      setIsCreateOpen(false);
      await fetchFolders(undefined, { preserveExisting: true });
    } catch (e: any) {
      setCreateError(e.message || "Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  }

  const totalFolders = folders?.length ?? 0;
  const totalSets = (folders ?? []).reduce(
    (sum, folder) => sum + folder.mcqSetCount + folder.flashSetCount,
    0,
  );
  const publicFolders = (folders ?? []).filter(
    (folder) => folder.isPublic,
  ).length;

  return (
    <div className="space-y-8 pb-8">
      <section className="glass-panel rounded-[36px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight leading-none text-emerald-700 sm:text-6xl">
              Dashboard
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Total folders", String(totalFolders)],
              ["Total sets", String(totalSets)],
              ["Public folders", String(publicFolders)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[24px] bg-white/85 px-4 py-4 text-center soft-ring"
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[34px] px-6 py-6 sm:px-8">
        <SectionHeader
          eyebrow="Folders"
          title="My folders"
          onAdd={() => {
            setCreateError(null);
            setIsCreateOpen((open) => !open);
          }}
        />
        {isCreateOpen && (
          <div className="mb-6 rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,_rgba(244,252,248,0.96),_rgba(255,255,255,0.98))] p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="field-shell flex items-center rounded-2xl px-4 py-3">
                  <input
                    value={folderTitle}
                    onChange={(e) => setFolderTitle(e.target.value)}
                    placeholder="Folder title"
                    className="w-full bg-transparent outline-none"
                  />
                </label>

                <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                  <button
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      folderIsPublic
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                    onClick={() => setFolderIsPublic(true)}
                    type="button"
                  >
                    Public
                  </button>
                  <button
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      !folderIsPublic
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                    onClick={() => setFolderIsPublic(false)}
                    type="button"
                  >
                    Private
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCreateError(null);
                    setIsCreateOpen(false);
                  }}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreateFolder}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${
                    isCreating
                      ? "cursor-not-allowed bg-emerald-300"
                      : "bg-slate-900 hover:-translate-y-0.5 hover:bg-slate-800"
                  }`}
                >
                  {isCreating ? "Creating..." : "Create folder"}
                </button>
              </div>
            </div>

            {createError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createError}
              </div>
            )}
          </div>
        )}
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : folders?.length === 0 ? (
          <EmptyState message="No folders yet." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
            {folders?.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-[28px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(228,236,229,0.9))]"
        />
      ))}
    </div>
  );
}

function FolderCard({ folder }: { folder: Folder }) {
  return (
    <div className="surface-card flex h-full flex-col rounded-[30px] p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(17,40,31,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/folders/${folder.publicId}`}
          state={folder}
          className="min-w-0 flex-1"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700/80">
            Folder
          </p>
          <h3 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900">
            {folder.title}
          </h3>
        </Link>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
            folder.isPublic
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {folder.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <Link
        to={`/folders/${folder.publicId}`}
        state={folder}
        className="mt-6 grid grid-cols-2 gap-3"
      >
        <div className="rounded-[22px] bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">MCQ sets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {folder.mcqSetCount}
          </p>
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Flash sets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {folder.flashSetCount}
          </p>
        </div>
      </Link>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-8 text-slate-600">
      {message}
    </div>
  );
}
