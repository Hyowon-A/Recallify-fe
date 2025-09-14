export default function SectionHeader({
    title,
    onAdd,
  }: {
    title: string;
    onAdd: () => void;
  }) {
    return (
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-l font-semibold">{title}</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current">
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
          </svg>
          Add
        </button>
      </div>
    );
  }
  