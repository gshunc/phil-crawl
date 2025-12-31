import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  saveTextFamiliarity,
  saveCategoryFamiliarity,
  completeOnboarding,
} from "@/lib/supabase";
import type { SaveFamiliarityRequest, FamiliarityLevel } from "@/types";

/**
 * POST /api/onboarding/familiarity
 *
 * Saves the user's familiarity data (texts read and category levels).
 * Marks onboarding as complete after saving.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SaveFamiliarityRequest = await request.json();

    // Validate request
    if (!body.texts || !Array.isArray(body.texts)) {
      return NextResponse.json(
        { error: "texts array is required" },
        { status: 400 }
      );
    }

    if (!body.categories || !Array.isArray(body.categories)) {
      return NextResponse.json(
        { error: "categories array is required" },
        { status: 400 }
      );
    }

    // Validate category familiarity levels
    const validLevels: FamiliarityLevel[] = ["beginner", "intermediate", "advanced"];
    for (const cat of body.categories) {
      if (!validLevels.includes(cat.familiarity)) {
        return NextResponse.json(
          { error: `Invalid familiarity level: ${cat.familiarity}` },
          { status: 400 }
        );
      }
    }

    // Save text familiarity
    await saveTextFamiliarity(user.id, body.texts);

    // Save category familiarity
    await saveCategoryFamiliarity(user.id, body.categories);

    // Mark onboarding as complete
    await completeOnboarding(user.id);

    return NextResponse.json({
      success: true,
      message: "Familiarity data saved successfully",
    });
  } catch (error) {
    console.error("Error saving familiarity:", error);
    return NextResponse.json(
      { error: "Failed to save familiarity data" },
      { status: 500 }
    );
  }
}
