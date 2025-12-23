import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Get or create a singleton Supabase browser client for client-side usage.
 * This client is used in React components and client-side code.
 *
 * @returns Supabase browser client instance
 */
export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
