interface Hint {
  id: string;
  text: string;
  order: number;
}

interface ProgressiveHintPanelProps {
  hints: Hint[];
  revealedHints: string[];
  onRevealHint: () => void;
  pointsRemaining: number;
  hintPenalty: number;
  canRevealMore: boolean;
}

export default function ProgressiveHintPanel({
  hints,
  revealedHints,
  onRevealHint,
  pointsRemaining,
  hintPenalty,
  canRevealMore
}: ProgressiveHintPanelProps) {
  const sortedHints = [...hints].sort((a, b) => a.order - b.order);
  const nextHintIndex = revealedHints.length;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-yellow-900">Hints</h3>
        <div className="text-sm text-yellow-700">
          Points Remaining: <span className="font-bold">{pointsRemaining}</span>
        </div>
      </div>

      {/* Revealed Hints */}
      <div className="space-y-3 mb-4">
        {revealedHints.length === 0 ? (
          <p className="text-sm text-yellow-700">No hints revealed yet</p>
        ) : (
          sortedHints
            .filter((hint) => revealedHints.includes(hint.id))
            .map((hint) => (
              <div key={hint.id} className="bg-white rounded-md p-3 border border-yellow-300">
                <div className="text-xs text-yellow-600 mb-1">Hint {hint.order}</div>
                <p className="text-sm text-gray-800">{hint.text}</p>
              </div>
            ))
        )}
      </div>

      {/* Reveal Next Hint Button */}
      {nextHintIndex < sortedHints.length && (
        <div>
          <button
            onClick={onRevealHint}
            disabled={!canRevealMore || pointsRemaining - hintPenalty < 0}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              !canRevealMore || pointsRemaining - hintPenalty < 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
          >
            {pointsRemaining - hintPenalty < 0
              ? "Not enough points for another hint"
              : `Reveal Next Hint (-${hintPenalty} points)`}
          </button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {sortedHints.length - nextHintIndex} hint{sortedHints.length - nextHintIndex !== 1 ? "s" : ""}{" "}
            remaining
          </p>
        </div>
      )}

      {nextHintIndex >= sortedHints.length && (
        <div className="text-center text-sm text-gray-600">All hints have been revealed</div>
      )}
    </div>
  );
}
