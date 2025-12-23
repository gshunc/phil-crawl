"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth";
import { useAuth } from "@/hooks";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, profile } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      // If user hasn't completed onboarding, redirect there
      if (profile && !profile.onboarding_complete) {
        router.push("/onboarding");
      } else {
        router.push("/start");
      }
    }
  }, [user, loading, profile, router]);

  const handleSuccess = () => {
    // The useEffect above will handle the redirect
    // This is here for any immediate actions needed
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
          <div className="w-8 h-8 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  // Don't render form if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return <LoginForm onSuccess={handleSuccess} />;
}

