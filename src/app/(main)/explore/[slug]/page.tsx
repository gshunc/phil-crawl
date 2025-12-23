"use client";

import { useParams } from "next/navigation";
import { BackButton } from "@/components/layout";

/**
 * Explore Page
 *
 * Main concept exploration view.
 * Will be fully implemented in Phase 3 (Core Exploration).
 */
export default function ExplorePage() {
  const params = useParams();
  const slug = params.slug as string;

  // Convert slug to display name
  const conceptName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Back button */}
      <div className="mb-6">
        <BackButton label="Back to start" href="/start" />
      </div>

      {/* Concept Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {conceptName}
        </h1>
      </div>

      {/* Placeholder Lesson Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 mb-8">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-zinc-600 dark:text-zinc-400 italic">
            Lesson content will be loaded here in Phase 3. This will include:
          </p>
          <ul className="text-zinc-600 dark:text-zinc-400">
            <li>A clear description of the concept</li>
            <li>Historical origins and key figures</li>
            <li>Multiple scholarly perspectives</li>
            <li>Recommended reading list</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          onClick={() => alert("Go Deeper will be implemented in Phase 4")}
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Go Deeper
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          onClick={() =>
            alert("Explore New Branch will be implemented in Phase 3")
          }
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
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          Explore New Branch
        </button>
      </div>
    </div>
  );
}

