import { NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  getConceptBySlug,
  createConcept,
  checkRateLimit,
  logGeneration,
} from "@/lib/supabase";
import { generateLesson } from "@/lib/gemini";
import { generateConceptEmbedding } from "@/lib/openai";
import slugify from "slugify";
import type { GenerateConceptResponse } from "@/types";

/**
 * POST /api/concepts/generate
 * Generate a new concept using Gemini for content and OpenAI for embeddings
 * Rate limited: 10 generations per hour per user
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Concept name is required" },
        { status: 400 }
      );
    }

    const conceptName = name.trim();

    // Check if concept already exists
    const slug = slugify(conceptName, { lower: true, strict: true });
    const existingConcept = await getConceptBySlug(slug);

    if (existingConcept) {
      // Return existing concept instead of error
      const response: GenerateConceptResponse = { concept: existingConcept };
      return NextResponse.json(response);
    }

    // Check rate limit
    const rateLimitStatus = await checkRateLimit(user.id);

    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          resetAt: rateLimitStatus.resetAt,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Generate lesson content using Gemini
    const lesson = await generateLesson(conceptName);

    if (!lesson) {
      return NextResponse.json(
        { error: "Failed to generate concept content" },
        { status: 500 }
      );
    }

    // Generate embedding using OpenAI
    const embedding = await generateConceptEmbedding(
      conceptName,
      lesson.description
    );

    if (!embedding) {
      return NextResponse.json(
        { error: "Failed to generate concept embedding" },
        { status: 500 }
      );
    }

    // Format recommended reading as strings
    const recommendedReading = lesson.recommended_reading.map(
      (r) => `"${r.title}" by ${r.author} (${r.year}) - ${r.relevance}`
    );

    // Create the concept in the database
    const concept = await createConcept(
      conceptName,
      lesson.description,
      recommendedReading,
      embedding
    );

    if (!concept) {
      return NextResponse.json(
        { error: "Failed to save concept" },
        { status: 500 }
      );
    }

    // Log generation for rate limiting
    await logGeneration(user.id);

    const response: GenerateConceptResponse = { concept };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error generating concept:", error);
    return NextResponse.json(
      { error: "Failed to generate concept" },
      { status: 500 }
    );
  }
}
