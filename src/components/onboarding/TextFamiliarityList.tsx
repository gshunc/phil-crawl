"use client";

import { useState } from "react";
import type { CanonicalText } from "@/types";

interface TextFamiliarityListProps {
  texts: CanonicalText[];
  onComplete: (selections: { text_name: string; has_read: boolean }[]) => void;
}

/**
 * Scrollable list of canonical philosophical texts with read/unread toggles.
 * Users can mark which texts they have read.
 */
export function TextFamiliarityList({
  texts,
  onComplete,
}: TextFamiliarityListProps) {
  const [readTexts, setReadTexts] = useState<Set<string>>(new Set());

  const toggleText = (textKey: string) => {
    setReadTexts((prev) => {
      const next = new Set(prev);
      if (next.has(textKey)) {
        next.delete(textKey);
      } else {
        next.add(textKey);
      }
      return next;
    });
  };

  const handleContinue = () => {
    const selections = texts.map((text) => {
      const textKey = `${text.title}|${text.author}`;
      return {
        text_name: `${text.title} by ${text.author}`,
        has_read: readTexts.has(textKey),
      };
    });
    onComplete(selections);
  };

  const selectAll = () => {
    const allKeys = texts.map((t) => `${t.title}|${t.author}`);
    setReadTexts(new Set(allKeys));
  };

  const selectNone = () => {
    setReadTexts(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {readTexts.size} of {texts.length} texts marked as read
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectNone}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Select all
          </button>
        </div>
      </div>

      {/* Scrollable text list */}
      <div className="max-h-96 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700">
        {texts.map((text) => {
          const textKey = `${text.title}|${text.author}`;
          const isRead = readTexts.has(textKey);

          return (
            <button
              key={textKey}
              type="button"
              onClick={() => toggleText(textKey)}
              className={`
                w-full px-4 py-3 flex items-center justify-between text-left
                hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors
                ${isRead ? "bg-zinc-50 dark:bg-zinc-800/50" : ""}
              `}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    font-medium truncate
                    ${
                      isRead
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-700 dark:text-zinc-300"
                    }
                  `}
                >
                  {text.title}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                  {text.author}
                  {text.year && ` (${text.year})`}
                </p>
              </div>

              {/* Checkbox */}
              <div
                className={`
                  w-5 h-5 rounded border-2 flex-shrink-0 ml-3
                  flex items-center justify-center transition-colors
                  ${
                    isRead
                      ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100"
                      : "border-zinc-300 dark:border-zinc-600"
                  }
                `}
              >
                {isRead && (
                  <svg
                    className="w-3 h-3 text-white dark:text-zinc-900"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
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
