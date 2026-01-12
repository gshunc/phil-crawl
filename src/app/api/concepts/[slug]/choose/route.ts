import { NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  getConceptBySlug,
  incrementBranchStat,
} from "@/lib/supabase";
import type { BranchType } from "@/types";

const VALID_BRANCH_TYPES: BranchType[] = [
  "constructive",
  "critique",
  "author",
  "wildcard",
];

/**
 * POST /api/concepts/[slug]/choose
 * Record a branch choice for analytics
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Concept slug is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { branchType } = body;

    if (!branchType || !VALID_BRANCH_TYPES.includes(branchType)) {
      return NextResponse.json(
        {
          error: `Invalid branchType. Must be one of: ${VALID_BRANCH_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Look up concept by slug
    const concept = await getConceptBySlug(slug);

    if (!concept) {
      return NextResponse.json(
        { error: "Concept not found" },
        { status: 404 }
      );
    }

    // Increment the branch stat
    await incrementBranchStat(concept.id, branchType);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording branch choice:", error);
    return NextResponse.json(
      { error: "Failed to record branch choice" },
      { status: 500 }
    );
  }
}
