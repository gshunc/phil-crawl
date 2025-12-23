"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import type { NavBarProps } from "@/types";

/**
 * NavBar - Top navigation component with logo, user menu, and graph link.
 */
export function NavBar({ onLogout: customOnLogout }: NavBarProps) {
  const { user, profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (customOnLogout) {
      customOnLogout();
    } else {
      await logout();
    }
    setIsMenuOpen(false);
  };

  const graphUnlocked = profile?.graph_unlocked ?? false;
  const nodesExplored = profile?.nodes_explored ?? 0;
  const nodesUntilUnlock = Math.max(0, 10 - nodesExplored);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/start"
            className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            <span className="font-semibold text-lg hidden sm:block">
              PhilTreeCrawler
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Graph Link */}
            {graphUnlocked ? (
              <Link
                href="/graph"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="18" r="3" />
                  <line x1="6" y1="9" x2="6" y2="15" />
                  <path d="M6 18h12" />
                  <path d="M18 18V9a3 3 0 0 0-3-3H9" />
                </svg>
                <span className="hidden sm:block">Graph View</span>
              </Link>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                title={`Explore ${nodesUntilUnlock} more nodes to unlock`}
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="hidden sm:block">
                  {nodesUntilUnlock} to unlock
                </span>
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isMenuOpen ? "rotate-180" : ""
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

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
                      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {nodesExplored} nodes explored
                        </p>
                      </div>

                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
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
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

