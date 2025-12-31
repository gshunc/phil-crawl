"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OnboardingProgress,
  TextFamiliarityList,
  CategoryAccordion,
} from "@/components/onboarding";
import type { CanonicalText, CategoryWithSubtopics, FamiliarityLevel } from "@/types";

type OnboardingStep = "texts" | "categories" | "saving";

interface TextSelection {
  text_name: string;
  has_read: boolean;
}

interface CategorySelection {
  category: string;
  subtopic: string;
  familiarity: FamiliarityLevel;
}

interface QuizResult {
  category: string;
  subtopic: string;
  familiarity: FamiliarityLevel;
}

function OnboardingContent() {
  const { profile, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<OnboardingStep>("texts");
  const [texts, setTexts] = useState<CanonicalText[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubtopics[]>([]);
  const [textSelections, setTextSelections] = useState<TextSelection[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for quiz result in URL params on mount
  useEffect(() => {
    const quizResultParam = searchParams.get("quizResult");
    if (quizResultParam) {
      try {
        const params = new URLSearchParams(quizResultParam);
        const category = params.get("category");
        const subtopic = params.get("subtopic");
        const familiarity = params.get("familiarity") as FamiliarityLevel;

        if (category && subtopic && familiarity) {
          // Add the quiz result to the list
          setQuizResults((prev) => {
            // Replace existing result for same category/subtopic
            const filtered = prev.filter(
              (r) => !(r.category === category && r.subtopic === subtopic)
            );
            return [...filtered, { category, subtopic, familiarity }];
          });

          // Jump to categories step
          setStep("categories");

          // Clear the URL param without triggering navigation
          window.history.replaceState({}, "", "/onboarding");
        }
      } catch (err) {
        console.error("Error parsing quiz result:", err);
      }
    }
  }, [searchParams]);

  // Redirect if onboarding is already complete
  useEffect(() => {
    if (profile?.onboarding_complete) {
      router.push("/start");
    }
  }, [profile, router]);

  // Fetch texts and categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [textsRes, categoriesRes] = await Promise.all([
          fetch("/api/onboarding/texts"),
          fetch("/api/onboarding/categories"),
        ]);

        if (!textsRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to load onboarding data");
        }

        const textsData = await textsRes.json();
        const categoriesData = await categoriesRes.json();

        setTexts(textsData.texts);
        setCategories(categoriesData.categories);
      } catch (err) {
        console.error("Error loading onboarding data:", err);
        setError("Failed to load onboarding data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleTextsComplete = (selections: TextSelection[]) => {
    setTextSelections(selections);
    setStep("categories");
  };

  const handleCategoriesComplete = async (
    categorySelections: CategorySelection[]
  ) => {
    setStep("saving");
    setError(null);

    try {
      const response = await fetch("/api/onboarding/familiarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textSelections,
          categories: categorySelections,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save familiarity data");
      }

      // Refresh user profile to get updated onboarding_complete status
      await refreshUser();

      // Navigate to start page
      router.push("/start");
    } catch (err) {
      console.error("Error saving familiarity:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save. Please try again."
      );
      setStep("categories");
    }
  };

  const handleQuizRequest = (category: string, subtopic: string) => {
    // Navigate to quiz page with category and subtopic as params
    const params = new URLSearchParams({ category, subtopic });
    router.push(`/onboarding/quiz?${params.toString()}`);
  };

  const getStepNumber = () => {
    switch (step) {
      case "texts":
        return 1;
      case "categories":
      case "saving":
        return 2;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Let&apos;s get to know you
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tell us about your philosophical background so we can personalize your
          journey.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <OnboardingProgress
          currentStep={getStepNumber()}
          totalSteps={2}
          stepLabels={["Texts Read", "Topic Familiarity"]}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        {step === "texts" && (
          <>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Which texts have you read?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Select the philosophical texts you&apos;re familiar with. Don&apos;t
              worry if you haven&apos;t read many - that&apos;s what we&apos;re
              here to help with!
            </p>
            <TextFamiliarityList texts={texts} onComplete={handleTextsComplete} />
          </>
        )}

        {step === "categories" && (
          <>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Rate your familiarity
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              For each topic, select your familiarity level. Use &quot;Help me
              decide&quot; if you&apos;re unsure.
            </p>
            <CategoryAccordion
              categories={categories}
              initialValues={quizResults}
              onComplete={handleCategoriesComplete}
              onQuizRequest={handleQuizRequest}
            />
          </>
        )}

        {step === "saving" && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Saving your preferences...
            </p>
          </div>
        )}
      </div>

      {/* Back button for categories step */}
      {step === "categories" && (
        <button
          type="button"
          onClick={() => setStep("texts")}
          className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          &larr; Back to texts
        </button>
      )}
    </div>
  );
}

/**
 * Onboarding Page
 *
 * Multi-step wizard for familiarity assessment:
 * 1. Select which canonical texts you've read
 * 2. Rate your familiarity with philosophical categories
 * 3. Save and proceed to starting point selection
 */
export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
