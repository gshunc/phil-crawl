import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        user: null,
        profile: null,
      });
    }

    // Get the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is okay for new users
      console.error("Profile fetch error:", profileError);
    }

    // Type assertion for database row
    const profile = profileData as {
      id: string;
      onboarding_complete: boolean | null;
      nodes_explored: number | null;
      graph_unlocked: boolean | null;
      created_at: string | null;
    } | null;

    // Return user info and profile
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile
        ? {
            id: profile.id,
            onboarding_complete: profile.onboarding_complete ?? false,
            nodes_explored: profile.nodes_explored ?? 0,
            graph_unlocked: profile.graph_unlocked ?? false,
            created_at: profile.created_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

