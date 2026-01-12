"use client";

interface RateLimitWarningProps {
  /** When the rate limit resets (ISO timestamp) */
  resetAt: string | null;
  /** Number of remaining generations */
  remaining: number;
}

/**
 * Warning banner shown when user is at or near their rate limit.
 */
export function RateLimitWarning({ resetAt, remaining }: RateLimitWarningProps) {
  const formatResetTime = (isoString: string | null): string => {
    if (!isoString) return "soon";

    const resetDate = new Date(isoString);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();

    if (diffMs <= 0) return "now";

    const diffMins = Math.ceil(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `in ${diffMins} minute${diffMins === 1 ? "" : "s"}`;
    }

    return resetDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isExceeded = remaining === 0;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isExceeded
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <div
          className={`flex-shrink-0 ${
            isExceeded
              ? "text-amber-500 dark:text-amber-400"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isExceeded ? (
            <>
              <h4 className="font-medium text-amber-800 dark:text-amber-300">
                Rate Limit Reached
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                You've used all your generations for this hour. You can generate
                more {formatResetTime(resetAt)}.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-medium text-zinc-700 dark:text-zinc-300">
                Generation Limit
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {remaining} generation{remaining === 1 ? "" : "s"} remaining this
                hour. Use them wisely!
              </p>
            </>
          )}
        </div>

        {/* Counter badge */}
        <div
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-sm font-medium ${
            isExceeded
              ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {remaining}/10
        </div>
      </div>
    </div>
  );
}
