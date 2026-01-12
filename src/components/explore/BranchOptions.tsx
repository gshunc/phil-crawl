"use client";

import { BranchCard } from "./BranchCard";
import type { Concept, EdgeWithTarget } from "@/types";

interface BranchOptionsProps {
  /** Existing edges from the current concept */
  existingEdges: EdgeWithTarget[];
  /** Nearest neighbor concepts (from embedding similarity) */
  nearestConcepts: Concept[];
  /** Stats for existing edges */
  edgeStats?: Record<string, { percentage: number; count: number }>;
  /** Called when user selects an existing edge */
  onSelectEdge: (edge: EdgeWithTarget) => void;
  /** Called when user selects a nearest neighbor concept */
  onSelectNearest: (concept: Concept) => void;
  /** Called when user wants to generate new branches */
  onGenerateNew: () => void;
  /** Whether generation is allowed (rate limit) */
  canGenerate: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * Shows available branch options: existing edges, nearest neighbors, and generate new.
 */
export function BranchOptions({
  existingEdges,
  nearestConcepts,
  edgeStats,
  onSelectEdge,
  onSelectNearest,
  onGenerateNew,
  canGenerate,
  loading = false,
}: BranchOptionsProps) {
  const hasExistingEdges = existingEdges.length > 0;
  const hasNearestConcepts = nearestConcepts.length > 0;

  return (
    <div className="space-y-6">
      {/* Existing Edges Section */}
      {hasExistingEdges && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Existing Connections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {existingEdges.map((edge) => (
              <BranchCard
                key={edge.id}
                edge={edge}
                onSelect={() => onSelectEdge(edge)}
                stats={edgeStats?.[edge.branch_type]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nearest Neighbors Section */}
      {hasNearestConcepts && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Related Concepts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nearestConcepts.map((concept) => (
              <button
                key={concept.id}
                type="button"
                onClick={() => onSelectNearest(concept)}
                className="p-4 text-left rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-md transition-all"
              >
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {concept.name}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {concept.description?.slice(0, 100)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate New Section */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <button
          type="button"
          onClick={onGenerateNew}
          disabled={!canGenerate || loading}
          className={`
            w-full p-4 rounded-xl border-2 border-dashed transition-all
            ${
              canGenerate && !loading
                ? "border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                : "border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed"
            }
          `}
        >
          <div className="flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  Generating branches...
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 text-zinc-500 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  Generate New Branches
                </span>
              </>
            )}
          </div>
          {!canGenerate && !loading && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Rate limit reached. Try again later.
            </p>
          )}
        </button>
      </div>
    </div>
  );
}
