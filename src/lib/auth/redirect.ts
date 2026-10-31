/**
 * Where a visitor may be sent after signing in.
 *
 * Only a path on this site is allowed: one leading slash, no scheme, no
 * protocol-relative `//host`, no backslashes (browsers read `/\host` as
 * `//host`), and nothing that a browser would treat as a different origin.
 * Anything else falls back to "/" rather than being "cleaned up", because a
 * cleaned-up URL is still an open redirect if the cleaning is wrong.
 */
export const DEFAULT_NEXT = "/";

export function safeNextPath(raw: string | null | undefined): string {
  if (typeof raw !== "string") return DEFAULT_NEXT;

  const value = raw.trim();
  if (value.length === 0) return DEFAULT_NEXT;

  // One leading slash, then anything that is not a slash or a backslash.
  if (!value.startsWith("/")) return DEFAULT_NEXT;
  if (value.startsWith("//")) return DEFAULT_NEXT;
  if (value.includes("\\")) return DEFAULT_NEXT;

  // A control character can break out of a header or a URL builder.
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return DEFAULT_NEXT;
  }

  // `/%5Chost` and `/%2F%2Fhost` decode to the shapes above.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return DEFAULT_NEXT;
  }
  if (decoded.startsWith("//") || decoded.includes("\\")) return DEFAULT_NEXT;

  return value;
}

/** The sign-in URL for a page that needs a session. */
export function signInPathFor(pathname: string): string {
  return `/sign-in?next=${encodeURIComponent(safeNextPath(pathname))}`;
}
