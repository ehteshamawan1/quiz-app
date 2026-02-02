import { useState } from "react";
import CrosswordGrid from "../gameplay/word-cross/CrosswordGrid";

interface WordEntry {
  id: string;
  answer: string;
  clue: string;
  startRow: number;
  startCol: number;
  direction: "across" | "down";
  number: number;
}

export interface WordCrossQuestionData {
  id: string;
  prompt: string;
  words: WordEntry[];
}

interface WordCrossEditorProps {
  questions: WordCrossQuestionData[];
  onChange: (questions: WordCrossQuestionData[]) => void;
  config?: {
    gridSize?: number;
    allowHintLetters?: boolean;
    letterPenalty?: number;
  };
  onConfigChange?: (config: any) => void;
}

export default function WordCrossEditor({ questions, onChange, config, onConfigChange }: WordCrossEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const generateGrid = (words: WordEntry[], size: number = 15) => {
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        cells.push({ row: r, col: c, letter: "", isBlack: true, number: undefined });
      }
    }

    words.forEach((w) => {
      const startCellIndex = w.startRow * size + w.startCol;
      if (cells[startCellIndex]) {
        cells[startCellIndex].number = w.number;
      }

      for (let i = 0; i < w.answer.length; i++) {
        const r = w.direction === "down" ? w.startRow + i : w.startRow;
        const c = w.direction === "across" ? w.startCol + i : w.startCol;
        const cellIndex = r * size + c;
        if (cells[cellIndex]) {
          cells[cellIndex].letter = w.answer[i];
          cells[cellIndex].isBlack = false;
        }
      }
    });
    return cells;
  };

  const handleAddQuestion = () => {
    const newQuestion: WordCrossQuestionData = {
      id: `question-${Date.now()}`,
      prompt: "",
      words: []
    };
    onChange([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, field: keyof WordCrossQuestionData, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddWord = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newWord: WordEntry = {
      id: `word-${Date.now()}`,
      answer: "",
      clue: "",
      startRow: 0,
      startCol: 0,
      direction: "across",
      number: question.words.length + 1
    };
    handleUpdateQuestion(questionIndex, "words", [...question.words, newWord]);
  };

  const handleUpdateWord = (questionIndex: number, wordIndex: number, field: keyof WordEntry, value: any) => {
    const question = questions[questionIndex];
    const updatedWords = [...question.words];
    updatedWords[wordIndex] = { ...updatedWords[wordIndex], [field]: value };
    handleUpdateQuestion(questionIndex, "words", updatedWords);
  };

  const handleDeleteWord = (questionIndex: number, wordIndex: number) => {
    const question = questions[questionIndex];
    const updatedWords = question.words.filter((_, i) => i !== wordIndex);
    // Renumber remaining words
    updatedWords.forEach((word, i) => {
      word.number = i + 1;
    });
    handleUpdateQuestion(questionIndex, "words", updatedWords);
  };

  const handleDeleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const currentQuestion = editingIndex !== null ? questions[editingIndex] : null;
  const currentGrid = currentQuestion ? generateGrid(currentQuestion.words, config?.gridSize) : [];

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Crossword Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size</label>
            <input
              type="number"
              value={config?.gridSize ?? 15}
              onChange={(e) => onConfigChange?.({ ...config, gridSize: parseInt(e.target.value) })}
              min="10"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Letter Hint Penalty</label>
            <input
              type="number"
              value={config?.letterPenalty ?? 1}
              onChange={(e) => onConfigChange?.({ ...config, letterPenalty: parseInt(e.target.value) })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              checked={config?.allowHintLetters ?? true}
              onChange={(e) => onConfigChange?.({ ...config, allowHintLetters: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm">Allow hint letters</label>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crossword Puzzles ({questions.length})</h3>
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Crossword
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No crosswords yet. Click "Add Crossword" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Crossword {qIndex + 1}</span>
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
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Grid Preview */}
                      <div className="flex flex-col items-center">
                        <div className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Grid Preview</div>
                        <CrosswordGrid
                          grid={currentGrid}
                          words={question.words}
                          userAnswers={{}}
                          onCellChange={() => {}}
                          currentWord={null}
                          showErrors={false}
                        />
                        <div className="mt-4 text-xs text-gray-500 text-center">
                          Positions update automatically as you change Row/Col values.
                        </div>
                      </div>

                      {/* Right: Word List */}
                      <div className="space-y-4">
                        {/* Question Prompt */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                          <textarea
                            value={question.prompt}
                            onChange={(e) => handleUpdateQuestion(qIndex, "prompt", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={2}
                            placeholder="e.g., Complete the medical terminology crossword..."
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Words & Clues</label>
                            <button
                              onClick={() => handleAddWord(qIndex)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              + Add Word
                            </button>
                          </div>

                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {question.words.map((word, wIndex) => (
                              <div key={word.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="flex items-start space-x-2 mb-2">
                                  <span className="font-bold text-gray-600 mt-2">{word.number}.</span>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex space-x-2">
                                      <input
                                        type="text"
                                        value={word.answer}
                                        onChange={(e) =>
                                          handleUpdateWord(qIndex, wIndex, "answer", e.target.value.toUpperCase())
                                        }
                                        placeholder="ANSWER"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono"
                                      />
                                      <div className="flex gap-1">
                                        <input
                                          type="number"
                                          value={word.startRow}
                                          onChange={(e) => handleUpdateWord(qIndex, wIndex, "startRow", parseInt(e.target.value) || 0)}
                                          placeholder="R"
                                          className="w-12 px-1 py-2 border border-gray-300 rounded-md text-center"
                                          title="Start Row"
                                        />
                                        <input
                                          type="number"
                                          value={word.startCol}
                                          onChange={(e) => handleUpdateWord(qIndex, wIndex, "startCol", parseInt(e.target.value) || 0)}
                                          placeholder="C"
                                          className="w-12 px-1 py-2 border border-gray-300 rounded-md text-center"
                                          title="Start Column"
                                        />
                                      </div>
                                      <select
                                        value={word.direction}
                                        onChange={(e) => handleUpdateWord(qIndex, wIndex, "direction", e.target.value)}
                                        className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                                      >
                                        <option value="across">Acr</option>
                                        <option value="down">Dwn</option>
                                      </select>
                                      <button
                                        onClick={() => handleDeleteWord(qIndex, wIndex)}
                                        className="px-2 py-2 text-red-600 hover:text-red-800"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <textarea
                                      value={word.clue}
                                      onChange={(e) => handleUpdateWord(qIndex, wIndex, "clue", e.target.value)}
                                      placeholder="Clue for this word..."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      rows={1}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-800">
                    <div className="truncate">{question.prompt || "(No instructions)"}</div>
                    <div className="text-xs text-gray-500 mt-1">{question.words.length} words</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for Creating Crosswords</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use the Row (R) and Col (C) inputs to position words.</li>
          <li>• Ensure words intersect correctly at common letters.</li>
          <li>• (0,0) is the top-left corner of the grid.</li>
          <li>• The preview grid on the left updates in real-time.</li>
        </ul>
      </div>
    </div>
  );
}

