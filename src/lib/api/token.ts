/**
 * Where the API client gets its bearer token.
 *
 * The client is deliberately unaware of Supabase: it asks for a token through
 * this seam, and the app sets the provider once. In tests the provider is a stub,
 * which is how the auth header is tested without a session.
 */

export type AccessTokenProvider = () => Promise<string | null>;

let provider: AccessTokenProvider = async () => null;

export function setAccessTokenProvider(next: AccessTokenProvider): void {
  provider = next;
}

export function getAccessToken(): Promise<string | null> {
  return provider();
}

/** Test seam only. */
export function resetAccessTokenProviderForTests(): void {
  provider = async () => null;
}
