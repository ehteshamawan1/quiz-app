import { useState, useRef, useEffect } from "react";

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

interface CrosswordGridProps {
  grid: GridCell[];
  words: Word[];
  userAnswers: Record<string, string>;
  onCellChange: (row: number, col: number, value: string) => void;
  currentWord: Word | null;
  showErrors?: boolean;
}

export default function CrosswordGrid({
  grid,
  words,
  userAnswers,
  onCellChange,
  currentWord,
  showErrors
}: CrosswordGridProps) {
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const maxRow = grid.length > 0 ? Math.max(...grid.map((c) => c.row)) : 14;
  const maxCol = grid.length > 0 ? Math.max(...grid.map((c) => c.col)) : 14;
  const gridSize = Math.max(maxRow, maxCol) + 1;

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getCell = (row: number, col: number): GridCell | undefined => {
    return grid.find((c) => c.row === row && c.col === col);
  };

  const isInCurrentWord = (row: number, col: number): boolean => {
    if (!currentWord) return false;

    if (currentWord.direction === "across") {
      return (
        row === currentWord.startRow &&
        col >= currentWord.startCol &&
        col < currentWord.startCol + currentWord.length
      );
    } else {
      return (
        col === currentWord.startCol &&
        row >= currentWord.startRow &&
        row < currentWord.startRow + currentWord.length
      );
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const upperValue = value.toUpperCase();
    if (/^[A-Z]?$/.test(upperValue)) {
      onCellChange(row, col, upperValue);

      // Auto-advance to next cell
      if (upperValue && currentWord) {
        const nextRow = currentWord.direction === "down" ? row + 1 : row;
        const nextCol = currentWord.direction === "across" ? col + 1 : col;
        const nextKey = getCellKey(nextRow, nextCol);

        if (inputRefs.current[nextKey]) {
          inputRefs.current[nextKey]?.focus();
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!currentWord) return;

    const moveToCell = (newRow: number, newCol: number) => {
      const cell = getCell(newRow, newCol);
      if (cell && !cell.isBlack) {
        const key = getCellKey(newRow, newCol);
        inputRefs.current[key]?.focus();
      }
    };

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveToCell(row, col - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveToCell(row, col + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveToCell(row - 1, col);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveToCell(row + 1, col);
        break;
      case "Backspace":
        if (!userAnswers[getCellKey(row, col)]) {
          e.preventDefault();
          const prevRow = currentWord.direction === "down" ? row - 1 : row;
          const prevCol = currentWord.direction === "across" ? col - 1 : col;
          moveToCell(prevRow, prevCol);
        }
        break;
    }
  };

  const getCellClassName = (cell: GridCell) => {
    if (cell.isBlack) {
      return "bg-black";
    }

    const isHighlighted = isInCurrentWord(cell.row, cell.col);
    const userAnswer = userAnswers[getCellKey(cell.row, cell.col)];
    const isError = showErrors && userAnswer && userAnswer !== cell.letter;

    let className = "bg-white border border-gray-300 relative ";

    if (isHighlighted) {
      className += "bg-blue-50 border-blue-400 ";
    }

    if (isError) {
      className += "bg-red-50 border-red-400 ";
    }

    if (focusedCell?.row === cell.row && focusedCell?.col === cell.col) {
      className += "ring-2 ring-blue-500 ";
    }

    return className;
  };

  return (
    <div className="border-4 border-red-500 p-2">
      <div
        className="grid gap-0 border-2 border-gray-400"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {Array.from({ length: gridSize }, (_, row) =>
          Array.from({ length: gridSize }, (_, col) => {
            const cell = getCell(row, col);
            const key = getCellKey(row, col);

            if (!cell) {
              return <div key={key} className="w-10 h-10 bg-white border border-gray-200"></div>;
            }

            if (cell.isBlack) {
              return <div key={key} className="w-10 h-10 bg-black"></div>;
            }

            const userAnswer = userAnswers[key] || "";

            return (
              <div key={key} className={`crossword-cell ${getCellClassName(cell)}`}>
                {cell.number && (
                  <span className="absolute top-0 left-0.5 text-[8px] font-bold text-gray-600">
                    {cell.number}
                  </span>
                )}
                <input
                  ref={(el) => (inputRefs.current[key] = el)}
                  type="text"
                  maxLength={1}
                  value={userAnswer}
                  onChange={(e) => handleCellChange(row, col, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, row, col)}
                  onFocus={() => setFocusedCell({ row, col })}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
