import { NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  getConceptBySlug,
  createConcept,
  createEdge,
  checkRateLimit,
  logGeneration,
} from "@/lib/supabase";
import { generateBranches, generateLesson } from "@/lib/gemini";
import { generateConceptEmbedding } from "@/lib/openai";
import slugify from "slugify";
import type { BranchType, EdgeWithTarget, GenerateBranchesResponse } from "@/types";

/**
 * POST /api/concepts/[slug]/branches/generate
 * Generate 4 new branch connections (constructive, critique, author, wildcard)
 * Creates target concepts if they don't exist
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

    // Look up source concept by slug
    const sourceConcept = await getConceptBySlug(slug);

    if (!sourceConcept) {
      return NextResponse.json(
        { error: "Concept not found" },
        { status: 404 }
      );
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

    // Generate branches using Gemini
    const branchGeneration = await generateBranches(sourceConcept);

    if (!branchGeneration || !branchGeneration.branches) {
      return NextResponse.json(
        { error: "Failed to generate branches" },
        { status: 500 }
      );
    }

    // Process each branch: create target concept if needed, then create edge
    const createdEdges: EdgeWithTarget[] = [];

    for (const branch of branchGeneration.branches) {
      const targetSlug = slugify(branch.target_name, { lower: true, strict: true });

      // Check if target concept exists
      let targetConcept = await getConceptBySlug(targetSlug);

      if (!targetConcept) {
        // Generate the target concept
        const lesson = await generateLesson(branch.target_name);

        if (!lesson) {
          console.error(`Failed to generate lesson for: ${branch.target_name}`);
          continue;
        }

        const embedding = await generateConceptEmbedding(
          branch.target_name,
          lesson.description
        );

        if (!embedding) {
          console.error(`Failed to generate embedding for: ${branch.target_name}`);
          continue;
        }

        const recommendedReading = lesson.recommended_reading.map(
          (r) => `"${r.title}" by ${r.author} (${r.year}) - ${r.relevance}`
        );

        targetConcept = await createConcept(
          branch.target_name,
          lesson.description,
          recommendedReading,
          embedding
        );

        if (!targetConcept) {
          console.error(`Failed to create concept: ${branch.target_name}`);
          continue;
        }
      }

      // Create the edge
      const edge = await createEdge(
        sourceConcept.id,
        targetConcept.id,
        branch.type as BranchType,
        branch.description
      );

      if (edge) {
        createdEdges.push({
          ...edge,
          target: targetConcept,
        });
      }
    }

    // Log generation for rate limiting (count as 1 generation even though multiple concepts created)
    await logGeneration(user.id);

    const response: GenerateBranchesResponse = { edges: createdEdges };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error generating branches:", error);
    return NextResponse.json(
      { error: "Failed to generate branches" },
      { status: 500 }
    );
  }
}
