import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useSound } from "../../../hooks/useSound";
import DraggableItem from "./DraggableItem";
import DropZone from "./DropZone";

interface DragItem {
  id: string;
  content: string;
  imageUrl?: string;
}

interface DropZoneData {
  id: string;
  label: string;
  correctItemIds: string[];
}

interface DragDropQuestion {
  id: string;
  prompt: string;
  dragItems: DragItem[];
  dropZones: DropZoneData[];
  explanation?: string;
  backgroundImageUrl?: string;
}

interface DragDropPlayerProps {
  questions: DragDropQuestion[];
  config?: {
    dragDropType?: "match" | "sequence" | "label";
    allowMultipleAttempts?: boolean;
    autoValidate?: boolean;
  };
  game?: { backgroundImageUrl?: string };
  onSubmitAnswer: (questionId: string, placement: Record<string, string>, isCorrect: boolean) => void;
  onComplete: () => void;
}

export default function DragDropPlayer({
  questions,
  config = {},
  game,
  onSubmitAnswer,
  onComplete
}: DragDropPlayerProps) {
  const { playSound } = useSound();
  const { allowMultipleAttempts = false, autoValidate = true } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const handleDragStart = (event: DragStartEvent) => {
    if (showFeedback || isSubmitting) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (showFeedback || isSubmitting) {
      setActiveId(null);
      return;
    }
    
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const itemId = active.id as string;
      const zoneId = over.id as string;

      // Remove item from any previous zone
      const newPlacement = { ...placement };
      Object.keys(newPlacement).forEach((key) => {
        if (newPlacement[key] === itemId) {
          delete newPlacement[key];
        }
      });

      // Place in new zone
      newPlacement[zoneId] = itemId;
      setPlacement(newPlacement);
      playSound('click');

      // Auto-validate if enabled and all items placed
      if (autoValidate && Object.keys(newPlacement).length === currentQuestion.dragItems.length) {
        setTimeout(() => {
          // Check submission state again inside timeout
          if (!isSubmitting) handleValidate(newPlacement);
        }, 300);
      }
    }
  };

  const handleValidate = async (currentPlacement?: Record<string, string>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const placementToCheck = currentPlacement || placement;

    // Check if all items are placed correctly
    let correct = true;
    for (const zone of currentQuestion.dropZones) {
      const placedItemId = placementToCheck[zone.id];
      if (!zone.correctItemIds.includes(placedItemId || "")) {
        correct = false;
        break;
      }
    }

    // Convert placement to item->zone mapping
    const itemZoneMap: Record<string, string> = {};
    Object.entries(placementToCheck).forEach(([zoneId, itemId]) => {
      itemZoneMap[itemId] = zoneId;
    });

    try {
      await onSubmitAnswer(currentQuestion.id, itemZoneMap, correct);
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
      setPlacement({});
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const handleReset = () => {
    if (isSubmitting) return;
    setPlacement({});
    setShowFeedback(false);
  };

  const getPlacedItems = (zoneId: string) => {
    const itemId = placement[zoneId];
    if (!itemId) return [];
    const item = currentQuestion.dragItems.find((i) => i.id === itemId);
    return item ? [{ id: item.id, content: item.content }] : [];
  };

  const isZoneCorrect = (zoneId: string) => {
    const zone = currentQuestion.dropZones.find((z) => z.id === zoneId);
    const placedItemId = placement[zoneId];
    return zone ? zone.correctItemIds.includes(placedItemId || "") : false;
  };

  const activeItem = activeId
    ? currentQuestion.dragItems.find((item) => item.id === activeId)
    : null;

  return (
    <div style={backgroundStyle} className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.prompt}</h2>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Draggable Items */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.dragItems.map((item) => {
                  const isPlaced = Object.values(placement).includes(item.id);
                  // We can't easily disable dragging here without modifying DraggableItem props
                  // but handleDragStart prevents state update
                  return (
                    <DraggableItem
                      key={item.id}
                      id={item.id}
                      content={item.content}
                      imageUrl={item.imageUrl}
                      isPlaced={isPlaced}
                    />
                  );
                })}
              </div>
            </div>

            {/* Drop Zones */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
              <div className="space-y-3">
                {currentQuestion.dropZones.map((zone) => (
                  <DropZone
                    key={zone.id}
                    id={zone.id}
                    label={zone.label}
                    placedItems={getPlacedItems(zone.id)}
                    isCorrect={isZoneCorrect(zone.id)}
                    showFeedback={showFeedback}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="p-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg">
                <div className="text-sm font-medium text-gray-800">{activeItem.content}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"
            }`}
          >
            <p className={`font-semibold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
              {isCorrect ? "Correct! All items placed correctly." : "Incorrect. Try again."}
            </p>
            {currentQuestion.explanation && (
              <p className="text-sm text-gray-700 mt-2">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          {!showFeedback && (
            <>
              <button
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={() => handleValidate()}
                disabled={Object.keys(placement).length === 0 || isSubmitting}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  Object.keys(placement).length === 0 || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </>
          )}
          {showFeedback && (
            <>
              {allowMultipleAttempts && !isCorrect && (
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setPlacement({});
                  }}
                  className="px-6 py-3 text-blue-600 hover:text-blue-800"
                >
                  Try Again
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
