import { useEffect, useState } from "react";

interface CountdownTimerProps {
  seconds: number;
  onTimeout: () => void;
  isPaused?: boolean;
}

export default function CountdownTimer({ seconds, onTimeout, isPaused = false }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(seconds);

  useEffect(() => {
    setTimeRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused, onTimeout]);

  const percentage = (timeRemaining / seconds) * 100;
  const isLow = percentage <= 25;
  const isMedium = percentage <= 50;

  const getColor = () => {
    if (isLow) return "text-red-600";
    if (isMedium) return "text-yellow-600";
    return "text-green-600";
  };

  const getBarColor = () => {
    if (isLow) return "bg-red-500";
    if (isMedium) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="text-center">
      <div className={`text-6xl font-bold ${getColor()} mb-2`}>
        {timeRemaining}
      </div>
      <div className="text-sm text-gray-600 mb-2">seconds remaining</div>
      <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
        <div
          className={`${getBarColor()} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
