import { NextResponse } from "next/server";
import { getSupabaseServerClient, getUserProfile } from "@/lib/supabase";

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
export async function GET() {
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

    // Fetch user profile
    const profile = await getUserProfile(user.id);

    if (!profile) {
      // Profile might not exist yet for new users
      return NextResponse.json({
        profile: {
          id: user.id,
          onboarding_complete: false,
          nodes_explored: 0,
          graph_unlocked: false,
          created_at: null,
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
