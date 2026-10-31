import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * The only place a link from an email becomes a session.
 *
 * The code is exchanged server-side so the tokens never travel through a page,
 * and the destination is re-checked here: a `next` that is not a path on this site
 * becomes "/".
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code === null) {
    return NextResponse.redirect(new URL("/sign-in?error=link", url.origin));
  }

  const env = getPublicEnv();
  if (!env.ok) {
    return NextResponse.redirect(new URL("/sign-in?error=config", url.origin));
  }

  let response = NextResponse.redirect(new URL(next, url.origin));

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
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    response = NextResponse.redirect(new URL("/sign-in?error=link", url.origin));
  }

  return response;
}
