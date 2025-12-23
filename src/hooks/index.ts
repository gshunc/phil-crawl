"use client";

/**
 * Custom React Hooks
 *
 * Hooks:
 * - useAuth - Authentication state and methods (login, logout, signup)
 * - useProfile - User profile data and refetch
 * - useConcept - Fetch concept by slug with edges
 * - useNearestConcepts - Fetch nearest neighbor concepts via embeddings
 * - useGenerateConcept - Generate new concept via Gemini Flash
 * - useGenerateBranches - Generate 4 branches for a concept
 * - useRateLimit - Check and track generation rate limits
 * - useSocraticDialogue - Manage Socratic dialogue state and history
 * - useDeeper - Fetch Go Deeper content (expand, videos, books)
 * - useExplorationPath - Track session exploration path stack
 * - useSessionCache - Cache Go Deeper content in session
 * - useGraphData - Prepare and manage graph visualization data
 */

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  UserProfile,
  LoginCredentials,
  SignupCredentials,
  AuthActionResponse,
} from "@/types";

// =============================================
// AUTH HOOK
// =============================================

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthActionResponse>;
  signup: (credentials: SignupCredentials) => Promise<AuthActionResponse>;
  logout: () => Promise<AuthActionResponse>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  // Fetch user profile from database
  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (!data) return null;

      // Type assertion for database row
      const row = data as {
        id: string;
        onboarding_complete: boolean | null;
        nodes_explored: number | null;
        graph_unlocked: boolean | null;
        created_at: string | null;
      };

      return {
        id: row.id,
        onboarding_complete: row.onboarding_complete ?? false,
        nodes_explored: row.nodes_explored ?? 0,
        graph_unlocked: row.graph_unlocked ?? false,
        created_at: row.created_at,
      };
    },
    [supabase]
  );

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await fetchProfile(currentUser.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
  }, [supabase, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await fetchProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await fetchProfile(currentUser.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthActionResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Login failed");
          return { success: false, error: data.error };
        }

        // Refresh to get the latest user data
        await refreshUser();

        return { success: true, message: data.message };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [refreshUser]
  );

  // Signup function
  const signup = useCallback(
    async (credentials: SignupCredentials): Promise<AuthActionResponse> => {
      setLoading(true);
      setError(null);

      // Validate password confirmation if provided
      if (
        credentials.confirmPassword &&
        credentials.password !== credentials.confirmPassword
      ) {
        setError("Passwords do not match");
        setLoading(false);
        return { success: false, error: "Passwords do not match" };
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Signup failed");
          return { success: false, error: data.error };
        }

        // Refresh to get the latest user data
        await refreshUser();

        return { success: true, message: data.message };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Signup failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [refreshUser]
  );

  // Logout function
  const logout = useCallback(async (): Promise<AuthActionResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Logout failed");
        return { success: false, error: data.error };
      }

      setUser(null);
      setProfile(null);

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    login,
    signup,
    logout,
    refreshUser,
  };
}

// =============================================
// PLACEHOLDER EXPORTS FOR OTHER HOOKS
// (To be implemented in later phases)
// =============================================

// These hooks will be implemented in Phase 3 (Core Exploration) and Phase 4 (Advanced Features)
// export function useConcept(slug: string) { ... }
// export function useNearestConcepts(conceptId: string) { ... }
// export function useGenerateConcept() { ... }
// export function useGenerateBranches(conceptId: string) { ... }
// export function useRateLimit() { ... }
// export function useSocraticDialogue(conceptId: string) { ... }
// export function useDeeper(conceptId: string) { ... }
// export function useExplorationPath() { ... }
// export function useSessionCache() { ... }
// export function useGraphData() { ... }
