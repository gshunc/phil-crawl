"use client";

interface ActionButtonsProps {
  onGoDeeper: () => void;
  onExploreBranch: () => void;
  disabled?: boolean;
}

/**
 * Main action buttons for the explore page: "Go Deeper" and "Explore New Branch"
 */
export function ActionButtons({
  onGoDeeper,
  onExploreBranch,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Go Deeper button */}
      <button
        type="button"
        onClick={onGoDeeper}
        disabled={disabled}
        className={`
          flex-1 px-6 py-4 rounded-xl font-medium transition-all
          border-2 border-zinc-900 dark:border-zinc-100
          ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
              : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <span>Go Deeper</span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
          Socratic dialogue, videos, books
        </span>
      </button>

      {/* Explore New Branch button */}
      <button
        type="button"
        onClick={onExploreBranch}
        disabled={disabled}
        className={`
          flex-1 px-6 py-4 rounded-xl font-medium transition-all
          ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-zinc-400 text-white"
              : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <span>Explore New Branch</span>
        </div>
        <span className="text-xs opacity-75 mt-1 block">
          Find related concepts
        </span>
      </button>
    </div>
  );
}
