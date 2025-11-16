import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in the browser
 * This client can be used in components for real-time subscriptions and authentication
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get the current user's session
 */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current authenticated user
 */
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await supabase.auth.signOut();
}
