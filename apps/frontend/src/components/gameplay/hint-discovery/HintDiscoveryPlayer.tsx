import { useState } from "react";
import { useSound } from "../../../hooks/useSound";
import ProgressiveHintPanel from "./ProgressiveHintPanel";

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

interface HintDiscoveryQuestion {
  id: string;
  prompt: string;
  answers: Answer[];
  hints: Hint[];
  explanation?: string;
  allowMultiple: boolean;
  backgroundImageUrl?: string;
}

interface HintDiscoveryPlayerProps {
  questions: HintDiscoveryQuestion[];
  config?: {
    maxHints?: number;
    hintPenalty?: number;
    basePoints?: number;
    allowSkip?: boolean;
  };
  game?: { backgroundImageUrl?: string };
  onSubmitAnswer: (questionId: string, selectedAnswerIds: string[], hintsUsed: number, pointsEarned: number) => void;
  onComplete: () => void;
}

export default function HintDiscoveryPlayer({
  questions,
  config = {},
  game,
  onSubmitAnswer,
  onComplete
}: HintDiscoveryPlayerProps) {
  const { playSound } = useSound();
  const {
    maxHints = 5,
    hintPenalty = 2,
    basePoints = 10,
    allowSkip = false
  } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [pointsRemaining, setPointsRemaining] = useState(basePoints);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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

  const handleRevealHint = () => {
    if (isSubmitting) return;
    const sortedHints = [...currentQuestion.hints].sort((a, b) => a.order - b.order);
    const nextHint = sortedHints.find((hint) => !revealedHints.includes(hint.id));

    if (nextHint && revealedHints.length < maxHints) {
      playSound('click');
      setRevealedHints([...revealedHints, nextHint.id]);
      setPointsRemaining(Math.max(0, pointsRemaining - hintPenalty));
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (showFeedback || isSubmitting) return;
    playSound('click');
    if (currentQuestion.allowMultiple) {
      setSelectedAnswers((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId]
      );
    } else {
      setSelectedAnswers([answerId]);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Check if answer is correct
    const correctAnswerIds = currentQuestion.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);

    const correct =
      selectedAnswers.length === correctAnswerIds.length &&
      selectedAnswers.every((id) => correctAnswerIds.includes(id));

    try {
      // Submit to parent
      const earnedPoints = correct ? pointsRemaining : 0;
      await onSubmitAnswer(currentQuestion.id, selectedAnswers, revealedHints.length, earnedPoints);

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
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswers([]);
      setRevealedHints([]);
      setPointsRemaining(basePoints);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitAnswer(currentQuestion.id, [], revealedHints.length, 0);
      handleNext();
    } catch (error) {
      console.error("Error skipping question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={backgroundStyle} className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-semibold">Points: {pointsRemaining}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentQuestion.prompt}</h2>

        {/* Answer Choices */}
        <div className="space-y-3">
          {currentQuestion.answers.map((answer) => (
            <label
              key={answer.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedAnswers.includes(answer.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${showFeedback && answer.isCorrect ? "border-green-500 bg-green-50" : ""} ${
                showFeedback && selectedAnswers.includes(answer.id) && !answer.isCorrect
                  ? "border-red-500 bg-red-50"
                  : ""
              }`}
            >
              <input
                type={currentQuestion.allowMultiple ? "checkbox" : "radio"}
                checked={selectedAnswers.includes(answer.id)}
                onChange={() => !showFeedback && handleAnswerSelect(answer.id)}
                disabled={showFeedback || isSubmitting}
                className="mr-3"
              />
              <span className="text-gray-800">{answer.text}</span>
            </label>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"
            }`}
          >
            <p className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {currentQuestion.explanation && (
              <p className="text-sm text-gray-700 mt-2">{currentQuestion.explanation}</p>
            )}
            <p className="text-sm text-gray-700 mt-2">
              Points earned: <strong>{isCorrect ? pointsRemaining : 0}</strong>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          {allowSkip && !showFeedback && (
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Skipping..." : "Skip"}
            </button>
          )}
          <div className="flex-1"></div>
          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0 || isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold ${
                selectedAnswers.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              {isLastQuestion ? "Finish" : "Next Question"}
            </button>
          )}
        </div>
      </div>

      {/* Hints Panel */}
      {currentQuestion.hints.length > 0 && !showFeedback && (
        <ProgressiveHintPanel
          hints={currentQuestion.hints}
          revealedHints={revealedHints}
          onRevealHint={handleRevealHint}
          pointsRemaining={pointsRemaining}
          hintPenalty={hintPenalty}
          canRevealMore={revealedHints.length < maxHints}
        />
      )}
      </div>
    </div>
  );
}
