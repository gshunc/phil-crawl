import { NextResponse } from "next/server";
import { getConceptBySlug, getEdgesFromConcept } from "@/lib/supabase";

/**
 * GET /api/concepts/[slug]/branches
 * Get existing branches (edges) for a concept
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

    // Fetch edges from this concept
    const edges = await getEdgesFromConcept(concept.id);

    return NextResponse.json({ edges });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
