"use client";

import { useState, useEffect } from "react";

interface GeneratingOverlayProps {
  /** Message to display */
  message?: string;
  /** Show a countdown timer (in seconds) */
  showTimer?: boolean;
  /** Timer duration in seconds */
  timerDuration?: number;
}

/**
 * Full-screen overlay shown during generation with optional countdown timer.
 */
export function GeneratingOverlay({
  message = "Generating content...",
  showTimer = false,
  timerDuration = 60,
}: GeneratingOverlayProps) {
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);

  useEffect(() => {
    if (!showTimer) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="text-center space-y-4 p-8">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>

        {/* Message */}
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {message}
        </p>

        {/* Timer */}
        {showTimer && (
          <div className="space-y-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This may take up to a minute
            </p>
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-2">
          <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
          <div
            className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
