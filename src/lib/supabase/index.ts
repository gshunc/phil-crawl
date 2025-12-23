/**
 * Supabase Database Query Functions
 *
 * All database operations for PhilTreeCrawler.
 * Uses the server client for API routes and the browser client for client-side code.
 */

import { getSupabaseServerClient } from "./server";
import type {
  Concept,
  Edge,
  EdgeWithTarget,
  UserProfile,
  TextFamiliarity,
  CategoryFamiliarity,
  BranchType,
  FamiliarityLevel,
} from "@/types";
import type { Tables } from "./types";
import slugify from "slugify";

// Re-export clients for convenience
export { getSupabaseServerClient } from "./server";
export { getSupabaseBrowserClient } from "./client";
export { updateSession } from "./middleware";
export type { Database } from "./types";

// =============================================
// CONCEPT QUERIES
// =============================================

/**
 * Fetch a concept by its UUID
 */
export async function getConceptById(id: string): Promise<Concept | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("concepts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching concept by id:", error);
    return null;
  }
  return data;
}

/**
 * Fetch a concept by its URL slug
 */
export async function getConceptBySlug(slug: string): Promise<Concept | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("concepts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching concept by slug:", error);
    }
    return null;
  }
  return data;
}

/**
 * Get all outgoing edges from a concept with target concept data
 */
export async function getEdgesFromConcept(
  conceptId: string
): Promise<EdgeWithTarget[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("edges")
    .select(
      `
      *,
      target:concepts!edges_target_id_fkey(*)
    `
    )
    .eq("source_id", conceptId);

  if (error) {
    console.error("Error fetching edges:", error);
    return [];
  }

  // Type assertion needed due to complex join
  type EdgeWithJoin = Tables<"edges"> & { target: Tables<"concepts"> };
  const edges = data as unknown as EdgeWithJoin[];

  return (edges || []).map((edge) => ({
    id: edge.id,
    source_id: edge.source_id!,
    target_id: edge.target_id!,
    branch_type: edge.branch_type as BranchType,
    description: edge.description,
    created_at: edge.created_at,
    target: edge.target as Concept,
  }));
}

/**
 * Find nearest concepts using vector similarity search (pgvector)
 */
export async function findNearestConcepts(
  embedding: number[],
  limit: number = 3,
  excludeIds: string[] = []
): Promise<Concept[]> {
  const supabase = await getSupabaseServerClient();

  // Use raw SQL for vector similarity search with cosine distance
  // The <=> operator is the cosine distance operator in pgvector
  const { data, error } = await supabase.rpc("match_concepts", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit + excludeIds.length,
  });

  if (error) {
    // If RPC doesn't exist, fall back to direct query
    console.error("Error in findNearestConcepts RPC:", error);

    // Alternative: Use direct query with proper casting
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("concepts")
      .select("*")
      .not("embedding", "is", null)
      .limit(limit * 2);

    if (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      return [];
    }

    // Filter out excluded IDs and limit results
    return (fallbackData || [])
      .filter((c) => !excludeIds.includes(c.id))
      .slice(0, limit);
  }

  // Filter out excluded IDs
  return ((data || []) as Concept[])
    .filter((c) => !excludeIds.includes(c.id))
    .slice(0, limit);
}

/**
 * Search concepts by name (text search)
 */
export async function searchConcepts(
  query: string,
  limit: number = 10
): Promise<Concept[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("concepts")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(limit);

  if (error) {
    console.error("Error searching concepts:", error);
    return [];
  }
  return data || [];
}

/**
 * Create a new concept with embedding
 */
