import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Validate env vars at module load
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required')
}

const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )

  return client
}
