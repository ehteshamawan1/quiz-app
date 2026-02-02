import { useDroppable } from "@dnd-kit/core";

interface DropZoneProps {
  id: string;
  label: string;
  placedItems: Array<{ id: string; content: string }>;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export default function DropZone({ id, label, placedItems, isCorrect, showFeedback }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  let borderColor = "border-gray-300";
  let bgColor = "bg-gray-50";

  if (isOver) {
    borderColor = "border-blue-500";
    bgColor = "bg-blue-50";
  }

  if (showFeedback) {
    if (isCorrect) {
      borderColor = "border-green-500";
      bgColor = "bg-green-50";
    } else if (placedItems.length > 0) {
      borderColor = "border-red-500";
      bgColor = "bg-red-50";
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-4 border-2 border-dashed rounded-lg ${borderColor} ${bgColor} transition-all`}
    >
      <div className="font-semibold text-gray-700 mb-3">{label}</div>
      <div className="space-y-2">
        {placedItems.length === 0 ? (
          <div className="text-sm text-gray-400 italic text-center py-4">Drop items here</div>
        ) : (
          placedItems.map((item) => (
            <div
              key={item.id}
              className="p-2 bg-white border border-gray-200 rounded text-sm text-gray-800"
            >
              {item.content}
            </div>
          ))
        )}
      </div>
      {showFeedback && (
        <div className="mt-2">
          {isCorrect ? (
            <span className="text-sm text-green-600 font-semibold">✓ Correct</span>
          ) : placedItems.length > 0 ? (
            <span className="text-sm text-red-600 font-semibold">✗ Incorrect</span>
          ) : (
            <span className="text-sm text-gray-500">Empty</span>
          )}
        </div>
      )}
    </div>
  );
}
