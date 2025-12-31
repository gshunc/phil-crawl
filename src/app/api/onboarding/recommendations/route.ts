import { NextResponse } from "next/server";
import { getSupabaseServerClient, getCategoryFamiliarity } from "@/lib/supabase";
import { getRecommendedConcepts, STARTING_CONCEPTS } from "@/lib/onboarding/data";
// Note: STARTING_CONCEPTS is used for fallback when user is unauthenticated

/**
 * GET /api/onboarding/recommendations
 *
 * Returns personalized starting concept recommendations based on user's
 * familiarity profile. Falls back to beginner concepts if no profile exists.
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return beginner concepts for unauthenticated users
      return NextResponse.json({
        concepts: STARTING_CONCEPTS.beginner,
        level: "beginner",
      });
    }

    // Get user's category familiarities
    const familiarities = await getCategoryFamiliarity(user.id);

    // Get recommendations based on familiarity profile
    const { level, concepts } = getRecommendedConcepts(familiarities);

    return NextResponse.json({
      concepts,
      level,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    // Return beginner concepts as fallback
    return NextResponse.json({
      concepts: STARTING_CONCEPTS.beginner,
      level: "beginner",
    });
  }
}
