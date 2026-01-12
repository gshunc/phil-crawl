import { NextResponse } from "next/server";
import { getSupabaseServerClient, checkRateLimit } from "@/lib/supabase";
import type { RateLimitResponse } from "@/types";

/**
 * GET /api/user/rate-limit
 * Check the user's generation rate limit status
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

    // Check rate limit status
    const rateLimitStatus = await checkRateLimit(user.id);

    const response: RateLimitResponse = {
      allowed: rateLimitStatus.allowed,
      remaining: rateLimitStatus.remaining,
      resetAt: rateLimitStatus.resetAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return NextResponse.json(
      { error: "Failed to check rate limit" },
      { status: 500 }
    );
  }
}
