"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";

interface RecommendedConcept {
  slug: string;
  name: string;
  description: string;
}

/**
 * Start Page
 *
 * Choose a starting point for exploration:
 * 1. Recommended starting points (based on familiarity profile)
 * 2. Search existing concepts
 * 3. Enter a new concept to explore
 */
export default function StartPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedConcepts, setRecommendedConcepts] = useState<
    RecommendedConcept[]
  >([]);
  const [recommendedLevel, setRecommendedLevel] = useState<string>("beginner");
  const [loading, setLoading] = useState(true);

  // Fetch personalized recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/onboarding/recommendations");
        if (response.ok) {
          const data = await response.json();
          setRecommendedConcepts(data.concepts);
          setRecommendedLevel(data.level);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to explore page with the search query as slug
      router.push(`/explore/${searchQuery.toLowerCase().replace(/\s+/g, "-")}`);
    }
  };

  const handleConceptClick = (slug: string) => {
    router.push(`/explore/${slug}`);
  };

  const levelLabels: Record<string, string> = {
    beginner: "Great starting points",
    intermediate: "Intermediate topics for you",
    advanced: "Advanced topics to explore",
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Where would you like to begin?
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Choose from recommended starting points, search for a concept, or
          explore something new.
        </p>
        {profile && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {profile.nodes_explored || 0} nodes explored
            {profile.graph_unlocked && " - Graph view unlocked!"}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-12">
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a concept or enter something new..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-colors"
            />
          </div>
        </form>
      </div>

      {/* Recommended Concepts */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          {loading ? "Loading recommendations..." : levelLabels[recommendedLevel] || "Recommended Starting Points"}
        </h2>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
              >
                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendedConcepts.map((concept) => (
              <button
                key={concept.slug}
                onClick={() => handleConceptClick(concept.slug)}
                className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                    {concept.name}
                  </h3>
                  <svg
                    className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors flex-shrink-0 ml-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {concept.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Or divider */}
      <div className="flex items-center gap-4 my-10">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          or explore randomly
        </span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Random exploration */}
      <div className="text-center">
        <button
          onClick={() => handleConceptClick("random")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Surprise me
        </button>
      </div>

      {/* Retake onboarding link */}
      {profile?.onboarding_complete && (
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/onboarding")}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            Retake onboarding quiz
          </button>
        </div>
      )}
    </div>
  );
}
