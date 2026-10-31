"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatOdds } from "@/lib/odds";

export type OddsButtonState = "default" | "selected" | "suspended" | "disabled";

export interface OddsButtonProps {
  /** The selection, e.g. "red" or "Ada to win". */
  label: string;
  odds: number;
  state?: OddsButtonState;
  /** Fired with the price that was on screen when it was pressed. */
  onSelect?: (odds: number) => void;
  className?: string;
}

type Flash = "up" | "down" | null;

export function OddsButton({
  label,
  odds,
  state = "default",
  onSelect,
  className,
}: OddsButtonProps) {
  const previousOdds = useRef(odds);
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    if (odds === previousOdds.current) return;
    const direction = odds > previousOdds.current ? "up" : "down";
    previousOdds.current = odds;
    setFlash(direction);
    const timer = window.setTimeout(() => setFlash(null), 600);
    return () => window.clearTimeout(timer);
  }, [odds]);

  const interactive = state === "default" || state === "selected";
  const suspended = state === "suspended";

  return (
    <button
      type="button"
      disabled={!interactive}
      aria-pressed={state === "selected"}
      aria-disabled={!interactive || undefined}
      data-state={state}
      data-flash={flash ?? undefined}
      onClick={() => {
        if (interactive) onSelect?.(odds);
      }}
      className={cn(
        "tap-target flex h-control-md w-full items-center justify-between gap-2 rounded-control border px-control-md text-left transition-colors duration-fast ease-out",
        "disabled:cursor-not-allowed",
        state === "default" &&
          "border-line bg-panel text-ink hover:border-brass-600 hover:bg-raised",
        state === "selected" && "border-brass-600 bg-brass-tint text-ink",
        suspended && "border-line bg-panel text-ink-muted opacity-70",
        state === "disabled" && "border-line bg-panel text-ink-muted opacity-40",
        flash === "up" && "border-win bg-win-tint text-win",
        flash === "down" && "border-loss bg-loss-tint text-loss",
        className,
      )}
    >
      <span className="min-w-0 truncate text-small">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {suspended ? <span className="text-micro text-warn">suspended</span> : null}
        <span className="num text-body font-medium">{formatOdds(odds)}</span>
      </span>
      <span aria-live="polite" className="sr-only">
        {flash === "up" ? `${label} price moved up to ${formatOdds(odds)}` : null}
        {flash === "down" ? `${label} price moved down to ${formatOdds(odds)}` : null}
      </span>
    </button>
  );
}
