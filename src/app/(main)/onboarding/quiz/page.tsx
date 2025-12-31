"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizQuestion } from "@/components/onboarding";
import type { QuizAnswer, FamiliarityLevel } from "@/types";

interface QuizOption {
  text: string;
  level: FamiliarityLevel | "incorrect";
}

interface QuizQuestionData {
  question: string;
  options: QuizOption[];
  explanation: string;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const subtopic = searchParams.get("subtopic");

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestionData | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    familiarity: FamiliarityLevel;
    reasoning: string;
  } | null>(null);

  const fetchQuestion = useCallback(async (priorAnswers: QuizAnswer[]) => {
    if (!category || !subtopic) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subtopic,
          priorAnswers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get quiz question");
      }

      const data = await response.json();

      if (data.complete) {
        setResult(data.result);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data.question);
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load question"
      );
    } finally {
      setLoading(false);
    }
  }, [category, subtopic]);

  // Fetch first question on mount
  useEffect(() => {
    if (!category || !subtopic) {
      setError("Missing category or subtopic");
      setLoading(false);
      return;
    }

    fetchQuestion([]);
  }, [category, subtopic, fetchQuestion]);

  const handleAnswer = async (option: QuizOption) => {
    if (!currentQuestion) return;

    const newAnswer: QuizAnswer = {
      question: currentQuestion.question,
      answer: option.text,
      level: option.level,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Fetch next question or get result
    await fetchQuestion(updatedAnswers);
  };

  const handleUseResult = () => {
    if (!result) return;

    // Store the result and navigate back to onboarding
    // The result will be used to pre-fill the familiarity for this subtopic
    const params = new URLSearchParams({
      category: category!,
      subtopic: subtopic!,
      familiarity: result.familiarity,
    });
    router.push(`/onboarding?quizResult=${params.toString()}`);
  };

  const handleRetry = () => {
    setAnswers([]);
    setResult(null);
    setCurrentQuestion(null);
    fetchQuestion([]);
  };

  // Missing params
  if (!category || !subtopic) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400">
            Missing category or subtopic. Please start the quiz from the
            onboarding page.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="mt-4 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !currentQuestion && !result) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Result state
  if (result) {
    const levelLabels: Record<FamiliarityLevel, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    };

    const levelColors: Record<FamiliarityLevel, string> = {
      beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      advanced: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };

    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Quiz Complete!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {category} &mdash; {subtopic}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              Your assessed level:
            </p>
            <span
              className={`inline-block px-4 py-2 rounded-full font-semibold ${levelColors[result.familiarity]}`}
            >
              {levelLabels[result.familiarity]}
            </span>
          </div>

          <p className="text-zinc-700 dark:text-zinc-300 text-center mb-6">
            {result.reasoning}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUseResult}
              className="flex-1 py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Use this result
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Retake quiz
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/onboarding")}
          className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          &larr; Back to onboarding
        </button>
      </div>
    );
  }

  // Question state
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Knowledge Check
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {category} &mdash; {subtopic}
        </p>
      </div>

      {currentQuestion && (
        <QuizQuestion
          question={currentQuestion.question}
          options={currentQuestion.options}
          questionNumber={answers.length + 1}
          totalQuestions={3}
          onAnswer={handleAnswer}
          loading={loading}
        />
      )}

      <button
        onClick={() => router.push("/onboarding")}
        className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        &larr; Skip quiz and pick manually
      </button>
    </div>
  );
}

/**
 * Quiz Page
 *
 * Helps users determine their familiarity level with a subtopic
 * through a short adaptive quiz (3 questions).
 */
export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
