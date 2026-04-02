import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import DeckCard from "../components/DeckCard";
import DeckDeleteModal from "../components/DeckDeleteModal";
import SectionHeader from "../components/SectionHeader";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

type FolderState = {
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

type Deck = {
  id: string;
  title: string;
  count: number;
  isPublic: boolean;
  type: "MCQ" | "FLASHCARD";
  isOwner: boolean;
  newC: number;
  learn: number;
  due: number;
};

type ApiDeck = {
  id: string | number;
  title: string;
  count?: number;
  isPublic?: boolean;
  type: "MCQ" | "FLASHCARD";
  isOwner: boolean;
  newC: number;
  learn: number;
  due: number;
};

export default function Folder() {
  const nav = useNavigate();
  const [mcq, setMcq] = useState<Deck[] | null>(null);
  const [flash, setFlash] = useState<Deck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { folderPublicId } = useParams<{ folderPublicId: string }>();
  const location = useLocation();
  const routeFolder = (location.state as FolderState | undefined) ?? undefined;
  const [folder, setFolder] = useState<FolderState | null>(routeFolder ?? null);

  const { t } = useTranslation();

  const mapFolder = (f: ApiFolder): FolderState => ({
    id: String(f.id),
    publicId: f.publicId,
    title: f.title,
    isPublic: Boolean(f.isPublic),
    mcqSetCount: Number(f.mcqSetCount ?? 0),
    flashSetCount: Number(f.flashSetCount ?? 0),
  });

  const mapDeck = (d: ApiDeck): Deck => ({
    id: String(d.id),
    title: d.title,
    count: Number(d.count ?? 0),
    isPublic: Boolean(d.isPublic),
    type: d.type,
    isOwner: d.isOwner,
    newC: d.newC,
    learn: d.learn,
    due: d.due,
  });

  useEffect(() => {
    if (routeFolder && routeFolder.publicId === folderPublicId) {
      setFolder(routeFolder);
    }
  }, [routeFolder, folderPublicId]);

  useEffect(() => {
    const ctl = new AbortController();

    async function fetchAll() {
      try {
        setError(null);
        setMcq(null);
        setFlash(null);
        setIsLoading(true);

        let activeFolder = folder;

        if (!activeFolder?.id) {
          const ownFolderRes = await fetchWithAuth(`${API_BASE_URL}/folder/my`, {
            signal: ctl.signal,
          });
          if (!ownFolderRes.ok) throw new Error(await ownFolderRes.text());

          const ownFolders: ApiFolder[] = await ownFolderRes.json();
          let matchedFolder = ownFolders.find(
            (candidate) => candidate.publicId === folderPublicId,
          );

          if (!matchedFolder) {
            const publicFolderRes = await fetchWithAuth(
              `${API_BASE_URL}/folder/public`,
              {
                signal: ctl.signal,
              },
            );
            if (!publicFolderRes.ok) throw new Error(await publicFolderRes.text());

            const publicFolders: ApiFolder[] = await publicFolderRes.json();
            matchedFolder = publicFolders.find(
              (candidate) => candidate.publicId === folderPublicId,
            );
          }

          if (!matchedFolder) {
            throw new Error("Failed to resolve folder.");
          }

          activeFolder = mapFolder(matchedFolder);
          setFolder(activeFolder);
        }

        const res = await fetchWithAuth(
          `${API_BASE_URL}/folder/${activeFolder.id}/sets`,
          {
            signal: ctl.signal,
          },
        );
        if (!res.ok) throw new Error(await res.text());

        const all: ApiDeck[] = await res.json();

        const [mcqs, flashes] = all.reduce<[Deck[], Deck[]]>(
          (acc, d) => {
            const deck = mapDeck(d);
            if (d.type === "MCQ") acc[0].push(deck);
            else if (d.type === "FLASHCARD") acc[1].push(deck);
            return acc;
          },
          [[], []],
        );

        setMcq(mcqs);
        setFlash(flashes);
        setIsLoading(false);
      } catch (e: any) {
        if (e.name !== "AbortError")
          setError(e.message || "Failed to load decks");
        setMcq([]);
        setFlash([]);
        setIsLoading(false);
      }
    }

    fetchAll();
    return () => ctl.abort();
  }, [folderPublicId, folder?.id]);

  const activeFolderId = folder?.id;
  const activeFolderPublicId = folder?.publicId ?? folderPublicId;
  const handleAddMCQ = () => {
    if (!activeFolderId || !activeFolderPublicId || !folder) return;
    nav("/create", {
      state: {
        type: "MCQ",
        folderId: activeFolderId,
        folderPublicId: activeFolderPublicId,
        folder,
      },
    });
  };
  const handleAddFlash = () => {
    if (!activeFolderId || !activeFolderPublicId || !folder) return;
    nav("/create", {
      state: {
        type: "FLASHCARD",
        folderId: activeFolderId,
        folderPublicId: activeFolderPublicId,
        folder,
      },
    });
  };
  const handleDeleteFolder = async () => {
    if (!activeFolderId) return;

    try {
      setIsDeleting(true);
      setError(null);

      const res = await fetchWithAuth(
        `${API_BASE_URL}/folder/delete/${activeFolderId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error(await res.text());

      nav("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to delete folder");
    } finally {
      setIsDeleting(false);
    }
  };
  const totalDecks = (mcq?.length ?? 0) + (flash?.length ?? 0);
  const totalItems = [...(mcq ?? []), ...(flash ?? [])].reduce(
    (sum, deck) => sum + deck.count,
    0,
  );
  const publicSets = [...(mcq ?? []), ...(flash ?? [])].filter(
    (deck) => deck.isPublic,
  ).length;
  const folderName = folder?.title ?? `Folder ${folderPublicId ?? ""}`;
  const visibility = folder?.isPublic ? "Public" : "Private";

  return (
    <div className="space-y-8 pb-8">
      <section className="glass-panel rounded-[36px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
            >
              Back to folders
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-700/80">
              Folder
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              {folderName}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={!activeFolderId || isDeleting}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-200 bg-white/85 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete folder
          </button>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Total sets", String(totalDecks)],
              ["Study items", String(totalItems)],
              ["Public sets", String(publicSets)],
              ["Visibility", visibility],
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

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <section className="surface-card rounded-[34px] px-6 py-6 sm:px-8">
          <SectionHeader
            eyebrow="MCQ"
            title={t("sectionHeader.setType.mcq")}
            onAdd={handleAddMCQ}
          />
          {isLoading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : mcq?.length === 0 ? (
            <EmptyState message={t("dashboard.noMcq")} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {mcq?.map((d) => (
                <DeckCard key={d.id} deck={d} />
              ))}
            </div>
          )}
        </section>

        <section className="surface-card rounded-[34px] px-6 py-6 sm:px-8">
          <SectionHeader
            eyebrow="Flashcards"
            title={t("sectionHeader.setType.flashcard")}
            onAdd={handleAddFlash}
          />
          {isLoading ? (
            <SkeletonGrid />
          ) : flash?.length === 0 ? (
            <EmptyState message={t("dashboard.noFlash")} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {flash?.map((d) => (
                <DeckCard key={d.id} deck={d} />
              ))}
            </div>
          )}
        </section>
      </div>

      <DeckDeleteModal
        open={deleteOpen}
        itemName={folder?.title ? `folder "${folder.title}"` : "this folder"}
        description="This action cannot be undone. All sets inside this folder may also be permanently removed."
        loading={isDeleting}
        onDelete={handleDeleteFolder}
        onClose={() => {
          if (isDeleting) return;
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-[28px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(228,236,229,0.9))]"
        />
      ))}
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
