import { NextResponse } from "next/server";
import { getConceptBySlug, getBranchStats } from "@/lib/supabase";
import type { BranchStatsResponse } from "@/types";

/**
 * GET /api/concepts/[slug]/analytics
 * Get branch choice statistics for a concept
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Concept slug is required" },
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

    // Get branch statistics
    const stats = await getBranchStats(concept.id);

    const response: BranchStatsResponse = { stats };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching branch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch analytics" },
      { status: 500 }
    );
  }
}
