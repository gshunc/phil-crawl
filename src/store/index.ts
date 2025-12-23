/**
 * Client-Side State Management (Zustand + Immer)
 *
 * Manages session-scoped state for:
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
import type {
  DeeperCache,
  GraphNode,
  GraphEdge,
  SocraticMessage,
  Video,
  Book,
  Concept,
  EdgeWithTarget,
} from "@/types";

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
