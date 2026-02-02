import { useState } from "react";
import RichTextInput from "./RichTextInput";
import { Button, Input, Card } from "@nursequest/ui-components";

type Answer = { text: string; isCorrect: boolean };

type QuestionEditorProps = {
  onChange: (questions: QuestionDraft[]) => void;
};

type QuestionDraft = {
  prompt: string;
  explanation: string;
  points: number;
  allowMultiple: boolean;
  answers: Answer[];
  hints: string[];
};

export default function QuestionEditor({ onChange }: QuestionEditorProps) {
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      prompt: "",
      explanation: "",
      points: 10,
      allowMultiple: false,
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false }
      ],
      hints: ["", "", ""]
    }
  ]);

  const update = (next: QuestionDraft[]) => {
    setQuestions(next);
    onChange(next);
  };

  return (
    <div className="question-editor">
      {questions.map((question, index) => (
        <Card key={index} title={`Question ${index + 1}`}>
          <div className="form-stack">
            <label className="field-label">Prompt (rich text)</label>
            <RichTextInput
              value={question.prompt}
              onChange={(value) => {
                const next = [...questions];
                next[index].prompt = value;
                update(next);
              }}
              placeholder="Enter question prompt"
            />
            <Input
              label="Points"
              name={`points-${index}`}
              type="number"
              value={question.points}
              onChange={(event) => {
                const next = [...questions];
                next[index].points = Number(event.target.value);
                update(next);
              }}
            />
            <label className="field-label">
              <input
                type="checkbox"
                checked={question.allowMultiple}
                onChange={(event) => {
                  const next = [...questions];
                  next[index].allowMultiple = event.target.checked;
                  if (!event.target.checked) {
                    const firstCorrect = next[index].answers.findIndex((answer) => answer.isCorrect);
                    next[index].answers = next[index].answers.map((answer, aIndex) => ({
                      ...answer,
                      isCorrect: aIndex === (firstCorrect === -1 ? 0 : firstCorrect)
                    }));
                  }
                  update(next);
                }}
              />{" "}
              Allow multiple correct answers
            </label>
            <div>
              <label className="field-label">Answers</label>
              <div className="answer-grid">
                {question.answers.map((answer, aIndex) => (
                  <div key={aIndex} className="answer-row">
                    <input
                      type={question.allowMultiple ? "checkbox" : "radio"}
                      name={`correct-${index}`}
                      checked={answer.isCorrect}
                      onChange={() => {
                        const next = [...questions];
                        if (next[index].allowMultiple) {
                          next[index].answers[aIndex].isCorrect = !next[index].answers[aIndex].isCorrect;
                        } else {
                          next[index].answers = next[index].answers.map((item, idx) => ({
                            ...item,
                            isCorrect: idx === aIndex
                          }));
                        }
                        update(next);
                      }}
                    />
                    <input
                      className="answer-input"
                      value={answer.text}
                      placeholder={`Answer ${aIndex + 1}`}
                      onChange={(event) => {
                        const next = [...questions];
                        next[index].answers[aIndex].text = event.target.value;
                        update(next);
                      }}
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const next = [...questions];
                  next[index].answers.push({ text: "", isCorrect: false });
                  update(next);
                }}
              >
                Add answer
              </Button>
            </div>
            <div>
              <label className="field-label">Hints (up to 3)</label>
              {question.hints.map((hint, hIndex) => (
                <input
                  key={hIndex}
                  className="answer-input"
                  placeholder={`Hint ${hIndex + 1}`}
                  value={hint}
                  onChange={(event) => {
                    const next = [...questions];
                    next[index].hints[hIndex] = event.target.value;
                    update(next);
                  }}
                />
              ))}
            </div>
            <div>
              <label className="field-label">Explanation</label>
              <RichTextInput
                value={question.explanation}
                onChange={(value) => {
                  const next = [...questions];
                  next[index].explanation = value;
                  update(next);
                }}
                placeholder="Explanation shown after answer"
              />
            </div>
          </div>
        </Card>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          update([
            ...questions,
            {
              prompt: "",
              explanation: "",
              points: 10,
              allowMultiple: false,
              answers: [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false }
              ],
              hints: ["", "", ""]
            }
          ]);
        }}
      >
        Add question
      </Button>
    </div>
  );
}
