"use client";

import { useCallback, useEffect, useState } from "react";

export const RESEND_COOLDOWN_SECONDS = 60;

/**
 * A resend button's 60 second rest. It counts in wall-clock seconds so a tab that
 * was asleep does not come back with a button that is still resting.
 */
export function useResendCooldown(seconds: number = RESEND_COOLDOWN_SECONDS) {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until === 0) return undefined;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1_000);
    return () => {
      clearInterval(timer);
    };
  }, [until]);

  const remaining = until === 0 ? 0 : Math.max(0, Math.ceil((until - now) / 1_000));

  const start = useCallback(() => {
    const at = Date.now() + seconds * 1_000;
    setNow(Date.now());
    setUntil(at);
  }, [seconds]);

  return { remaining, start, resting: remaining > 0 };
}
