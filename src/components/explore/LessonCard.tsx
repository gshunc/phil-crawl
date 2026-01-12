"use client";

import type { Concept } from "@/types";

interface LessonCardProps {
  concept: Concept;
}

/**
 * Displays the main concept lesson content with description and recommended reading.
 */
export function LessonCard({ concept }: LessonCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
      {/* Concept title */}
      <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        {concept.name}
      </h1>

      {/* Description */}
      <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {concept.description}
        </p>
      </div>

      {/* Recommended Reading */}
      {concept.recommended_reading && concept.recommended_reading.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recommended Reading
          </h2>
          <ul className="space-y-3">
            {concept.recommended_reading.map((reading, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400"
              >
                <span className="text-zinc-400 dark:text-zinc-600 mt-0.5">•</span>
                <span className="text-sm leading-relaxed">{reading}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
