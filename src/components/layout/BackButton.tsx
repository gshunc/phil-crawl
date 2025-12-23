"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  /** Override the default back navigation */
  href?: string;
  /** Custom label for the button */
  label?: string;
  /** Callback when button is clicked */
  onClick?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * BackButton - Navigate to previous concept in exploration path or go back in history.
 */
export function BackButton({
  href,
  label = "Back",
  onClick,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ${className}`}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      {label}
    </button>
  );
}

