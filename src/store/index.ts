/**
 * Client-Side State Management (Zustand + Immer)
 *
 * Manages session-scoped state for:
 * - Authentication state (user, profile, loading)
 * - Exploration path (stack of visited concepts)
 * - Go Deeper content cache (ephemeral, not persisted to DB)
 * - Visited nodes (for graph visualization)
 * - Graph data (accumulated during exploration)
 *
 * Uses Immer for efficient immutable updates with mutable-style syntax.
 */

"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Enable Immer support for Set and Map
enableMapSet();
import type { User } from "@supabase/supabase-js";
import type {
  DeeperCache,
  GraphNode,
  GraphEdge,
  SocraticMessage,
  Video,
  Book,
  Concept,
  EdgeWithTarget,
  UserProfile,
} from "@/types";

// =============================================
// AUTH STORE
// =============================================

interface AuthState {
  /** Supabase auth user */
  user: User | null;
  /** User profile from database */
  profile: UserProfile | null;
  /** Loading state for auth operations */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether auth has been initialized */
  initialized: boolean;
  /** Set user */
  setUser: (user: User | null) => void;
  /** Set profile */
  setProfile: (profile: UserProfile | null) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
  /** Mark as initialized */
  setInitialized: (initialized: boolean) => void;
  /** Reset auth state (for logout) */
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    profile: null,
    loading: true,
    error: null,
    initialized: false,

    setUser: (user: User | null) => {
      set((state) => {
        state.user = user;
      });
    },

    setProfile: (profile: UserProfile | null) => {
      set((state) => {
        state.profile = profile;
      });
    },

    setLoading: (loading: boolean) => {
      set((state) => {
        state.loading = loading;
      });
    },

    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },

    setInitialized: (initialized: boolean) => {
      set((state) => {
        state.initialized = initialized;
      });
    },

    reset: () => {
      set((state) => {
        state.user = null;
        state.profile = null;
        state.loading = false;
        state.error = null;
      });
    },
  }))
);

// =============================================
// AUTH INITIALIZATION (singleton)
// =============================================

let authInitPromise: Promise<void> | null = null;

/**
 * Fetch user profile with timeout protection
 */
async function fetchProfileWithTimeout(
  userId: string,
  timeoutMs: number = 5000
): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();

  const fetchPromise = supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
    setTimeout(() => {
      resolve({ data: null, error: { message: "Profile fetch timed out" } });
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result;

    if (error && (error as { code?: string }).code !== "PGRST116") {
      console.error("[AuthStore] Error fetching profile:", error);
      return null;
    }

    if (!data) return null;

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
  } catch (err) {
    console.error("[AuthStore] Error fetching profile:", err);
    return null;
  }
}

/**
 * Initialize auth state and set up listeners.
 * This is called once and cached - safe to call multiple times.
 */
export function initializeAuth(): Promise<void> {
  if (authInitPromise) {
    return authInitPromise;
  }

  authInitPromise = (async () => {
    const store = useAuthStore.getState();

    // Already initialized, skip
    if (store.initialized) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    console.log("[AuthStore] Starting auth initialization...");
    store.setLoading(true);

    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthStore] Auth state changed:", event, !!session?.user);
        const currentStore = useAuthStore.getState();
        const currentUser = session?.user ?? null;

        currentStore.setUser(currentUser);

        if (currentUser) {
          const userProfile = await fetchProfileWithTimeout(currentUser.id);
          currentStore.setProfile(userProfile);
        } else {
          currentStore.setProfile(null);
        }

        currentStore.setLoading(false);
      }
    );

    // Store subscription for potential cleanup
    if (typeof window !== "undefined") {
      (window as unknown as { __authSubscription?: typeof subscription }).__authSubscription = subscription;
    }

    // Initial auth check with timeout
    const timeoutId = setTimeout(() => {
      console.warn("[AuthStore] Auth check timed out after 8s");
      const currentStore = useAuthStore.getState();
      if (!currentStore.initialized) {
        currentStore.setLoading(false);
        currentStore.setInitialized(true);
      }
    }, 8000);

    try {
      console.log("[AuthStore] Calling supabase.auth.getUser()...");
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      clearTimeout(timeoutId);

      console.log("[AuthStore] getUser result:", {
        user: !!currentUser,
        userId: currentUser?.id,
        error: userError,
      });

      store.setUser(currentUser);

      if (currentUser) {
        console.log("[AuthStore] Fetching profile for user:", currentUser.id);
        const userProfile = await fetchProfileWithTimeout(currentUser.id);
        console.log("[AuthStore] Profile result:", userProfile);
        store.setProfile(userProfile);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[AuthStore] Error initializing auth:", err);
    } finally {
      console.log("[AuthStore] Auth initialization complete");
      store.setLoading(false);
      store.setInitialized(true);
    }
  })();

  return authInitPromise;
}

