import { useState } from "react";
import { Button } from "@nursequest/ui-components";

export interface MCQQuestionData {
  id: string;
  prompt: string;
  answers: { id?: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

interface MCQEditorProps {
  questions: MCQQuestionData[];
  onChange: (questions: MCQQuestionData[]) => void;
}

export default function MCQEditor({ questions, onChange }: MCQEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: MCQQuestionData = {
      id: `q-${Date.now()}`,
      prompt: "",
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      explanation: ""
    };
    onChange([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, field: keyof MCQQuestionData, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleUpdateAnswer = (qIndex: number, aIndex: number, field: string, value: any) => {
    const updated = [...questions];
    const updatedAnswers = [...updated[qIndex].answers];
    updatedAnswers[aIndex] = { ...updatedAnswers[aIndex], [field]: value };
    updated[qIndex] = { ...updated[qIndex], answers: updatedAnswers };
    onChange(updated);
  };

  const handleAddAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ text: "", isCorrect: false });
    onChange(updated);
  };

  const handleDeleteAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(aIndex, 1);
    onChange(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
        <Button onClick={handleAddQuestion}>+ Add Question</Button>
      </div>

      {questions.map((q, qIndex) => (
        <div key={q.id} className="border p-4 rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-700">Question {qIndex + 1}</span>
            <div className="flex gap-2">
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={() => setEditingIndex(editingIndex === qIndex ? null : qIndex)}
              >
                {editingIndex === qIndex ? "Collapse" : "Edit"}
              </button>
              <button
                className="text-red-600 text-sm hover:underline"
                onClick={() => handleDeleteQuestion(qIndex)}
              >
                Delete
              </button>
            </div>
          </div>

          {editingIndex === qIndex ? (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => handleUpdateQuestion(qIndex, "prompt", e.target.value)}
                  placeholder="Enter question text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answers</label>
                <div className="space-y-2">
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={a.isCorrect}
                        onChange={() => {
                          const updated = [...questions];
                          updated[qIndex].answers.forEach((ans, i) => {
                            ans.isCorrect = i === aIndex;
                          });
                          onChange(updated);
                        }}
                      />
                      <input
                        type="text"
                        className="flex-1 border rounded p-2"
                        value={a.text}
                        onChange={(e) => handleUpdateAnswer(qIndex, aIndex, "text", e.target.value)}
                        placeholder={`Option ${aIndex + 1}`}
                      />
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    className="text-sm text-blue-600 hover:underline mt-1"
                    onClick={() => handleAddAnswer(qIndex)}
                  >
                    + Add Option
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={q.explanation || ""}
                  onChange={(e) => handleUpdateQuestion(qIndex, "explanation", e.target.value)}
                  placeholder="Explain the correct answer..."
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-600 truncate">{q.prompt || "(Empty question)"}</p>
          )}
        </div>
      ))}
    </div>
  );
}
