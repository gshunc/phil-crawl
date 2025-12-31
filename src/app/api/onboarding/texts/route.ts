import { NextResponse } from "next/server";
import { CANONICAL_TEXTS } from "@/lib/onboarding/data";

/**
 * GET /api/onboarding/texts
 *
 * Returns the list of canonical philosophical texts for the onboarding flow.
 */
export async function GET() {
  return NextResponse.json({ texts: CANONICAL_TEXTS });
}
