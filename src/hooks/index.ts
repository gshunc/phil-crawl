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
import { useAuthStore, initializeAuth } from "@/store";
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

/**
 * Authentication hook using centralized Zustand store.
 * All components using this hook share the same auth state.
 */
export function useAuth(): UseAuthReturn {
  // Subscribe to the centralized auth store
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const reset = useAuthStore((state) => state.reset);

  const supabase = getSupabaseBrowserClient();

  // Initialize auth on mount (singleton - only runs once globally)
  useEffect(() => {
    initializeAuth();
  }, []);

  // Refresh user data from Supabase
  const refreshUser = useCallback(async () => {
    try {
      console.log("[useAuth] Refreshing user...");
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Fetch profile with timeout
        const fetchPromise = supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) => {
          setTimeout(() => resolve({ data: null, error: null }), 5000);
        });

        const { data } = await Promise.race([fetchPromise, timeoutPromise]);

        if (data) {
          const row = data as {
            id: string;
            onboarding_complete: boolean | null;
            nodes_explored: number | null;
            graph_unlocked: boolean | null;
            created_at: string | null;
          };
          setProfile({
            id: row.id,
            onboarding_complete: row.onboarding_complete ?? false,
            nodes_explored: row.nodes_explored ?? 0,
            graph_unlocked: row.graph_unlocked ?? false,
            created_at: row.created_at,
          });
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("[useAuth] Error refreshing user:", err);
    }
  }, [supabase, setUser, setProfile]);

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
          setLoading(false);
          return { success: false, error: data.error };
        }

        // Refresh to get the latest user data
        await refreshUser();
        setLoading(false);

        return { success: true, message: data.message };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [refreshUser, setLoading, setError]
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
          setLoading(false);
          return { success: false, error: data.error };
        }

        // Refresh to get the latest user data
        await refreshUser();
        setLoading(false);

        return { success: true, message: data.message };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Signup failed";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [refreshUser, setLoading, setError]
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
        setLoading(false);
        return { success: false, error: data.error };
      }

      // Reset auth state
      reset();

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [reset, setLoading, setError]);

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
// CONCEPT HOOK
// =============================================

import type {
  Concept,
  EdgeWithTarget,
  ConceptWithEdges,
  RateLimitResponse,
  GenerateBranchesResponse,
  GenerateConceptResponse,
  NearestConceptsResponse,
} from "@/types";

interface UseConceptReturn {
  concept: Concept | null;
  edges: EdgeWithTarget[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch a concept by its URL slug with its edges
 */
export function useConcept(slug: string | null): UseConceptReturn {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [edges, setEdges] = useState<EdgeWithTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConcept = useCallback(async () => {
    if (!slug) {
      setConcept(null);
      setEdges([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/concepts/${encodeURIComponent(slug)}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Concept not found");
        } else {
          setError("Failed to fetch concept");
        }
        setConcept(null);
        setEdges([]);
        return;
      }

      const data: ConceptWithEdges = await response.json();
      setConcept(data.concept);
      setEdges(data.edges);
    } catch (err) {
      console.error("Error fetching concept:", err);
      setError("Failed to fetch concept");
      setConcept(null);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchConcept();
  }, [fetchConcept]);

  return {
    concept,
    edges,
    loading,
    error,
    refetch: fetchConcept,
  };
}

// =============================================
// NEAREST CONCEPTS HOOK
// =============================================

interface UseNearestConceptsReturn {
  concepts: Concept[];
  loading: boolean;
  error: string | null;
  fetch: (conceptId: string, limit?: number) => Promise<void>;
}

/**
 * Fetch nearest neighbor concepts using vector similarity
 */
export function useNearestConcepts(): UseNearestConceptsReturn {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearest = useCallback(
    async (conceptId: string, limit: number = 3) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/concepts/nearest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conceptId, limit }),
        });

        if (!response.ok) {
          setError("Failed to fetch nearest concepts");
          setConcepts([]);
          return;
        }

        const data: NearestConceptsResponse = await response.json();
        setConcepts(data.concepts);
      } catch (err) {
        console.error("Error fetching nearest concepts:", err);
        setError("Failed to fetch nearest concepts");
        setConcepts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    concepts,
    loading,
    error,
    fetch: fetchNearest,
  };
}