// =============================================
// EXPLORATION STORE
// =============================================

interface ExplorationState {
  /** Stack of concept slugs representing the exploration path */
  path: string[];
  /** Push a new concept onto the path */
  pushPath: (slug: string) => void;
  /** Pop the current concept and return to previous */
  popPath: () => string | undefined;
  /** Get the current (top) concept slug */
  currentSlug: () => string | undefined;
  /** Clear the entire path */
  clearPath: () => void;
}

export const useExplorationStore = create<ExplorationState>()(
  immer((set, get) => ({
    path: [],

    pushPath: (slug: string) => {
      set((state) => {
        state.path.push(slug); // O(1) with Immer
      });
    },

    popPath: () => {
      const state = get();
      if (state.path.length <= 1) return undefined;

      const current = state.path[state.path.length - 1];
      set((state) => {
        state.path.pop(); // O(1) with Immer
      });
      return current;
    },

    currentSlug: () => {
      const state = get();
      return state.path[state.path.length - 1];
    },

    clearPath: () => {
      set((state) => {
        state.path.length = 0; // Clear in place
      });
    },
  }))
);

// =============================================
// DEEPER CACHE STORE
// =============================================

interface DeeperCacheState {
  /** Cache of Go Deeper content by concept ID */
  cache: Record<string, DeeperCache>;
  /** Get cached content for a concept */
  getCache: (conceptId: string) => DeeperCache | undefined;
  /** Set Socratic dialogue history */
  setSocratic: (conceptId: string, history: SocraticMessage[]) => void;
  /** Set expanded description */
  setExpanded: (conceptId: string, description: string) => void;
  /** Set video results */
  setVideos: (conceptId: string, videos: Video[]) => void;
  /** Set book results */
  setBooks: (conceptId: string, books: Book[]) => void;
  /** Clear cache for a specific concept */
  clearCache: (conceptId: string) => void;
  /** Clear all cache */
  clearAllCache: () => void;
}

export const useDeeperCacheStore = create<DeeperCacheState>()(
  immer((set, get) => ({
    cache: {},

    getCache: (conceptId: string) => {
      return get().cache[conceptId];
    },

    setSocratic: (conceptId: string, history: SocraticMessage[]) => {
      set((state) => {
        if (!state.cache[conceptId]) {
          state.cache[conceptId] = {};
        }
        state.cache[conceptId].socratic = history;
      });
    },

    setExpanded: (conceptId: string, description: string) => {
      set((state) => {
        if (!state.cache[conceptId]) {
          state.cache[conceptId] = {};
        }
        state.cache[conceptId].expanded = description;
      });
    },

    setVideos: (conceptId: string, videos: Video[]) => {
      set((state) => {
        if (!state.cache[conceptId]) {
          state.cache[conceptId] = {};
        }
        state.cache[conceptId].videos = videos;
      });
    },

    setBooks: (conceptId: string, books: Book[]) => {
      set((state) => {
        if (!state.cache[conceptId]) {
          state.cache[conceptId] = {};
        }
        state.cache[conceptId].books = books;
      });
    },

    clearCache: (conceptId: string) => {
      set((state) => {
        delete state.cache[conceptId];
      });
    },

    clearAllCache: () => {
      set((state) => {
        state.cache = {};
      });
    },
  }))
);