export async function createConcept(
  name: string,
  description: string,
  recommendedReading: string[],
  embedding: number[]
): Promise<Concept | null> {
  const supabase = await getSupabaseServerClient();

  const slug = slugify(name, { lower: true, strict: true });

  const { data, error } = await supabase
    .from("concepts")
    .insert({
      name,
      slug,
      description,
      recommended_reading: recommendedReading,
      embedding,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating concept:", error);
    return null;
  }
  return data;
}

/**
 * Create an edge between two concepts
 */
export async function createEdge(
  sourceId: string,
  targetId: string,
  branchType: BranchType,
  description: string
): Promise<Edge | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("edges")
    .insert({
      source_id: sourceId,
      target_id: targetId,
      branch_type: branchType,
      description,
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate edge gracefully
    if (error.code === "23505") {
      console.log("Edge already exists");
      const { data: existingEdge } = await supabase
        .from("edges")
        .select("*")
        .eq("source_id", sourceId)
        .eq("target_id", targetId)
        .single();

      if (existingEdge) {
        return {
          id: existingEdge.id,
          source_id: existingEdge.source_id!,
          target_id: existingEdge.target_id!,
          branch_type: existingEdge.branch_type as BranchType,
          description: existingEdge.description,
          created_at: existingEdge.created_at,
        };
      }
      return null;
    }
    console.error("Error creating edge:", error);
    return null;
  }

  return {
    id: data.id,
    source_id: data.source_id!,
    target_id: data.target_id!,
    branch_type: data.branch_type as BranchType,
    description: data.description,
    created_at: data.created_at,
  };
}

// =============================================
// ANALYTICS QUERIES
// =============================================

/**
 * Increment the branch choice counter for analytics
 */
export async function incrementBranchStat(
  conceptId: string,
  branchType: BranchType
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  // Try to increment existing record
  const { error: updateError } = await supabase.rpc("increment_branch_stat", {
    p_concept_id: conceptId,
    p_branch_type: branchType,
  });

  if (updateError) {
    // If RPC doesn't exist, do upsert manually
    const { data: existing } = await supabase
      .from("branch_analytics")
      .select("*")
      .eq("concept_id", conceptId)
      .eq("branch_type", branchType)
      .single();

    if (existing) {
      await supabase
        .from("branch_analytics")
        .update({ chosen_count: (existing.chosen_count || 0) + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("branch_analytics").insert({
        concept_id: conceptId,
        branch_type: branchType,
        chosen_count: 1,
      });
    }
  }
}

/**
 * Get branch choice statistics for a concept
 */
export async function getBranchStats(
  conceptId: string
): Promise<{ type: BranchType; percentage: number; count: number }[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("branch_analytics")
    .select("*")
    .eq("concept_id", conceptId);

  if (error) {
    console.error("Error fetching branch stats:", error);
    return [];
  }

  const rows = data || [];
  const total = rows.reduce((sum, row) => sum + (row.chosen_count || 0), 0);

  return rows.map((row) => ({
    type: row.branch_type as BranchType,
    count: row.chosen_count || 0,
    percentage: total > 0 ? ((row.chosen_count || 0) / total) * 100 : 0,
  }));
}

// =============================================
// RATE LIMITING QUERIES
// =============================================

const HOURLY_GENERATION_LIMIT = 10;

/**
 * Check if a user can generate new nodes (rate limiting)
 */
export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; resetAt: string | null }> {
  const supabase = await getSupabaseServerClient();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("user_generation_log")
    .select("generated_at")
    .eq("user_id", userId)
    .gte("generated_at", oneHourAgo)
    .order("generated_at", { ascending: true });

  if (error) {
    console.error("Error checking rate limit:", error);
    // On error, allow the action but log it
    return { allowed: true, remaining: HOURLY_GENERATION_LIMIT, resetAt: null };
  }

  const rows = data || [];
  const count = rows.length;
  const remaining = Math.max(0, HOURLY_GENERATION_LIMIT - count);
  const allowed = count < HOURLY_GENERATION_LIMIT;

  // Calculate when the oldest entry expires (reset time)
  let resetAt: string | null = null;
  if (!allowed && rows.length > 0) {
    const oldestTime = new Date(rows[0].generated_at!).getTime();
    resetAt = new Date(oldestTime + 60 * 60 * 1000).toISOString();
  }

  return { allowed, remaining, resetAt };
}

/**
 * Log a generation event for rate limiting
 */
export async function logGeneration(userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("user_generation_log").insert({
    user_id: userId,
  });

  if (error) {
    console.error("Error logging generation:", error);
  }
}

// =============================================
// USER PROFILE QUERIES
// =============================================

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return {
    id: data.id,
    onboarding_complete: data.onboarding_complete ?? false,
    nodes_explored: data.nodes_explored ?? 0,
    graph_unlocked: data.graph_unlocked ?? false,
    created_at: data.created_at,
  };
}

/**
 * Increment the nodes explored count and check if graph should be unlocked
 */
export async function incrementNodesExplored(
  userId: string
): Promise<{ nodesExplored: number; graphUnlocked: boolean }> {
  const supabase = await getSupabaseServerClient();

  // Get current count
  const { data: profile, error: fetchError } = await supabase
    .from("user_profiles")
    .select("nodes_explored, graph_unlocked")
    .eq("id", userId)
    .single();

  if (fetchError || !profile) {
    console.error("Error fetching profile for increment:", fetchError);
    return { nodesExplored: 0, graphUnlocked: false };
  }

  const newCount = (profile.nodes_explored || 0) + 1;
  const shouldUnlock = newCount >= 10;

  // Update the profile
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      nodes_explored: newCount,
      graph_unlocked: shouldUnlock || profile.graph_unlocked,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating nodes explored:", updateError);
  }

  return {
    nodesExplored: newCount,
    graphUnlocked: shouldUnlock || profile.graph_unlocked || false,
  };
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({ onboarding_complete: true })
    .eq("id", userId);

  if (error) {
    console.error("Error completing onboarding:", error);
  }
}

