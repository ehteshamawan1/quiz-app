type Answer = {
  id: string;
  text: string;
};

type AnswerOptionsProps = {
  answers: Answer[];
  selectedAnswerIds: string[];
  onSelectAnswer: (answerId: string) => void;
  allowMultiple: boolean;
  disabled?: boolean;
  showCorrectness?: boolean;
  correctAnswerIds?: string[];
};

export default function AnswerOptions({
  answers,
  selectedAnswerIds,
  onSelectAnswer,
  allowMultiple,
  disabled = false,
  showCorrectness = false,
  correctAnswerIds = []
}: AnswerOptionsProps) {
  const handleSelect = (answerId: string) => {
    if (disabled) return;
    onSelectAnswer(answerId);
  };

  const getAnswerClassName = (answerId: string): string => {
    const classes = ["answer-option"];

    if (selectedAnswerIds.includes(answerId)) {
      classes.push("answer-option--selected");
    }

    if (showCorrectness) {
      const isCorrect = correctAnswerIds.includes(answerId);
      const isSelected = selectedAnswerIds.includes(answerId);

      if (isCorrect) {
        classes.push("answer-option--correct");
      } else if (isSelected && !isCorrect) {
        classes.push("answer-option--incorrect");
      }
    }

    if (disabled) {
      classes.push("answer-option--disabled");
    }

    return classes.join(" ");
  };

  return (
    <div className="answer-options">
      {answers.map((answer) => {
        const isSelected = selectedAnswerIds.includes(answer.id);

        return (
          <label
            key={answer.id}
            className={getAnswerClassName(answer.id)}
          >
            <input
              type={allowMultiple ? "checkbox" : "radio"}
              name="answer"
              value={answer.id}
              checked={isSelected}
              onChange={() => handleSelect(answer.id)}
              disabled={disabled}
              className="answer-option__input"
            />
            <span className="answer-option__text">{answer.text}</span>
          </label>
        );
      })}
    </div>
  );
}
