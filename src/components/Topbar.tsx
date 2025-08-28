export default function Topbar({ onOpenProfile }: { onOpenProfile: () => void }) {
    return (
      <div className="flex items-center justify-end border-b bg-gray-100 px-6 py-3">
        <button
          onClick={onOpenProfile}
          className="grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-600 font-bold border shadow-sm"
          aria-label="Open profile"
        >
          H
        </button>
      </div>
    );
  }  