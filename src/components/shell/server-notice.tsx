"use client";

import { useServerStatus } from "@/lib/api/use-server-status";

/**
 * One slim row while the game server is waking.
 *
 * Deliberately quiet: a dot and a sentence, no spinner. A Render instance that
 * idled out takes up to a minute to answer, and saying so is kinder than a
 * skeleton that never resolves.
 */
export function ServerNotice() {
  const status = useServerStatus();
  if (status !== "waking") return null;

  return (
    <div
      className="flex h-notice-h items-center gap-2 border-t border-line bg-raised px-3 text-small text-ink-muted"
      role="status"
      data-testid="server-waking-notice"
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brass" />
      <p className="min-w-0">Server is waking up, this can take up to a minute</p>
    </div>
  );
}
