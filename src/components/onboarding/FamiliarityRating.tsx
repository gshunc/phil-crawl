"use client";

import type { FamiliarityLevel } from "@/types";

interface FamiliarityRatingProps {
  selected: FamiliarityLevel | null;
  onChange: (level: FamiliarityLevel) => void;
  onHelpMeDecide?: () => void;
}

const LEVELS: { value: FamiliarityLevel; label: string; description: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to this topic",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Some familiarity",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Deep understanding",
  },
];

/**
 * Familiarity level selector with Beginner/Intermediate/Advanced options
 * and an optional "Help Me Decide" button to trigger the quiz flow.
 */
export function FamiliarityRating({
  selected,
  onChange,
  onHelpMeDecide,
}: FamiliarityRatingProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {LEVELS.map((level) => {
        const isSelected = selected === level.value;

        return (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            title={level.description}
            className={`
              px-3 py-1.5 text-sm rounded-lg font-medium transition-colors
              ${
                isSelected
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              }
            `}
          >
            {level.label}
          </button>
        );
      })}

      {onHelpMeDecide && (
        <button
          type="button"
          onClick={onHelpMeDecide}
          className="px-3 py-1.5 text-sm rounded-lg font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Help me decide
        </button>
      )}
    </div>
  );
}
