import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

/**
 * Next.js Middleware
 *
 * Refreshes the user's session on every request to keep auth state current.
 * This is required for Supabase Auth to work correctly with Server Components.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     *
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

