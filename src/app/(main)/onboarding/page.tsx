"use client";

import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Onboarding Page
 *
 * Multi-step wizard for familiarity assessment.
 * Will be fully implemented in Phase 2 (Onboarding Flow).
 */
export default function OnboardingPage() {
  const { profile } = useAuth();
  const router = useRouter();

  // Redirect if onboarding is already complete
  useEffect(() => {
    if (profile?.onboarding_complete) {
      router.push("/start");
    }
  }, [profile, router]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Let&apos;s get to know you
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tell us about your philosophical background so we can personalize your
          journey.
        </p>
      </div>

      {/* Placeholder for onboarding wizard */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="text-center py-12">
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
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Coming Soon
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The onboarding flow will be implemented in Phase 2.
          </p>
          <button
            onClick={() => router.push("/start")}
            className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

