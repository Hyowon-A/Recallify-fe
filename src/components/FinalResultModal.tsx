import { useNavigate, useParams } from "react-router-dom";

export default function FinalResultModal({
  correct,
  total,
  open,
  mode = "MCQ", // "MCQ" | "FLASHCARD"
}: {
  correct: number;
  total: number;
  open: boolean;
  mode?: "MCQ" | "FLASHCARD";
}) {
  const navigate = useNavigate();
  if (!open) return null;

  const { setId } = useParams<{ setId: string }>();

  // Calculate score % only if MCQ mode
  const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">
          {mode === "MCQ" ? "Quiz Complete!" : "Session Complete!"}
        </h2>

        {mode === "MCQ" ? (
          <>
            <p className="text-lg font-semibold mb-2">
              Your Score: {correct} / {total}
            </p>
            <p className="text-gray-600 mb-6">{scorePercent}% correct</p>
          </>
        ) : (
          <p className="text-gray-700 mb-6">
            You reviewed all <span className="font-semibold">{total}</span> cards 🎉
          </p>
        )}

        <button
          onClick={() => navigate(`/sets/${setId}`)}
          className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
        >
          Back to the Set
        </button>
      </div>
    </div>
  );
}