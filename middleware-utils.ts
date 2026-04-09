// ── Types ───────────────────────────────────────────────────

export interface RouteClassification {
  /** Public routes that do NOT require an authenticated session */
  isPublic: boolean;
  /** Onboarding route — accessible WITH a session but without a profile */
  isOnboarding: boolean;
  /** Admin routes — require is_admin = true */
  isAdmin: boolean;
}

// ── Pure function ───────────────────────────────────────────

/**
 * Classifies a pathname into route categories used by middleware
 * to decide how to handle the request.
 *
 * Pure function — no side effects, deterministic.
 */
export function classifyRoute(pathname: string): RouteClassification {
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/demo");

  const isOnboarding = pathname === "/onboarding";

  const isAdmin = pathname.startsWith("/admin");

  return { isPublic, isOnboarding, isAdmin };
}
