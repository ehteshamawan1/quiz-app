interface Clue {
  number: number;
  clue: string;
  answer: string;
  direction: "across" | "down";
}

interface ClueListProps {
  clues: Clue[];
  currentClue: number | null;
  onClueClick: (clueNumber: number, direction: "across" | "down") => void;
  completedClues: Set<string>;
}

export default function ClueList({ clues, currentClue, onClueClick, completedClues }: ClueListProps) {
  const acrossClues = clues.filter((c) => c.direction === "across");
  const downClues = clues.filter((c) => c.direction === "down");

  const renderClue = (clue: Clue) => {
    const clueKey = `${clue.number}-${clue.direction}`;
    const isCompleted = completedClues.has(clueKey);
    const isCurrent = currentClue === clue.number;

    return (
      <li
        key={clueKey}
        onClick={() => onClueClick(clue.number, clue.direction)}
        className={`p-2 rounded cursor-pointer transition-colors ${
          isCurrent ? "bg-blue-100 border-blue-400" : isCompleted ? "bg-green-50" : "hover:bg-gray-100"
        } ${isCompleted ? "line-through text-gray-500" : ""}`}
      >
        <span className="font-semibold mr-2">{clue.number}.</span>
        <span>{clue.clue}</span>
        {isCompleted && <span className="ml-2 text-green-600">✓</span>}
      </li>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Across Clues */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Across</h3>
        <ul className="space-y-2">
          {acrossClues.length > 0 ? (
            acrossClues.map(renderClue)
          ) : (
            <li className="text-gray-500 italic">No across clues</li>
          )}
        </ul>
      </div>

      {/* Down Clues */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Down</h3>
        <ul className="space-y-2">
          {downClues.length > 0 ? (
            downClues.map(renderClue)
          ) : (
            <li className="text-gray-500 italic">No down clues</li>
          )}
        </ul>
      </div>
    </div>
  );
}