// =============================================
// FAMILIARITY QUERIES
// =============================================

/**
 * Save text familiarity data for a user
 */
export async function saveTextFamiliarity(
  userId: string,
  texts: { text_name: string; has_read: boolean }[]
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  // Upsert all text familiarity records
  const records = texts.map((t) => ({
    user_id: userId,
    text_name: t.text_name,
    has_read: t.has_read,
  }));

  const { error } = await supabase
    .from("user_text_familiarity")
    .upsert(records, {
      onConflict: "user_id,text_name",
    });

  if (error) {
    console.error("Error saving text familiarity:", error);
  }
}

/**
 * Save category familiarity data for a user
 */
export async function saveCategoryFamiliarity(
  userId: string,
  categories: {
    category: string;
    subtopic: string;
    familiarity: FamiliarityLevel;
  }[]
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const records = categories.map((c) => ({
    user_id: userId,
    category: c.category,
    subtopic: c.subtopic,
    familiarity: c.familiarity,
  }));

  const { error } = await supabase
    .from("user_category_familiarity")
    .upsert(records, {
      onConflict: "user_id,category,subtopic",
    });

  if (error) {
    console.error("Error saving category familiarity:", error);
  }
}

/**
 * Get all text familiarity data for a user
 */
export async function getTextFamiliarity(
  userId: string
): Promise<TextFamiliarity[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_text_familiarity")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching text familiarity:", error);
    return [];
  }

  return (data || []).map((t) => ({
    id: t.id,
    user_id: t.user_id!,
    text_name: t.text_name,
    has_read: t.has_read ?? false,
  }));
}

/**
 * Get all category familiarity data for a user
 */
export async function getCategoryFamiliarity(
  userId: string
): Promise<CategoryFamiliarity[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_category_familiarity")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching category familiarity:", error);
    return [];
  }

  return (data || []).map((c) => ({
    id: c.id,
    user_id: c.user_id!,
    category: c.category,
    subtopic: c.subtopic,
    familiarity: c.familiarity as FamiliarityLevel,
  }));
}
