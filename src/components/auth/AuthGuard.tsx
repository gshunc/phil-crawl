"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import type { AuthGuardProps } from "@/types";

/**
 * AuthGuard - Wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return fallback || <AuthGuardLoadingFallback />;
  }

  // Show nothing while redirecting
  if (!user) {
    return fallback || <AuthGuardLoadingFallback />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

/**
 * Default loading fallback for AuthGuard
 */
function AuthGuardLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Higher-order component version of AuthGuard for class components or alternative usage.
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthGuardComponent(props: P) {
    return (
      <AuthGuard>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}