// =============================================
// GRAPH DATA STORE
// =============================================

interface GraphDataState {
  /** Set of visited concept IDs */
  visitedNodes: Set<string>;
  /** Graph nodes for visualization */
  nodes: GraphNode[];
  /** Graph edges for visualization */
  edges: GraphEdge[];
  /** Add a visited node */
  addVisitedNode: (concept: Concept) => void;
  /** Add edges from a concept */
  addEdges: (sourceId: string, edges: EdgeWithTarget[]) => void;
  /** Check if a node has been visited */
  isVisited: (conceptId: string) => boolean;
  /** Get the number of visited nodes */
  visitedCount: () => number;
  /** Clear all graph data */
  clearGraph: () => void;
}

export const useGraphDataStore = create<GraphDataState>()(
  immer((set, get) => ({
    visitedNodes: new Set(),
    nodes: [],
    edges: [],

    addVisitedNode: (concept: Concept) => {
      const state = get();

      // Check if already added
      if (state.visitedNodes.has(concept.id)) {
        return;
      }

      set((state) => {
        state.visitedNodes.add(concept.id);
        state.nodes.push({
          id: concept.id,
          label: concept.name,
          slug: concept.slug,
          visited: true,
        });
      });
    },

    addEdges: (sourceId: string, newEdges: EdgeWithTarget[]) => {
      set((state) => {
        const existingEdgeIds = new Set(state.edges.map((e) => e.id));
        const existingNodeIds = new Set(state.nodes.map((n) => n.id));

        for (const edge of newEdges) {
          // Add edge if not exists
          if (!existingEdgeIds.has(edge.id)) {
            state.edges.push({
              id: edge.id,
              source: edge.source_id,
              target: edge.target_id,
              branchType: edge.branch_type,
            });
            existingEdgeIds.add(edge.id);
          }

          // Add target node if not exists (as unvisited)
          if (!existingNodeIds.has(edge.target_id)) {
            state.nodes.push({
              id: edge.target.id,
              label: edge.target.name,
              slug: edge.target.slug,
              visited: state.visitedNodes.has(edge.target.id),
            });
            existingNodeIds.add(edge.target_id);
          }
        }
      });
    },

    isVisited: (conceptId: string) => {
      return get().visitedNodes.has(conceptId);
    },

    visitedCount: () => {
      return get().visitedNodes.size;
    },

    clearGraph: () => {
      set((state) => {
        state.visitedNodes.clear();
        state.nodes.length = 0;
        state.edges.length = 0;
      });
    },
  }))
);

// =============================================
// COMBINED SESSION HOOK
// =============================================

/**
 * Combined hook for accessing all session state.
 * Use individual stores for more targeted updates.
 */
export function useSession() {
  const exploration = useExplorationStore();
  const deeperCache = useDeeperCacheStore();
  const graphData = useGraphDataStore();

  return {
    // Exploration
    path: exploration.path,
    pushPath: exploration.pushPath,
    popPath: exploration.popPath,
    currentSlug: exploration.currentSlug,
    clearPath: exploration.clearPath,

    // Deeper cache
    getDeeperCache: deeperCache.getCache,
    setSocratic: deeperCache.setSocratic,
    setExpanded: deeperCache.setExpanded,
    setVideos: deeperCache.setVideos,
    setBooks: deeperCache.setBooks,

    // Graph data
    visitedNodes: graphData.visitedNodes,
    graphNodes: graphData.nodes,
    graphEdges: graphData.edges,
    addVisitedNode: graphData.addVisitedNode,
    addEdges: graphData.addEdges,
    isVisited: graphData.isVisited,
    visitedCount: graphData.visitedCount,

    // Clear all session data
    clearSession: () => {
      exploration.clearPath();
      deeperCache.clearAllCache();
      graphData.clearGraph();
    },
  };
}
