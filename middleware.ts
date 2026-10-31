import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";
import { decideMiddleware } from "@/lib/auth/middleware-decision";

/**
 * Session refresh on every request that is a page, plus the two redirects.
 *
 * Supabase rotates the refresh token, so a request that renders with a stale
 * cookie would sign the player out. `getUser()` here both refreshes and tells us
 * who is signed in, and the cookies it writes are carried onto the response.
 */
export async function middleware(request: NextRequest) {
  const env = getPublicEnv();
  if (!env.ok) {
    // Without a project there is no session to read. The app shell already shows
    // a configuration page; redirecting here would only loop.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.env.NEXT_PUBLIC_SUPABASE_URL,
    env.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          for (const cookie of cookies) {
            request.cookies.set(cookie.name, cookie.value);
          }
          response = NextResponse.next({ request });
          for (const cookie of cookies) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const decision = decideMiddleware({
    pathname: request.nextUrl.pathname,
    signedIn: data.user !== null,
  });

  if (decision.action === "next") return response;

  const redirect = NextResponse.redirect(new URL(decision.to, request.url));
  // The refreshed session has to survive the redirect, or the next request
  // refreshes again with a token that has already been rotated.
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  matcher: [
    // Every page and API route, minus Next's own assets and the common image and
    // font extensions. A session refresh on a .png is wasted work.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2|ttf)$).*)",
  ],
};
