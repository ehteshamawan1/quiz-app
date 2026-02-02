type ProgressBarProps = {
  currentQuestion: number;
  totalQuestions: number;
};

export default function ProgressBar({ currentQuestion, totalQuestions }: ProgressBarProps) {
  const percentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-bar__info">
        <span className="progress-bar__text">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="progress-bar__percentage">{Math.round(percentage)}%</span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentQuestion}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
        />
      </div>
    </div>
  );
}
