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

export default function PublicLibrary() {
  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapFolder = (folder: ApiFolder): Folder => ({
    id: String(folder.id),
    publicId: folder.publicId,
    title: folder.title,
    isPublic: Boolean(folder.isPublic),
    mcqSetCount: Number(folder.mcqSetCount ?? 0),
    flashSetCount: Number(folder.flashSetCount ?? 0),
  });

  useEffect(() => {
    const ctl = new AbortController();

    async function fetchFolders() {
      try {
        setError(null);
        setFolders(null);
        setIsLoading(true);

        const res = await fetchWithAuth(`${API_BASE_URL}/folder/public`, {
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(await res.text());

        const all: ApiFolder[] = await res.json();
        setFolders(all.map(mapFolder));
        setIsLoading(false);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "Failed to load public folders");
          setFolders([]);
          setIsLoading(false);
        }
      }
    }

    fetchFolders();
    return () => ctl.abort();
  }, []);

  const totalFolders = folders?.length ?? 0;
  const totalMcqSets = (folders ?? []).reduce(
    (sum, folder) => sum + folder.mcqSetCount,
    0,
  );
  const totalFlashSets = (folders ?? []).reduce(
    (sum, folder) => sum + folder.flashSetCount,
    0,
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="glass-panel rounded-[36px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight leading-none text-emerald-700 sm:text-6xl">
              Public Library
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Total folders", String(totalFolders)],
              ["MCQ sets", String(totalMcqSets)],
              ["Flash sets", String(totalFlashSets)],
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
        <SectionHeader eyebrow="Folders" title="Public folders" />
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : folders?.length === 0 ? (
          <EmptyState message="No public folders yet." />
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

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Public
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
