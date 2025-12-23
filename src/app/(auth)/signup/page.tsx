"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignupForm } from "@/components/auth";
import { useAuth } from "@/hooks";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect authenticated users to onboarding
  useEffect(() => {
    if (!loading && user) {
      router.push("/onboarding");
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    // Redirect to onboarding after successful signup
    router.push("/onboarding");
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

  return <SignupForm onSuccess={handleSuccess} />;
}

