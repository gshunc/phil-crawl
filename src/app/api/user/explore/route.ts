import { NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  getConceptById,
  incrementNodesExplored,
} from "@/lib/supabase";
import type { ExploreNodeResponse } from "@/types";

/**
 * POST /api/user/explore
 * Record that the user has explored a concept node
 * Only increments nodes_explored count for NEW explorations (not re-visits)
 * Checks if graph should be unlocked
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { conceptId } = body;

    if (!conceptId) {
      return NextResponse.json(
        { error: "conceptId is required" },
        { status: 400 }
      );
    }

    // Verify concept exists
    const concept = await getConceptById(conceptId);

    if (!concept) {
      return NextResponse.json(
        { error: "Concept not found" },
        { status: 404 }
      );
    }

    // Check if user has already explored this concept
    const { data: existingExploration } = await supabase
      .from("user_explored_concepts")
      .select("id")
      .eq("user_id", user.id)
      .eq("concept_id", conceptId)
      .single();

    // If already explored, just return current stats without incrementing
    if (existingExploration) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("nodes_explored, graph_unlocked")
        .eq("id", user.id)
        .single();

      const response: ExploreNodeResponse = {
        nodesExplored: profile?.nodes_explored ?? 0,
        graphUnlocked: profile?.graph_unlocked ?? false,
      };

      return NextResponse.json(response);
    }

    // Record this as a new exploration
    const { error: insertError } = await supabase
      .from("user_explored_concepts")
      .insert({
        user_id: user.id,
        concept_id: conceptId,
      });

    if (insertError) {
      // If insert fails due to unique constraint, user already explored
      // This handles race conditions
      if (insertError.code === "23505") {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("nodes_explored, graph_unlocked")
          .eq("id", user.id)
          .single();

        const response: ExploreNodeResponse = {
          nodesExplored: profile?.nodes_explored ?? 0,
          graphUnlocked: profile?.graph_unlocked ?? false,
        };

        return NextResponse.json(response);
      }
      console.error("Error inserting exploration:", insertError);
    }

    // Increment nodes explored (only for new explorations)
    const result = await incrementNodesExplored(user.id);

    const response: ExploreNodeResponse = {
      nodesExplored: result.nodesExplored,
      graphUnlocked: result.graphUnlocked,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error recording exploration:", error);
    return NextResponse.json(
      { error: "Failed to record exploration" },
      { status: 500 }
    );
  }
}
