import { NextResponse } from "next/server";
import { getConceptById, findNearestConcepts } from "@/lib/supabase";
import type { NearestConceptsResponse } from "@/types";

/**
 * POST /api/concepts/nearest
 * Find nearest neighbor concepts using vector similarity search
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conceptId, limit = 3 } = body;

    if (!conceptId) {
      return NextResponse.json(
        { error: "conceptId is required" },
        { status: 400 }
      );
    }

    // Fetch the source concept to get its embedding
    const concept = await getConceptById(conceptId);

    if (!concept) {
      return NextResponse.json(
        { error: "Concept not found" },
        { status: 404 }
      );
    }

    if (!concept.embedding) {
      return NextResponse.json(
        { error: "Concept has no embedding" },
        { status: 400 }
      );
    }

    // Sanitize limit
    const sanitizedLimit = Math.min(Math.max(1, limit), 10);

    // Find nearest concepts, excluding the source concept
    const concepts = await findNearestConcepts(
      concept.embedding,
      sanitizedLimit,
      [conceptId]
    );

    const response: NearestConceptsResponse = { concepts };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error finding nearest concepts:", error);
    return NextResponse.json(
      { error: "Failed to find nearest concepts" },
      { status: 500 }
    );
  }
}