// =============================================
// GENERATE CONCEPT HOOK
// =============================================

interface UseGenerateConceptReturn {
  concept: Concept | null;
  loading: boolean;
  error: string | null;
  generate: (name: string) => Promise<Concept | null>;
  reset: () => void;
}

/**
 * Generate a new concept using Gemini and OpenAI
 */
export function useGenerateConcept(): UseGenerateConceptReturn {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (name: string): Promise<Concept | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/concepts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          setError("Rate limit exceeded. Try again later.");
        } else {
          setError(data.error || "Failed to generate concept");
        }
        return null;
      }

      const data: GenerateConceptResponse = await response.json();
      setConcept(data.concept);
      return data.concept;
    } catch (err) {
      console.error("Error generating concept:", err);
      setError("Failed to generate concept");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setConcept(null);
    setError(null);
  }, []);

  return {
    concept,
    loading,
    error,
    generate,
    reset,
  };
}

// =============================================
// GENERATE BRANCHES HOOK
// =============================================

interface UseGenerateBranchesReturn {
  branches: EdgeWithTarget[];
  loading: boolean;
  error: string | null;
  generate: (conceptId: string) => Promise<EdgeWithTarget[]>;
  reset: () => void;
}

/**
 * Generate 4 new branches for a concept
 */
export function useGenerateBranches(): UseGenerateBranchesReturn {
  const [branches, setBranches] = useState<EdgeWithTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (conceptSlug: string): Promise<EdgeWithTarget[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/concepts/${encodeURIComponent(conceptSlug)}/branches/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 429) {
            setError("Rate limit exceeded. Try again later.");
          } else {
            setError(data.error || "Failed to generate branches");
          }
          return [];
        }

        const data: GenerateBranchesResponse = await response.json();
        setBranches(data.edges);
        return data.edges;
      } catch (err) {
        console.error("Error generating branches:", err);
        setError("Failed to generate branches");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setBranches([]);
    setError(null);
  }, []);

  return {
    branches,
    loading,
    error,
    generate,
    reset,
  };
}

// =============================================
// RATE LIMIT HOOK
// =============================================

interface UseRateLimitReturn {
  allowed: boolean;
  remaining: number;
  resetAt: string | null;
  loading: boolean;
  check: () => Promise<void>;
}

/**
 * Check the user's generation rate limit status
 */
export function useRateLimit(): UseRateLimitReturn {
  const [allowed, setAllowed] = useState(true);
  const [remaining, setRemaining] = useState(10);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/user/rate-limit");

      if (!response.ok) {
        // Assume allowed on error
        setAllowed(true);
        setRemaining(10);
        setResetAt(null);
        return;
      }

      const data: RateLimitResponse = await response.json();
      setAllowed(data.allowed);
      setRemaining(data.remaining);
      setResetAt(data.resetAt);
    } catch (err) {
      console.error("Error checking rate limit:", err);
      // Assume allowed on error
      setAllowed(true);
      setRemaining(10);
      setResetAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    check();
  }, [check]);

  return {
    allowed,
    remaining,
    resetAt,
    loading,
    check,
  };
}

// =============================================
// EXPLORE NODE HOOK
// =============================================

interface UseExploreNodeReturn {
  explore: (conceptId: string) => Promise<{ nodesExplored: number; graphUnlocked: boolean } | null>;
  loading: boolean;
}

/**
 * Record exploration of a concept node
 */
export function useExploreNode(): UseExploreNodeReturn {
  const [loading, setLoading] = useState(false);

  const explore = useCallback(
    async (
      conceptId: string
    ): Promise<{ nodesExplored: number; graphUnlocked: boolean } | null> => {
      setLoading(true);

      try {
        const response = await fetch("/api/user/explore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conceptId }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return {
          nodesExplored: data.nodesExplored,
          graphUnlocked: data.graphUnlocked,
        };
      } catch (err) {
        console.error("Error recording exploration:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    explore,
    loading,
  };
}

// =============================================
// RE-EXPORT STORE HOOKS
// =============================================

// These hooks are re-exported from the store for convenience
export { useExplorationStore, useDeeperCacheStore, useGraphDataStore, useSession } from "@/store";
