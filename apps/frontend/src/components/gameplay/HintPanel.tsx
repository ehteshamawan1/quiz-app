type Hint = {
  id: string;
  text?: string;
  penalty: number;
  isRevealed: boolean;
};

type HintPanelProps = {
  hints: Hint[];
  onRevealHint: (hintId: string) => void;
  disabled?: boolean;
};

export default function HintPanel({ hints, onRevealHint, disabled = false }: HintPanelProps) {
  if (hints.length === 0) {
    return null;
  }

  return (
    <div className="hint-panel">
      <h3 className="hint-panel__title">Hints</h3>
      <div className="hint-panel__list">
        {hints.map((hint, index) => (
          <div key={hint.id} className="hint-panel__item">
            {hint.isRevealed ? (
              <div className="hint-panel__content">
                <div className="hint-panel__label">
                  Hint {index + 1} ({hint.penalty} point penalty)
                </div>
                <div className="hint-panel__text">{hint.text}</div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRevealHint(hint.id)}
                disabled={disabled}
                className="hint-panel__reveal-btn"
              >
                Reveal Hint {index + 1} (-{hint.penalty} points)
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
