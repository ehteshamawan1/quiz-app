import { useState, useEffect } from "react";
import { useSound } from "../../../hooks/useSound";
import CrosswordGrid from "./CrosswordGrid";
import ClueList from "./ClueList";

interface GridCell {
  row: number;
  col: number;
  letter: string;
  number?: number;
  isBlack: boolean;
}

interface Word {
  id: string;
  startRow: number;
  startCol: number;
  direction: "across" | "down";
  length: number;
  answer: string;
  number: number;
}

interface Clue {
  number: number;
  clue: string;
  answer: string;
  direction: "across" | "down";
}

interface WordCrossQuestion {
  id: string;
  prompt: string;
  grid: GridCell[];
  words: Word[];
  clues: Clue[];
  backgroundImageUrl?: string;
}

interface WordCrossPlayerProps {
  questions: WordCrossQuestion[];
  config?: {
    gridSize?: number;
    allowHintLetters?: boolean;
    letterPenalty?: number;
  };
  game?: { backgroundImageUrl?: string };
  onSubmitAnswer: (questionId: string, userAnswers: Record<string, string>, isCorrect: boolean) => void;
  onComplete: () => void;
}

export default function WordCrossPlayer({
  questions,
  config = {},
  game,
  onSubmitAnswer,
  onComplete
}: WordCrossPlayerProps) {
  const { playSound } = useSound();
  const { allowHintLetters = true, letterPenalty = 1 } = config;

  if (!questions || questions.length === 0) {
    return <div className="p-6 text-center text-gray-500">No questions available.</div>;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completedClues, setCompletedClues] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Background image: question-level overrides game-level
  const backgroundImageUrl = currentQuestion?.backgroundImageUrl || game?.backgroundImageUrl;
  const backgroundStyle = backgroundImageUrl
    ? {
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  useEffect(() => {
    // Select first word by default
    if (currentQuestion?.words.length > 0) {
      setCurrentWord(currentQuestion.words[0]);
    }
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    // Check for completed clues
    if (!currentQuestion) return;

    const newCompleted = new Set<string>();
    currentQuestion.words.forEach((word) => {
      const isComplete = Array.from({ length: word.length }, (_, i) => {
        const row = word.direction === "down" ? word.startRow + i : word.startRow;
        const col = word.direction === "across" ? word.startCol + i : word.startCol;
        const key = `${row}-${col}`;
        const cell = currentQuestion.grid.find((c) => c.row === row && c.col === col);
        return userAnswers[key] === cell?.letter;
      }).every(Boolean);

      if (isComplete) {
        newCompleted.add(`${word.number}-${word.direction}`);
      }
    });

    setCompletedClues(newCompleted);
  }, [userAnswers, currentQuestion]);

  const handleCellChange = (row: number, col: number, value: string) => {
    if (isSubmitting) return;
    if (value) playSound('click');
    const key = `${row}-${col}`;
    setUserAnswers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClueClick = (clueNumber: number, direction: "across" | "down") => {
    if (isSubmitting) return;
    playSound('click');
    const word = currentQuestion.words.find((w) => w.number === clueNumber && w.direction === direction);
    if (word) {
      setCurrentWord(word);
    }
  };

  const handleRevealLetter = () => {
    if (!currentWord || isSubmitting) return;

    // Find first incorrect letter in current word
    for (let i = 0; i < currentWord.length; i++) {
      const row = currentWord.direction === "down" ? currentWord.startRow + i : currentWord.startRow;
      const col = currentWord.direction === "across" ? currentWord.startCol + i : currentWord.startCol;
      const key = `${row}-${col}`;
      const cell = currentQuestion.grid.find((c) => c.row === row && c.col === col);

      if (cell && userAnswers[key] !== cell.letter) {
        playSound('click');
        setUserAnswers((prev) => ({
          ...prev,
          [key]: cell.letter
        }));
        setHintsUsed(hintsUsed + 1);
        break;
      }
    }
  };

  const handleCheck = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Check if all cells are correctly filled
    let correct = true;
    for (const cell of currentQuestion.grid) {
      if (!cell.isBlack) {
        const key = `${cell.row}-${cell.col}`;
        if (userAnswers[key] !== cell.letter) {
          correct = false;
          break;
        }
      }
    }

    try {
      await onSubmitAnswer(currentQuestion.id, userAnswers, correct);
      setIsCorrect(correct);
      setShowFeedback(true);
      playSound(correct ? 'correct' : 'wrong');
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      playSound('celebration');
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserAnswers({});
      setShowFeedback(false);
      setIsCorrect(false);
      setHintsUsed(0);
      setCompletedClues(new Set());
      setCurrentWord(null);
    }
  };

  const handleReset = () => {
    if (isSubmitting) return;
    setUserAnswers({});
    setHintsUsed(0);
    setCompletedClues(new Set());
  };

  const progress = (completedClues.size / currentQuestion.words.length) * 100;
  
  const allBlack = currentQuestion.grid.every(c => c.isBlack);

  return (
    <div style={backgroundStyle} className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto p-6">
      {allBlack && (
        <div className="bg-yellow-100 p-4 mb-4 text-yellow-800 text-sm">
          <strong>Debug Info:</strong> Grid appears empty. 
          Words found: {currentQuestion.words.length}. 
          {currentQuestion.words.length > 0 && `First word: ${currentQuestion.words[0].answer} at R${currentQuestion.words[0].startRow}/C${currentQuestion.words[0].startCol}`}
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>
            {completedClues.size} / {currentQuestion.words.length} words complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.prompt}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crossword Grid */}
          <div className="flex flex-col items-center">
            <CrosswordGrid
              grid={currentQuestion.grid}
              words={currentQuestion.words}
              userAnswers={userAnswers}
              onCellChange={handleCellChange}
              currentWord={currentWord}
              showErrors={showFeedback && !isCorrect}
            />
            <div className="mt-4 flex space-x-2">
              {allowHintLetters && !showFeedback && currentWord && (
                <button
                  onClick={handleRevealLetter}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reveal Letter (-{letterPenalty} pt)
                </button>
              )}
              <button
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
            {hintsUsed > 0 && (
              <div className="mt-2 text-sm text-gray-600">Hints used: {hintsUsed}</div>
            )}
          </div>

          {/* Clues */}
          <div>
            <ClueList
              clues={currentQuestion.clues}
              currentClue={currentWord?.number || null}
              onClueClick={handleClueClick}
              completedClues={completedClues}
            />
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"
            }`}
          >
            <p className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
              {isCorrect ? "Perfect! All words are correct." : "Not quite. Keep trying or check your answers."}
            </p>
            {hintsUsed > 0 && (
              <p className="text-sm text-gray-700 mt-2">
                Hints used: {hintsUsed} (penalty: -{hintsUsed * letterPenalty} points)
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          {!showFeedback ? (
            <>
              <div></div>
              <button
                onClick={handleCheck}
                disabled={Object.keys(userAnswers).length === 0 || isSubmitting}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  Object.keys(userAnswers).length === 0 || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Checking..." : "Check Answers"}
              </button>
            </>
          ) : (
            <>
              {!isCorrect && (
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-6 py-3 text-blue-600 hover:text-blue-800"
                >
                  Continue Editing
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 ml-auto"
              >
                {isLastQuestion ? "Finish" : "Next Question"}
              </button>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
