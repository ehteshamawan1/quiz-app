import { useState, useEffect } from "react";
import { useSound } from "../../../hooks/useSound";

interface Answer {
  id: string;
  text: string;
  isCorrect?: boolean; // May be hidden from client depending on security
}

interface Question {
  id: string;
  prompt: string;
  answers: Answer[];
  explanation?: string;
  allowMultiple?: boolean;
  backgroundImageUrl?: string;
}

interface MCQPlayerProps {
  questions: Question[];
  initialIndex?: number;
  config?: any;
  game?: { backgroundImageUrl?: string };
  onSubmitAnswer: (questionId: string, selectedAnswerIds: string[], timeSpent: number) => void;
  onComplete: () => void;
}

export default function MCQPlayer({
  questions,
  initialIndex = 0,
  config = {},
  game,
  onSubmitAnswer,
  onComplete
}: MCQPlayerProps) {
  const { playSound } = useSound();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeStarted, setTimeStarted] = useState(Date.now());
  const [results, setResults] = useState<{ isCorrect: boolean; correctIds: string[] } | null>(null);
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
    setTimeStarted(Date.now());
  }, [currentIndex]);

  const toggleAnswer = (id: string) => {
    if (showFeedback || isSubmitting) return;

    playSound('click');

    if (currentQuestion.allowMultiple) {
      setSelectedAnswers(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedAnswers([id]);
    }
  };

  const handleConfirm = async () => {
    if (selectedAnswers.length === 0 || showFeedback || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - timeStarted) / 1000);
    
    // In a real app, we verify on backend. 
    // Here we can do a quick check if isCorrect is provided, otherwise we wait for backend response if available.
    // For this prototype, we'll assume standard onSubmitAnswer handles it.
    
    // If questions were seeded with isCorrect, we can show immediate feedback
    const correctAnswers = currentQuestion.answers.filter(a => a.isCorrect);
    const correctIds = correctAnswers.map(a => a.id);
    
    let isCorrect = false;
    if (currentQuestion.allowMultiple) {
      isCorrect = selectedAnswers.length === correctIds.length && 
                  selectedAnswers.every(id => correctIds.includes(id));
    } else {
      isCorrect = selectedAnswers.length === 1 && correctIds.includes(selectedAnswers[0]);
    }

    try {
      await onSubmitAnswer(currentQuestion.id, selectedAnswers, timeSpent);
      setResults({ isCorrect, correctIds });
      setShowFeedback(true);
      playSound(isCorrect ? 'correct' : 'wrong');
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Ideally show error to user
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
      setSelectedAnswers([]);
      setShowFeedback(false);
      setResults(null);
    }
  };

  return (
    <div style={backgroundStyle} className="min-h-screen py-6">
      <div className="max-w-3xl mx-auto p-6">
        {/* Progress */}
        <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-600 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">{currentQuestion.prompt}</h2>

        <div className="space-y-4">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswers.includes(answer.id);
            const isCorrect = results?.correctIds.includes(answer.id);
            const isWrongSelection = isSelected && !isCorrect;

            let cardClass = "w-full flex items-center p-5 border-2 rounded-xl text-left transition-all ";
            
            if (!showFeedback) {
              cardClass += isSelected 
                ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200" 
                : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100";
            } else {
              if (isCorrect) {
                cardClass += "border-green-500 bg-green-50";
              } else if (isWrongSelection) {
                cardClass += "border-red-500 bg-red-50";
              } else {
                cardClass += "border-gray-100 bg-gray-50 opacity-60";
              }
            }

            return (
              <button
                key={answer.id}
                onClick={() => toggleAnswer(answer.id)}
                disabled={showFeedback || isSubmitting}
                className={cardClass}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                  isSelected ? "bg-teal-500 border-teal-500" : "bg-white border-gray-300"
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="flex-1 text-lg text-gray-700">{answer.text}</span>
                {showFeedback && isCorrect && <span className="text-green-600 ml-2 font-bold">✓</span>}
                {showFeedback && isWrongSelection && <span className="text-red-600 ml-2 font-bold">✗</span>}
              </button>
            );
          })}
        </div>

        {!showFeedback ? (
          <button
            onClick={handleConfirm}
            disabled={selectedAnswers.length === 0 || isSubmitting}
            className={`w-full mt-10 py-4 rounded-xl font-bold text-lg transition-all ${
              selectedAnswers.length > 0 && !isSubmitting
                ? "bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Confirm Answer"}
          </button>
        ) : (
          <div className="mt-8">
            <div className={`p-6 rounded-xl mb-6 ${results?.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{results?.isCorrect ? "🎉" : "💡"}</span>
                <span className="font-bold text-xl">{results?.isCorrect ? "Correct!" : "Nice try!"}</span>
              </div>
              {currentQuestion.explanation && (
                <p className="text-lg opacity-90">{currentQuestion.explanation}</p>
              )}
            </div>
            
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-900 shadow-lg shadow-gray-200"
            >
              {isLastQuestion ? "View Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
