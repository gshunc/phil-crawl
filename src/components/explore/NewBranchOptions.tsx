"use client";

import { BranchCard } from "./BranchCard";
import type { EdgeWithTarget } from "@/types";

interface NewBranchOptionsProps {
  /** The 4 generated branches */
  edges: EdgeWithTarget[];
  /** Called when user selects a branch */
  onSelect: (edge: EdgeWithTarget) => void;
  /** Called when user wants to go back */
  onBack: () => void;
}

/**
 * Displays the 4 newly generated branches for user selection.
 */
export function NewBranchOptions({
  edges,
  onSelect,
  onBack,
}: NewBranchOptionsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Choose Your Path
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Select a branch to explore next
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Branch cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {edges.map((edge) => (
          <BranchCard key={edge.id} edge={edge} onSelect={() => onSelect(edge)} />
        ))}
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Each branch type offers a different perspective on the concept
      </p>
    </div>
  );
}
