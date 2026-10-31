"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isApiError, NetworkError } from "@/lib/api/errors";
import { setAccessTokenProvider } from "@/lib/api/token";
import { getSessionAccessToken } from "@/lib/supabase/browser";

/**
 * One QueryClient per browser session, created inside the component so a server
 * render never shares a cache between two requests.
 *
 * The API client asks for its token through a seam that is filled here, which is
 * why no component knows how a session is stored.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // A refusal is an answer: never retried. A network blip gets one more go.
              if (isApiError(error)) return false;
              if (error instanceof NetworkError) return failureCount < 1;
              return false;
            },
          },
          mutations: { retry: false },
        },
      }),
  );

  useEffect(() => {
    setAccessTokenProvider(() => getSessionAccessToken());
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
