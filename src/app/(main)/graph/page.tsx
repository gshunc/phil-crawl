"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { BackButton } from "@/components/layout";

/**
 * Graph Page
 *
 * 2D graph visualization of explored concepts.
 * Unlocked after exploring 10+ nodes.
 * Will be fully implemented in Phase 4 (Advanced Features).
 */
export default function GraphPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const graphUnlocked = profile?.graph_unlocked ?? false;
  const nodesExplored = profile?.nodes_explored ?? 0;
  const nodesUntilUnlock = Math.max(0, 10 - nodesExplored);

  // Redirect if graph is locked
  useEffect(() => {
    if (profile && !graphUnlocked) {
      router.push("/start");
    }
  }, [profile, graphUnlocked, router]);

  if (!graphUnlocked) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Graph View Locked
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Explore {nodesUntilUnlock} more concept
          {nodesUntilUnlock !== 1 ? "s" : ""} to unlock the graph visualization.
        </p>
        <button
          onClick={() => router.push("/start")}
          className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Continue exploring
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <BackButton href="/start" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-4">
            Your Exploration Graph
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {nodesExplored} concepts explored
          </p>
        </div>
      </div>

      {/* Placeholder Graph Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="18" r="3" />
              <line x1="6" y1="9" x2="6" y2="15" />
              <path d="M6 18h12" />
              <path d="M18 18V9a3 3 0 0 0-3-3H9" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Graph Visualization Coming Soon
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
            The Cytoscape.js graph will be implemented in Phase 4. You&apos;ll
            be able to see and navigate all the concepts you&apos;ve explored.
          </p>
        </div>
      </div>
    </div>
  );
}

