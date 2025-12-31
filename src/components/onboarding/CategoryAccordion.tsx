"use client";

import { useState, useEffect } from "react";
import type { CategoryWithSubtopics, FamiliarityLevel } from "@/types";
import { FamiliarityRating } from "./FamiliarityRating";

interface SubtopicFamiliarity {
  category: string;
  subtopic: string;
  familiarity: FamiliarityLevel;
}

interface CategoryAccordionProps {
  categories: CategoryWithSubtopics[];
  initialValues?: SubtopicFamiliarity[];
  onComplete: (familiarities: SubtopicFamiliarity[]) => void;
  onQuizRequest?: (category: string, subtopic: string) => void;
}

/**
 * Expandable accordion of philosophical categories with subtopic familiarity ratings.
 * Each subtopic has Beginner/Intermediate/Advanced options and a "Help Me Decide" button.
 */
export function CategoryAccordion({
  categories,
  initialValues = [],
  onComplete,
  onQuizRequest,
}: CategoryAccordionProps) {
  const getSubtopicKey = (category: string, subtopic: string) =>
    `${category}|${subtopic}`;

  // Initialize familiarities with any initial values (e.g., from quiz results)
  const [familiarities, setFamiliarities] = useState<
    Record<string, FamiliarityLevel>
  >(() => {
    const initial: Record<string, FamiliarityLevel> = {};
    for (const val of initialValues) {
      const key = getSubtopicKey(val.category, val.subtopic);
      initial[key] = val.familiarity;
    }
    return initial;
  });

  // Track which subtopics were set from quiz (for visual indicator)
  const [fromQuiz, setFromQuiz] = useState<Set<string>>(() => {
    return new Set(
      initialValues.map((v) => getSubtopicKey(v.category, v.subtopic))
    );
  });

  // Find the category with the most recent quiz result for initial expansion
  const [expandedCategory, setExpandedCategory] = useState<string | null>(() => {
    if (initialValues.length > 0) {
      return initialValues[initialValues.length - 1].category;
    }
    return categories[0]?.name || null;
  });

  // Update state when initialValues change (e.g., returning from quiz)
  useEffect(() => {
    if (initialValues.length > 0) {
      setFamiliarities((prev) => {
        const updated = { ...prev };
        for (const val of initialValues) {
          const key = getSubtopicKey(val.category, val.subtopic);
          updated[key] = val.familiarity;
        }
        return updated;
      });

      setFromQuiz((prev) => {
        const updated = new Set(prev);
        for (const val of initialValues) {
          updated.add(getSubtopicKey(val.category, val.subtopic));
        }
        return updated;
      });

      // Expand the category of the latest quiz result
      const lastResult = initialValues[initialValues.length - 1];
      setExpandedCategory(lastResult.category);
    }
  }, [initialValues]);

  const setFamiliarity = (
    category: string,
    subtopic: string,
    level: FamiliarityLevel
  ) => {
    const key = getSubtopicKey(category, subtopic);
    setFamiliarities((prev) => ({
      ...prev,
      [key]: level,
    }));
    // Clear "from quiz" indicator when user manually changes
    setFromQuiz((prev) => {
      const updated = new Set(prev);
      updated.delete(key);
      return updated;
    });
  };

  const getFamiliarity = (
    category: string,
    subtopic: string
  ): FamiliarityLevel | null => {
    const key = getSubtopicKey(category, subtopic);
    return familiarities[key] || null;
  };

  const isFromQuiz = (category: string, subtopic: string): boolean => {
    const key = getSubtopicKey(category, subtopic);
    return fromQuiz.has(key);
  };

  const handleContinue = () => {
    const result: SubtopicFamiliarity[] = [];

    for (const category of categories) {
      for (const subtopic of category.subtopics) {
        const level = getFamiliarity(category.name, subtopic);
        if (level) {
          result.push({
            category: category.name,
            subtopic,
            familiarity: level,
          });
        } else {
          // Default to beginner if not set
          result.push({
            category: category.name,
            subtopic,
            familiarity: "beginner",
          });
        }
      }
    }

    onComplete(result);
  };

  // Count how many subtopics have been rated
  const totalSubtopics = categories.reduce(
    (sum, cat) => sum + cat.subtopics.length,
    0
  );
  const ratedCount = Object.keys(familiarities).length;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {ratedCount} of {totalSubtopics} subtopics rated
      </p>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((category) => {
          const isExpanded = expandedCategory === category.name;

          return (
            <div
              key={category.name}
              className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden"
            >
              {/* Category header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category.name)
                }
                className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {category.name}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {category.subtopics.length} subtopics
                  </span>
                </div>

                <svg
                  className={`w-5 h-5 text-zinc-400 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Subtopics (collapsed by default) */}
              {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  {category.subtopics.map((subtopic) => {
                    const quizSet = isFromQuiz(category.name, subtopic);

                    return (
                      <div
                        key={subtopic}
                        className={`px-4 py-4 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0 ${
                          quizSet
                            ? "bg-green-50 dark:bg-green-900/10"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {subtopic}
                            </span>
                            {quizSet && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                Quiz result
                              </span>
                            )}
                          </div>

                          <FamiliarityRating
                            selected={getFamiliarity(category.name, subtopic)}
                            onChange={(level) =>
                              setFamiliarity(category.name, subtopic, level)
                            }
                            onHelpMeDecide={
                              onQuizRequest
                                ? () => onQuizRequest(category.name, subtopic)
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={handleContinue}
        className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
