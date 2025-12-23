"use client";

import { AppShell } from "@/components/layout";
import { AuthGuard } from "@/components/auth";

/**
 * Main App Layout
 *
 * Wraps all authenticated pages with:
 * - AuthGuard for route protection
 * - AppShell for consistent navigation and layout
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}

