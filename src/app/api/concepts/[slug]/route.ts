import { NextResponse } from "next/server";
import { getConceptBySlug, getEdgesFromConcept } from "@/lib/supabase";
import type { ConceptWithEdges } from "@/types";

/**
 * GET /api/concepts/[slug]
 * Fetch a concept by its URL slug, including its outgoing edges
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Fetch the concept
    const concept = await getConceptBySlug(slug);

    if (!concept) {
      return NextResponse.json(
        { error: "Concept not found" },
        { status: 404 }
      );
    }

    // Fetch edges from this concept
    const edges = await getEdgesFromConcept(concept.id);

    const response: ConceptWithEdges = {
      concept,
      edges,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching concept:", error);
    return NextResponse.json(
      { error: "Failed to fetch concept" },
      { status: 500 }
    );
  }
}
