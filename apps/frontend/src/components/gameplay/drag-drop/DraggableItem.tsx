import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableItemProps {
  id: string;
  content: string;
  imageUrl?: string;
  isPlaced?: boolean;
}

export default function DraggableItem({ id, content, imageUrl, isPlaced }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isPlaced
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isPlaced ? "default" : "grab"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 bg-white border-2 rounded-lg shadow-md transition-all ${
        isDragging ? "border-blue-500 shadow-lg" : "border-gray-300"
      } ${isPlaced ? "opacity-50" : "hover:border-blue-400"}`}
    >
      {imageUrl && (
        <img src={imageUrl} alt={content} className="w-full h-24 object-cover rounded mb-2" />
      )}
      <div className="text-sm font-medium text-gray-800 text-center">{content}</div>
    </div>
  );
}
