import { useState } from "react";
import { useSound } from "../../../hooks/useSound";

interface FlashCardProps {
  front: string;
  back: string;
  imageUrl?: string;
  onRate?: (rating: "easy" | "medium" | "hard") => void;
  showRating?: boolean;
}

export default function FlashCard({ front, back, imageUrl, onRate, showRating = true }: FlashCardProps) {
  const { playSound } = useSound();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    playSound('click');
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: "easy" | "medium" | "hard") => {
    // Play sound based on rating
    if (rating === "easy") {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    if (onRate) {
      onRate(rating);
    }
    // Reset card after rating
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card Container */}
      <div
        className="relative w-full max-w-2xl h-96 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`absolute w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of Card */}
          <div
            className={`absolute w-full h-full bg-white rounded-lg shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center p-8 backface-hidden ${
              isFlipped ? "invisible" : ""
            }`}
          >
            <div className="text-sm text-gray-500 mb-4">Question</div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Card visual"
                className="max-w-full max-h-32 object-contain mb-4"
              />
            )}
            <div className="text-2xl font-semibold text-center text-gray-800">{front}</div>
            <div className="mt-8 text-sm text-gray-400">Click to flip</div>
          </div>

          {/* Back of Card */}
          <div
            className={`absolute w-full h-full bg-blue-50 rounded-lg shadow-lg border-2 border-blue-300 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 ${
              !isFlipped ? "invisible" : ""
            }`}
          >
            <div className="text-sm text-blue-600 mb-4">Answer</div>
            <div className="text-xl text-center text-gray-800">{back}</div>
            <div className="mt-8 text-sm text-gray-400">Click to flip back</div>
          </div>
        </div>
      </div>

      {/* Rating Buttons (shown when flipped) */}
      {showRating && onRate && isFlipped && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate("hard");
            }}
            className="flex flex-col items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <span className="font-bold">Hard</span>
            <span className="text-xs opacity-90">(Incorrect)</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate("medium");
            }}
            className="flex flex-col items-center px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <span className="font-bold">Medium</span>
            <span className="text-xs opacity-90">(Hesitated)</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate("easy");
            }}
            className="flex flex-col items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <span className="font-bold">Easy</span>
            <span className="text-xs opacity-90">(Instant)</span>
          </button>
        </div>
      )}

      {/* Flip Hint */}
      {!isFlipped && (
        <div className="mt-4 text-sm text-gray-500">
          Tap or click the card to see the answer
        </div>
      )}
    </div>
  );
}
