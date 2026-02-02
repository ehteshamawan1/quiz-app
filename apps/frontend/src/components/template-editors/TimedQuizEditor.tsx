import { useState } from "react";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TimedQuizQuestionData {
  id: string;
  prompt: string;
  answers: Answer[];
  explanation?: string;
}

interface TimedQuizEditorProps {
  questions: TimedQuizQuestionData[];
  onChange: (questions: TimedQuizQuestionData[]) => void;
  config?: {
    timePerQuestion?: number;
    showTimer?: boolean;
    autoAdvance?: boolean;
    streakBonus?: boolean;
  };
  onConfigChange?: (config: any) => void;
}

export default function TimedQuizEditor({ questions, onChange, config, onConfigChange }: TimedQuizEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: TimedQuizQuestionData = {
      id: `question-${Date.now()}`,
      prompt: "",
      answers: [
        { id: `answer-1-${Date.now()}`, text: "", isCorrect: false },
        { id: `answer-2-${Date.now() + 1}`, text: "", isCorrect: false },
        { id: `answer-3-${Date.now() + 2}`, text: "", isCorrect: false },
        { id: `answer-4-${Date.now() + 3}`, text: "", isCorrect: false }
      ],
      explanation: ""
    };
    onChange([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, field: keyof TimedQuizQuestionData, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleUpdateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
    const question = questions[questionIndex];
    const updatedAnswers = [...question.answers];

    // If marking as correct, unmark others (single correct answer)
    if (field === "isCorrect" && value === true) {
      updatedAnswers.forEach((a, i) => {
        a.isCorrect = i === answerIndex;
      });
    } else {
      updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], [field]: value };
    }

    handleUpdateQuestion(questionIndex, "answers", updatedAnswers);
  };

  const handleDeleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleDuplicate = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicated: TimedQuizQuestionData = {
      ...questionToDuplicate,
      id: `question-${Date.now()}`,
      prompt: `${questionToDuplicate.prompt} (Copy)`,
      answers: questionToDuplicate.answers.map((a) => ({
        ...a,
        id: `answer-${Date.now()}-${Math.random()}`
      }))
    };
    onChange([...questions, duplicated]);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Timed Quiz Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Per Question (seconds)
            </label>
            <input
              type="number"
              value={config?.timePerQuestion ?? 15}
              onChange={(e) =>
                onConfigChange?.({ ...config, timePerQuestion: parseInt(e.target.value) })
              }
              min="5"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.showTimer ?? true}
                onChange={(e) => onConfigChange?.({ ...config, showTimer: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Show countdown timer</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.autoAdvance ?? true}
                onChange={(e) => onConfigChange?.({ ...config, autoAdvance: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Auto-advance to next question</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.streakBonus ?? false}
                onChange={(e) => onConfigChange?.({ ...config, streakBonus: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Enable streak bonus</span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No questions yet. Click "Add Question" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Question {qIndex + 1}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingIndex(editingIndex === qIndex ? null : qIndex)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {editingIndex === qIndex ? "Collapse" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDuplicate(qIndex)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(qIndex)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingIndex === qIndex ? (
                  <div className="space-y-4">
                    {/* Question Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <textarea
                        value={question.prompt}
                        onChange={(e) => handleUpdateQuestion(qIndex, "prompt", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Enter your question..."
                      />
                    </div>

                    {/* Answers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answers (select one correct answer)
                      </label>
                      <div className="space-y-2">
                        {question.answers.map((answer, aIndex) => (
                          <div key={answer.id} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`question-${qIndex}-correct`}
                              checked={answer.isCorrect}
                              onChange={() => handleUpdateAnswer(qIndex, aIndex, "isCorrect", true)}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              value={answer.text}
                              onChange={(e) => handleUpdateAnswer(qIndex, aIndex, "text", e.target.value)}
                              placeholder={`Answer ${aIndex + 1}...`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={question.explanation || ""}
                        onChange={(e) => handleUpdateQuestion(qIndex, "explanation", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Explain the correct answer..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-800">
                    <div className="truncate">{question.prompt || "(Empty question)"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {question.answers.filter((a) => a.isCorrect).length > 0
                        ? "✓ Has correct answer"
                        : "⚠ No correct answer set"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for Timed Quizzes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep questions concise - students have limited time</li>
          <li>• Adjust time per question based on difficulty</li>
          <li>• Use streak bonus to reward consistent performance</li>
          <li>• Enable auto-advance for a truly rapid-fire experience</li>
        </ul>
      </div>
    </div>
  );
}
