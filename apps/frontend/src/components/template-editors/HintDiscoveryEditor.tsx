import { useState } from "react";

interface Hint {
  id: string;
  text: string;
  order: number;
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface HintDiscoveryQuestionData {
  id: string;
  prompt: string;
  answers: Answer[];
  hints: Hint[];
  explanation?: string;
  allowMultiple: boolean;
}

interface HintDiscoveryEditorProps {
  questions: HintDiscoveryQuestionData[];
  onChange: (questions: HintDiscoveryQuestionData[]) => void;
  config?: {
    maxHints?: number;
    hintPenalty?: number;
    basePoints?: number;
    allowSkip?: boolean;
  };
  onConfigChange?: (config: any) => void;
}

export default function HintDiscoveryEditor({ questions, onChange, config, onConfigChange }: HintDiscoveryEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: HintDiscoveryQuestionData = {
      id: `question-${Date.now()}`,
      prompt: "",
      answers: [
        { id: `answer-1-${Date.now()}`, text: "", isCorrect: false },
        { id: `answer-2-${Date.now() + 1}`, text: "", isCorrect: false }
      ],
      hints: [],
      explanation: "",
      allowMultiple: false
    };
    onChange([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, field: keyof HintDiscoveryQuestionData, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddAnswer = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newAnswer: Answer = {
      id: `answer-${Date.now()}`,
      text: "",
      isCorrect: false
    };
    handleUpdateQuestion(questionIndex, "answers", [...question.answers, newAnswer]);
  };

  const handleUpdateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
    const question = questions[questionIndex];
    const updatedAnswers = [...question.answers];
    updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], [field]: value };
    handleUpdateQuestion(questionIndex, "answers", updatedAnswers);
  };

  const handleDeleteAnswer = (questionIndex: number, answerIndex: number) => {
    const question = questions[questionIndex];
    const updatedAnswers = question.answers.filter((_, i) => i !== answerIndex);
    handleUpdateQuestion(questionIndex, "answers", updatedAnswers);
  };

  const handleAddHint = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newHint: Hint = {
      id: `hint-${Date.now()}`,
      text: "",
      order: question.hints.length + 1
    };
    handleUpdateQuestion(questionIndex, "hints", [...question.hints, newHint]);
  };

  const handleUpdateHint = (questionIndex: number, hintIndex: number, field: keyof Hint, value: any) => {
    const question = questions[questionIndex];
    const updatedHints = [...question.hints];
    updatedHints[hintIndex] = { ...updatedHints[hintIndex], [field]: value };
    handleUpdateQuestion(questionIndex, "hints", updatedHints);
  };

  const handleDeleteHint = (questionIndex: number, hintIndex: number) => {
    const question = questions[questionIndex];
    const updatedHints = question.hints.filter((_, i) => i !== hintIndex);
    // Re-order remaining hints
    updatedHints.forEach((hint, i) => {
      hint.order = i + 1;
    });
    handleUpdateQuestion(questionIndex, "hints", updatedHints);
  };

  const handleDeleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Points</label>
            <input
              type="number"
              value={config?.basePoints ?? 10}
              onChange={(e) => onConfigChange?.({ ...config, basePoints: parseInt(e.target.value) })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Lost Per Hint</label>
            <input
              type="number"
              value={config?.hintPenalty ?? 2}
              onChange={(e) => onConfigChange?.({ ...config, hintPenalty: parseInt(e.target.value) })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Hints Per Question</label>
            <input
              type="number"
              value={config?.maxHints ?? 5}
              onChange={(e) => onConfigChange?.({ ...config, maxHints: parseInt(e.target.value) })}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config?.allowSkip ?? false}
              onChange={(e) => onConfigChange?.({ ...config, allowSkip: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm">Allow students to skip questions</label>
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
                      />
                    </div>

                    {/* Answers */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Answers</label>
                        <button
                          onClick={() => handleAddAnswer(qIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add Answer
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.answers.map((answer, aIndex) => (
                          <div key={answer.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={answer.isCorrect}
                              onChange={(e) => handleUpdateAnswer(qIndex, aIndex, "isCorrect", e.target.checked)}
                              title="Mark as correct"
                            />
                            <input
                              type="text"
                              value={answer.text}
                              onChange={(e) => handleUpdateAnswer(qIndex, aIndex, "text", e.target.value)}
                              placeholder="Answer text..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hints */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Progressive Hints</label>
                        <button
                          onClick={() => handleAddHint(qIndex)}
                          className="text-sm text-yellow-600 hover:text-yellow-800"
                        >
                          + Add Hint
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.hints.map((hint, hIndex) => (
                          <div key={hint.id} className="flex items-start space-x-2">
                            <span className="mt-2 text-sm text-gray-500 w-12">#{hint.order}</span>
                            <textarea
                              value={hint.text}
                              onChange={(e) => handleUpdateHint(qIndex, hIndex, "text", e.target.value)}
                              placeholder="Hint text..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              rows={2}
                            />
                            <button
                              onClick={() => handleDeleteHint(qIndex, hIndex)}
                              className="mt-2 text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
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
                      {question.answers.length} answers, {question.hints.length} hints
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
