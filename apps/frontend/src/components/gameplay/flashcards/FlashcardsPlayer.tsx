import { useState, useEffect } from "react";
import { useSound } from "../../../hooks/useSound";
import FlashCard from "./FlashCard";

interface FlashcardQuestion {
  id: string;
  front: string;
  back: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
}

interface FlashcardsPlayerProps {
  questions: FlashcardQuestion[];
  config?: {
    includeImages?: boolean;
    shuffleCards?: boolean;
    selfRating?: boolean;
  };
  game?: { backgroundImageUrl?: string };
  onComplete?: (ratings: Record<string, string>) => void;
}

export default function FlashcardsPlayer({ questions, config, game, onComplete }: FlashcardsPlayerProps) {
  const { playSound } = useSound();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<FlashcardQuestion[]>([]);
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [lastDebug, setLastDebug] = useState<string>("None");

  useEffect(() => {
    // Deduplicate questions by ID to prevent infinite loops if data is bad
    const uniqueIds = new Set();
    const uniqueQuestions = questions.filter(q => {
      if (uniqueIds.has(q.id)) return false;
      uniqueIds.add(q.id);
      return true;
    });

    // Shuffle cards if configured
    let processedCards = [...uniqueQuestions];
    if (config?.shuffleCards) {
      processedCards = shuffleArray(processedCards);
    }
    setCards(processedCards);
  }, [questions, config?.shuffleCards]);

  useEffect(() => {
    // Update progress
    const ratedCount = Object.keys(ratings).length;
    // Avoid division by zero
    const total = cards.length || 1; 
    setProgress((ratedCount / total) * 100);
  }, [ratings, cards.length]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

    const handleRate = (rating: "easy" | "medium" | "hard", cardId: string) => {
      setRatings((prev) => {
        const next = { ...prev, [cardId]: rating };
        return next;
      });
  
      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };
  
    const handlePrevious = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
  
    const handleNext = () => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };
  
    const handleFinish = () => {
      playSound('celebration');
      if (onComplete) {
        onComplete(ratings);
      }
    };
  
    if (cards.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">No flashcards available</p>
        </div>
      );
    }
  
    const currentCard = cards[currentIndex];
    const allRated = Object.keys(ratings).length === cards.length;

    // Background image: question-level overrides game-level
    const backgroundImageUrl = currentCard?.backgroundImageUrl || game?.backgroundImageUrl;
    const backgroundStyle = backgroundImageUrl
      ? {
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      : {};

    // Default to self-rating enabled if not explicitly disabled
    const shouldEnableSelfRating = config?.selfRating !== false;

    if (allRated) {
      const easyCount = Object.values(ratings).filter((r) => r === "easy").length;
      const mediumCount = Object.values(ratings).filter((r) => r === "medium").length;
      const hardCount = Object.values(ratings).filter((r) => r === "hard").length;
      const masteryScore = Math.round(
        ((easyCount * 1 + mediumCount * 0.5) / cards.length) * 100
      );
  
      return (
        <div style={backgroundStyle} className="min-h-screen py-8">
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">All Cards Completed!</h2>
            <p className="text-gray-600 mb-8">You've rated every flashcard in this set.</p>
  
            <div className="mb-8">
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Mastery Score</div>
              <div className="text-5xl font-extrabold text-blue-600">{masteryScore}%</div>
            </div>
  
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{easyCount}</div>
                <div className="text-sm text-green-800 font-medium">Easy</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
                <div className="text-sm text-yellow-800 font-medium">Medium</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{hardCount}</div>
                <div className="text-sm text-red-800 font-medium">Hard</div>
              </div>
            </div>
  
            <button
              onClick={handleFinish}
              className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-lg transform transition hover:scale-105"
            >
              Finish & Exit
            </button>
          </div>
          </div>
        </div>
      );
    }

    return (
      <div style={backgroundStyle} className="min-h-screen py-6">
        <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {shouldEnableSelfRating && (
            <p className="text-xs text-gray-500 text-center italic">
              Rate your mastery: <strong>Easy</strong> (Instant), <strong>Medium</strong> (Hesitated), <strong>Hard</strong> (Incorrect)
            </p>
          )}
        </div>
  
        {/* Flashcard */}
        <FlashCard
          key={currentCard.id}
          front={currentCard.front}
          back={currentCard.back}
          imageUrl={config?.includeImages ? currentCard.imageUrl : undefined}
          onRate={shouldEnableSelfRating ? (r) => handleRate(r, currentCard.id) : undefined}
          showRating={shouldEnableSelfRating}
        />
  
        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`px-6 py-2 rounded-lg ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            Previous
          </button>
  
          <div className="text-sm text-gray-600">
            {ratings[currentCard.id] && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                Rated: {ratings[currentCard.id]}
              </span>
            )}
          </div>
  
          {!shouldEnableSelfRating ? (
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`px-6 py-2 rounded-lg ${
                currentIndex === cards.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          ) : (
            <div>
              {currentIndex < cards.length - 1 && (
                 <button
                   onClick={handleNext}
                   className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                 >
                   Skip
                 </button>
              )}
              {/* Finish button is now handled by the summary view */}
            </div>
          )}
        </div>
      </div>
      </div>
    );
  }
