"use client";

import { NavBar } from "./NavBar";
import type { AppShellProps } from "@/types";

/**
 * AppShell - Main layout wrapper with navigation.
 * Provides consistent structure across all authenticated pages.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

