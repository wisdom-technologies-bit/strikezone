"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./browser";

export interface SessionState {
  /** "unknown" until the first auth event: neither signed in nor out yet. */
  status: "unknown" | "signed-in" | "signed-out";
  userId: string | null;
}

/**
 * Who is signed in, if anyone. There are no auth screens yet, so this is how the
 * shell and the query hooks learn whether a user route may be called at all.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "unknown", userId: null });

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setState({ status: "signed-out", userId: null });
      return;
    }

    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState(
        data.session
          ? { status: "signed-in", userId: data.session.user.id }
          : { status: "signed-out", userId: null },
      );
    });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setState(
        session
          ? { status: "signed-in", userId: session.user.id }
          : { status: "signed-out", userId: null },
      );
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
