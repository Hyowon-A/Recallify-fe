export default function SectionHeader({
    title,
    onAdd,
    disabled,
  }: {
    title: string;
    onAdd?: () => void;
    disabled?: boolean;
  }) {
    return (
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-l font-semibold">{title}</h2>
        {onAdd && (
        <button
          onClick={onAdd}
          disabled={disabled}
          className={`rounded-lg px-4 py-2 text-sm font-semibold shadow 
            ${disabled 
              ? "cursor-not-allowed bg-gray-300 text-gray-500" 
              : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
        >
          + Add
        </button>
      )}
      </div>
    );
  }
  