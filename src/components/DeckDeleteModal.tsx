import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  itemName?: string;            // e.g. deck title
  loading?: boolean;            // disable buttons while deleting
  onDelete: () => void;
  onClose: () => void;
};

export default function DeckDeleteModal({
  open,
  itemName = "this deck",
  loading = false,
  onDelete,
  onClose,
}: Props) {
  const deleteBtnRef = useRef<HTMLButtonElement | null>(null);

  // Focus the Delete button when the modal opens
  useEffect(() => {
    if (open) deleteBtnRef.current?.focus();
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
      aria-hidden={!open}
    >
      {/* overlay click closes */}
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="delete-title" className="text-lg font-semibold">
          Delete {itemName}?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          This action cannot be undone. All questions and progress in this deck
          will be permanently removed.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            ref={deleteBtnRef}
            onClick={onDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}