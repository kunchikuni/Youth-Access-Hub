"use server";

/**
 * Auth Security Actions
 *
 * Handles login attempt tracking and lockout enforcement.
 * These run BEFORE a Supabase session exists, so they use the
 * server Supabase client with the anon key — RLS on login_attempts
 * permits anonymous insert/read for exactly this reason.
 *
 * @module actions/auth
 */

import { createClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface LockoutCheckResult {
  locked: boolean;
  attemptsRemaining: number;
  unlockAt?: string; // ISO timestamp, only present if locked
}

/**
 * Checks whether an email is currently locked out due to too many
 * recent failed login attempts. Call this BEFORE attempting sign-in.
 */
export async function checkLockout(email: string): Promise<LockoutCheckResult> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();
  const windowStart = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("login_attempts")
    .select("attempted_at, success")
    .eq("email", normalizedEmail)
    .gte("attempted_at", windowStart)
    .order("attempted_at", { ascending: false });

  if (error || !data) {
    // Fail open on infrastructure errors — don't lock people out
    // because of a transient DB issue. Logging would happen here
    // in a production observability setup.
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
  }

  // Only count failed attempts; a success resets the window in practice
  // because we only look at the most recent MAX_ATTEMPTS-worth of failures
  // since the last success.
  const recentFailures: string[] = [];
  for (const row of data) {
    if (row.success) break; // stop counting once we hit a successful login
    recentFailures.push(row.attempted_at);
  }

  if (recentFailures.length >= MAX_ATTEMPTS) {
    const oldestRelevantFailure = recentFailures[MAX_ATTEMPTS - 1];
    const unlockAt = new Date(
      new Date(oldestRelevantFailure).getTime() + LOCKOUT_MINUTES * 60 * 1000
    );

    if (unlockAt.getTime() > Date.now()) {
      return {
        locked: true,
        attemptsRemaining: 0,
        unlockAt: unlockAt.toISOString(),
      };
    }
  }

  return {
    locked: false,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - recentFailures.length),
  };
}

/**
 * Records a login attempt (success or failure). Call this AFTER
 * every sign-in attempt, regardless of outcome.
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean
): Promise<void> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  await supabase.from("login_attempts").insert({
    email: normalizedEmail,
    success,
  });
}
