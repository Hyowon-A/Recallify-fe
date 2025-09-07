import { useNavigate, useParams } from "react-router-dom";

export default function FinalResultModal({
  correct,
  total,
  onRestart,
  open,
}: {
  correct: number;
  total: number;
  onRestart: () => void;
  open: boolean;
}) {
  const navigate = useNavigate();
  if (!open) return null;

  const { setId } = useParams<{ setId: string }>();

  const scorePercent = Math.round((correct / total) * 100);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">Quiz Complete!</h2>

        <p className="text-lg font-semibold mb-2">
          Your Score: {correct} / {total}
        </p>
        <p className="text-gray-600 mb-6">{scorePercent}% correct</p>

        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/sets/${setId}`)}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
          >
            Back to the Set
          </button>
          <button
            onClick={onRestart}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    </div>
  );
}