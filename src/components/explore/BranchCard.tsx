"use client";

import type { EdgeWithTarget, BranchType } from "@/types";

interface BranchCardProps {
  edge: EdgeWithTarget;
  onSelect: () => void;
  stats?: { percentage: number; count: number };
}

const BRANCH_TYPE_CONFIG: Record<
  BranchType,
  { label: string; color: string; bgColor: string }
> = {
  constructive: {
    label: "Builds Upon",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  critique: {
    label: "Critique",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
  author: {
    label: "Key Thinker",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  wildcard: {
    label: "Wildcard",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
};

/**
 * A single branch option card showing the target concept and relationship type.
 */
export function BranchCard({ edge, onSelect, stats }: BranchCardProps) {
  const config = BRANCH_TYPE_CONFIG[edge.branch_type];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full p-4 text-left rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-md transition-all group"
    >
      {/* Branch type badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${config.color} ${config.bgColor}`}
        >
          {config.label}
        </span>
        {stats && stats.count > 0 && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {Math.round(stats.percentage)}% chose this
          </span>
        )}
      </div>

      {/* Target concept name */}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
        {edge.target.name}
      </h3>

      {/* Relationship description */}
      {edge.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {edge.description}
        </p>
      )}

      {/* Hover indicator */}
      <div className="flex items-center gap-1 mt-3 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
        <span className="text-xs">Explore</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
