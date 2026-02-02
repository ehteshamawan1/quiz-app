type QuestionDisplayProps = {
  prompt: string;
  points: number;
  questionNumber: number;
  totalQuestions: number;
};

export default function QuestionDisplay({
  prompt,
  points,
  questionNumber,
  totalQuestions
}: QuestionDisplayProps) {
  return (
    <div className="question-display">
      <div className="question-display__header">
        <span className="question-display__number">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="question-display__points">{points} points</span>
      </div>
      <div
        className="question-display__prompt"
        dangerouslySetInnerHTML={{ __html: prompt }}
      />
    </div>
  );
}
