"use client";

interface QuizOption {
  text: string;
  level: "beginner" | "intermediate" | "advanced" | "incorrect";
}

interface QuizQuestionProps {
  question: string;
  options: QuizOption[];
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (option: QuizOption) => void;
  loading?: boolean;
}

/**
 * Single quiz question card with multiple choice options.
 * Shows question number, the question text, and clickable options.
 */
export function QuizQuestion({
  question,
  options,
  questionNumber,
  totalQuestions,
  onAnswer,
  loading = false,
}: QuizQuestionProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      {/* Question number */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
        {question}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => !loading && onAnswer(option)}
            disabled={loading}
            className={`
              w-full p-4 text-left rounded-xl border transition-all
              ${
                loading
                  ? "opacity-50 cursor-not-allowed border-zinc-200 dark:border-zinc-700"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Option letter */}
              <span className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                {String.fromCharCode(65 + index)}
              </span>

              {/* Option text */}
              <span className="text-zinc-800 dark:text-zinc-200 pt-0.5">
                {option.text}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center mt-6">
          <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
            Loading next question...
          </span>
        </div>
      )}
    </div>
  );
}
