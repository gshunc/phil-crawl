"use client";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

/**
 * Progress indicator for the onboarding wizard.
 * Shows numbered steps with connecting lines and completion state.
 */
export function OnboardingProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-colors
                  ${
                    isCompleted
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : isCurrent
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Connector line (not after last step) */}
              {stepNumber < totalSteps && (
                <div
                  className={`
                    w-12 h-0.5 mx-1 transition-colors
                    ${
                      isCompleted
                        ? "bg-zinc-900 dark:bg-zinc-100"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      {stepLabels && stepLabels.length === totalSteps && (
        <div className="flex justify-between mt-3 px-2">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={label}
                className={`
                  text-xs font-medium text-center flex-1
                  ${
                    isCurrent || isCompleted
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500"
                  }
                `}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
