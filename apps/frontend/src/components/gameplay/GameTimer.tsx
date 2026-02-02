import { useEffect, useState } from "react";

type GameTimerProps = {
  onTimeUpdate?: (seconds: number) => void;
  onTimeout?: () => void;
  timeLimit?: number; // Optional time limit in seconds
  autoStart?: boolean;
};

export default function GameTimer({
  onTimeUpdate,
  onTimeout,
  timeLimit,
  autoStart = true
}: GameTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newTime = prev + 1;

        // Check if time limit reached
        if (timeLimit && newTime >= timeLimit) {
          setIsRunning(false);
          onTimeout?.();
        }

        // Call update callback
        onTimeUpdate?.(newTime);

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLimit, onTimeUpdate, onTimeout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const remainingSeconds = timeLimit ? Math.max(0, timeLimit - elapsedSeconds) : null;
  const isNearTimeout = remainingSeconds !== null && remainingSeconds <= 60;

  return (
    <div className={`game-timer ${isNearTimeout ? "game-timer--warning" : ""}`}>
      <div className="game-timer__label">
        {timeLimit ? "Time Remaining" : "Time Elapsed"}
      </div>
      <div className="game-timer__value">
        {formatTime(remainingSeconds ?? elapsedSeconds)}
      </div>
    </div>
  );
}
