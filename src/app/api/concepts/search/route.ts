import { NextResponse } from "next/server";
import { searchConcepts } from "@/lib/supabase";
import type { SearchConceptsResponse } from "@/types";

/**
 * GET /api/concepts/search?q=query
 * Search for concepts by name using text search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Sanitize limit
    const sanitizedLimit = Math.min(Math.max(1, limit), 50);

    const concepts = await searchConcepts(query.trim(), sanitizedLimit);

    const response: SearchConceptsResponse = { concepts };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error searching concepts:", error);
    return NextResponse.json(
      { error: "Failed to search concepts" },
      { status: 500 }
    );
  }
}
