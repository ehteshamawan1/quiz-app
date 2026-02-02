import { useState, useEffect } from "react";
import { useSound } from "../../../hooks/useSound";
import CountdownTimer from "./CountdownTimer";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface TimedQuestion {
  id: string;
  prompt: string;
  answers: Answer[];
  explanation?: string;
  backgroundImageUrl?: string;
}

interface TimedQuizPlayerProps {
  questions: TimedQuestion[];
  config?: {
    timePerQuestion?: number;
    showTimer?: boolean;
    autoAdvance?: boolean;
    streakBonus?: boolean;
  };
  game?: { backgroundImageUrl?: string };
  onSubmitAnswer: (questionId: string, selectedAnswerId: string, timeSpent: number, isCorrect: boolean) => void;
  onComplete: (totalScore: number, streak: number) => void;
}

export default function TimedQuizPlayer({
  questions,
  config = {},
  game,
  onSubmitAnswer,
  onComplete
}: TimedQuizPlayerProps) {
  const { playSound } = useSound();
  const {
    timePerQuestion = 15,
    showTimer = true,
    autoAdvance = true,
    streakBonus = false
  } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeStarted, setTimeStarted] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
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
    // Reset timer when question changes
    setTimeStarted(Date.now());
  }, [currentIndex]);

  const handleTimeout = () => {
    // Auto-submit with no answer
    if (!showFeedback && !isSubmitting) {
      handleSubmit("");
    }
  };

  const handleSubmit = async (answerId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsPaused(true);

    const timeSpent = Math.floor((Date.now() - timeStarted) / 1000);
    const correctAnswerId = currentQuestion.answers.find((a) => a.isCorrect)?.id;
    const correct = answerId === correctAnswerId;

    setIsCorrect(correct);
    setShowFeedback(true);
    playSound(correct ? 'correct' : 'wrong');

    // Update score
    if (correct) {
      const baseScore = 1;
      const bonusScore = streakBonus ? Math.floor(streak / 5) : 0;
      setScore(score + baseScore + bonusScore);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }

    try {
      await onSubmitAnswer(currentQuestion.id, answerId, timeSpent, correct);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }

    // Auto-advance after brief feedback
    if (autoAdvance) {
      setTimeout(() => {
        handleNext();
      }, 1500);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (showFeedback || isSubmitting) return;
    playSound('click');
    setSelectedAnswer(answerId);
    handleSubmit(answerId);
  };

  const handleNext = () => {
    if (isSubmitting) return;
    if (isLastQuestion) {
      playSound('celebration');
      onComplete(score, maxStreak);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
      setIsCorrect(false);
      setIsPaused(false);
    }
  };

  return (
    <div style={backgroundStyle} className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{score}</div>
          <div className="text-sm text-blue-600">Score</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{streak}</div>
          <div className="text-sm text-purple-600">Streak</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {currentIndex + 1}/{questions.length}
          </div>
          <div className="text-sm text-green-600">Questions</div>
        </div>
      </div>

      {/* Timer */}
      {showTimer && !showFeedback && (
        <div className="mb-6">
          <CountdownTimer
            seconds={timePerQuestion}
            onTimeout={handleTimeout}
            isPaused={isPaused}
          />
        </div>
      )}

      {/* Question */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.prompt}</h2>

        {/* Answer Choices */}
        <div className="space-y-3">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrectAnswer = answer.isCorrect;

            let className = "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ";

            if (!showFeedback) {
              className += isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
            } else {
              if (isCorrectAnswer) {
                className += "border-green-500 bg-green-50";
              } else if (isSelected && !isCorrectAnswer) {
                className += "border-red-500 bg-red-50";
              } else {
                className += "border-gray-200 bg-gray-50";
              }
            }

            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={showFeedback || isSubmitting}
                className={className}
              >
                <div className="flex-1 text-left">
                  <span className="text-gray-800">{answer.text}</span>
                </div>
                {showFeedback && isCorrectAnswer && (
                  <span className="text-green-600 font-semibold">✓</span>
                )}
                {showFeedback && isSelected && !isCorrectAnswer && (
                  <span className="text-red-600 font-semibold">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-4">
            <div
              className={`p-4 rounded-lg ${
                isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              <p className="font-semibold">
                {isCorrect ? "Correct! 🎉" : "Incorrect"}
              </p>
              {currentQuestion.explanation && (
                <p className="text-sm mt-2">{currentQuestion.explanation}</p>
              )}
              {streakBonus && streak > 0 && isCorrect && (
                <p className="text-sm mt-2">
                  Streak: {streak} {streak >= 5 ? `(+${Math.floor(streak / 5)} bonus)` : ""}
                </p>
              )}
            </div>

            {!autoAdvance && (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`w-full mt-4 py-3 rounded-lg font-semibold ${
                  isSubmitting 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Saving..." : (isLastQuestion ? "Finish" : "Next Question")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      </div>
    </div>
  );
}
