"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/components/layout";
import {
  LessonCard,
  ActionButtons,
  BranchOptions,
  NewBranchOptions,
  GeneratingOverlay,
  RateLimitWarning,
} from "@/components/explore";
import {
  useConcept,
  useNearestConcepts,
  useGenerateBranches,
  useGenerateConcept,
  useRateLimit,
  useExploreNode,
  useExplorationStore,
  useGraphDataStore,
} from "@/hooks";
import type { Concept, EdgeWithTarget, BranchType } from "@/types";

type ExploreView = "lesson" | "branches" | "new-branches";

/**
 * Component shown when a concept doesn't exist, offering to generate it
 */
function ConceptNotFound({ slug }: { slug: string }) {
  const router = useRouter();
  const { generate, loading, error } = useGenerateConcept();
  const { allowed: canGenerate, remaining } = useRateLimit();

  // Convert slug to display name
  const conceptName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleGenerate = async () => {
    const newConcept = await generate(conceptName);
    if (newConcept) {
      // Reload the page to show the new concept
      router.refresh();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <BackButton label="Back to start" href="/start" />
      </div>

      {loading ? (
        <GeneratingOverlay
          message={`Generating "${conceptName}"...`}
          showTimer
          timerDuration={60}
        />
      ) : null}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {conceptName}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          This concept hasn't been explored yet. Would you like to generate it?
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${
                canGenerate && !loading
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Generating..." : "Generate This Concept"}
          </button>
          <button
            onClick={() => router.push("/start")}
            className="px-6 py-3 rounded-xl font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Go Back
          </button>
        </div>

        {!canGenerate && (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            Rate limit reached. Try again later.
          </p>
        )}

        {canGenerate && remaining < 10 && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            {remaining} generation{remaining === 1 ? "" : "s"} remaining this hour
          </p>
        )}
      </div>
    </div>
  );
}

function ExplorePageContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // State
  const [view, setView] = useState<ExploreView>("lesson");
  const [edgeStats, setEdgeStats] = useState<
    Record<string, { percentage: number; count: number }>
  >({});
  const [hasRecordedExplore, setHasRecordedExplore] = useState(false);

  // Hooks
  const { concept, edges, loading: conceptLoading, error: conceptError } = useConcept(slug);
  const {
    concepts: nearestConcepts,
    loading: nearestLoading,
    fetch: fetchNearest,
  } = useNearestConcepts();
  const {
    branches: generatedBranches,
    loading: generatingBranches,
    generate: generateBranches,
    reset: resetBranches,
  } = useGenerateBranches();
  const { allowed: canGenerate, remaining, resetAt, check: checkRateLimit } = useRateLimit();
  const { explore: recordExplore } = useExploreNode();

  // Store
  const { path, pushPath, popPath } = useExplorationStore();
  const { addVisitedNode, addEdges: addGraphEdges } = useGraphDataStore();

  // Record exploration when concept loads
  useEffect(() => {
    if (concept && !hasRecordedExplore) {
      setHasRecordedExplore(true);
      recordExplore(concept.id);
      addVisitedNode(concept);

      // Add to path if not already the current
      if (path.length === 0 || path[path.length - 1] !== slug) {
        pushPath(slug);
      }
    }
  }, [concept, hasRecordedExplore, recordExplore, addVisitedNode, path, pushPath, slug]);

  // Add edges to graph when they load
  useEffect(() => {
    if (concept && edges.length > 0) {
      addGraphEdges(concept.id, edges);
    }
  }, [concept, edges, addGraphEdges]);

  // Fetch edge stats when edges load
  useEffect(() => {
    if (concept && edges.length > 0) {
      fetchEdgeStats(concept.slug);
    }
  }, [concept, edges]);

  const fetchEdgeStats = async (conceptSlug: string) => {
    try {
      const response = await fetch(`/api/concepts/${encodeURIComponent(conceptSlug)}/analytics`);
      if (response.ok) {
        const data = await response.json();
        const stats: Record<string, { percentage: number; count: number }> = {};
        for (const stat of data.stats) {
          stats[stat.type] = { percentage: stat.percentage, count: stat.count };
        }
        setEdgeStats(stats);
      }
    } catch (err) {
      console.error("Failed to fetch edge stats:", err);
    }
  };

  // Handle back navigation
  const handleBack = useCallback(() => {
    const previousSlug = popPath();
    if (previousSlug && path.length > 1) {
      router.push(`/explore/${path[path.length - 2]}`);
    } else {
      router.push("/start");
    }
  }, [popPath, path, router]);

  // Handle Go Deeper
  const handleGoDeeper = useCallback(() => {
    if (concept) {
      router.push(`/explore/${slug}/deeper`);
    }
  }, [concept, router, slug]);

  // Handle Explore New Branch
  const handleExploreBranch = useCallback(async () => {
    if (!concept) return;

    setView("branches");

    // Fetch nearest concepts if we don't have them yet
    if (nearestConcepts.length === 0) {
      fetchNearest(concept.id);
    }
  }, [concept, nearestConcepts.length, fetchNearest]);

  // Handle selecting an existing edge
  const handleSelectEdge = useCallback(
    async (edge: EdgeWithTarget) => {
      // Record the choice for analytics
      try {
        await fetch(`/api/concepts/${encodeURIComponent(slug)}/choose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchType: edge.branch_type }),
        });
      } catch (err) {
        console.error("Failed to record branch choice:", err);
      }

      // Navigate to the target concept
      router.push(`/explore/${edge.target.slug}`);
    },
    [slug, router]
  );

  // Handle selecting a nearest neighbor
  const handleSelectNearest = useCallback(
    (nearestConcept: Concept) => {
      router.push(`/explore/${nearestConcept.slug}`);
    },
    [router]
  );

  // Handle generate new branches
  const handleGenerateNew = useCallback(async () => {
    if (!concept) return;

    const newBranches = await generateBranches(slug);

    if (newBranches.length > 0) {
      setView("new-branches");
      // Refresh rate limit
      checkRateLimit();
    }
  }, [concept, slug, generateBranches, checkRateLimit]);

  // Handle selecting a generated branch
  const handleSelectGeneratedBranch = useCallback(
    async (edge: EdgeWithTarget) => {
      // Record the choice for analytics
      try {
        await fetch(`/api/concepts/${encodeURIComponent(slug)}/choose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchType: edge.branch_type }),
        });
      } catch (err) {
        console.error("Failed to record branch choice:", err);
      }

      // Navigate to the target concept
      router.push(`/explore/${edge.target.slug}`);
    },
    [slug, router]
  );

  // Handle back from branches view
  const handleBackFromBranches = useCallback(() => {
    setView("lesson");
    resetBranches();
  }, [resetBranches]);

  // Loading state
  if (conceptLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Error state - offer to generate concept
  if (conceptError || !concept) {
    return <ConceptNotFound slug={slug} />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Generating overlay */}
      {generatingBranches && (
        <GeneratingOverlay
          message="Generating new branches..."
          showTimer
          timerDuration={60}
        />
      )}

      {/* Back button */}
      <div className="mb-6">
        <BackButton
          label={path.length > 1 ? "Back" : "Back to start"}
          href={path.length > 1 ? "#" : "/start"}
          onClick={path.length > 1 ? handleBack : undefined}
        />
      </div>

      {/* Rate limit warning */}
      {remaining < 5 && (
        <div className="mb-6">
          <RateLimitWarning resetAt={resetAt} remaining={remaining} />
        </div>
      )}

      {/* Main content based on view */}
      {view === "lesson" && (
        <>
          {/* Lesson card */}
          <div className="mb-8">
            <LessonCard concept={concept} />
          </div>

          {/* Action buttons */}
          <ActionButtons
            onGoDeeper={handleGoDeeper}
            onExploreBranch={handleExploreBranch}
          />
        </>
      )}

      {view === "branches" && (
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Explore from {concept.name}
            </h2>
            <button
              type="button"
              onClick={handleBackFromBranches}
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
              Back to lesson
            </button>
          </div>

          <BranchOptions
            existingEdges={edges}
            nearestConcepts={nearestConcepts}
            edgeStats={edgeStats}
            onSelectEdge={handleSelectEdge}
            onSelectNearest={handleSelectNearest}
            onGenerateNew={handleGenerateNew}
            canGenerate={canGenerate}
            loading={nearestLoading}
          />
        </div>
      )}

      {view === "new-branches" && generatedBranches.length > 0 && (
        <NewBranchOptions
          edges={generatedBranches}
          onSelect={handleSelectGeneratedBranch}
          onBack={handleBackFromBranches}
        />
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
