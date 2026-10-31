import { signInPathFor } from "./redirect";

/**
 * The whole middleware rule, as a pure function.
 *
 * The middleware file only reads cookies, calls this, and applies the answer, so
 * every branch below is testable without a request or a Supabase client.
 */
export const PROTECTED_PREFIXES = ["/me", "/wallet", "/bets"] as const;
export const GUEST_ONLY_PATHS = ["/sign-in", "/sign-up"] as const;

export type MiddlewareDecision =
  { readonly action: "next" } | { readonly action: "redirect"; readonly to: string };

function matches(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matches(pathname, prefix));
}

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.some((path) => matches(pathname, path));
}

export function decideMiddleware(input: {
  readonly pathname: string;
  readonly signedIn: boolean;
}): MiddlewareDecision {
  if (!input.signedIn && isProtectedPath(input.pathname)) {
    return { action: "redirect", to: signInPathFor(input.pathname) };
  }
  if (input.signedIn && isGuestOnlyPath(input.pathname)) {
    return { action: "redirect", to: "/" };
  }
  return { action: "next" };
}
