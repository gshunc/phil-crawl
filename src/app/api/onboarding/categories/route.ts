import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/onboarding/data";

/**
 * GET /api/onboarding/categories
 *
 * Returns the list of philosophical categories with their subtopics.
 */
export async function GET() {
  return NextResponse.json({ categories: CATEGORIES });
}
