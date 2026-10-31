import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "live"
  | "upcoming"
  | "open"
  | "suspended"
  | "won"
  | "lost"
  | "void"
  | "pending-review"
  | "bot"
  | "test-coins";

const toneClass: Record<BadgeTone, string> = {
  live: "bg-loss-tint text-loss",
  upcoming: "bg-info-tint text-info",
  open: "bg-win-tint text-win",
  suspended: "bg-warn-tint text-warn",
  won: "bg-win-tint text-win",
  lost: "bg-loss-tint text-loss",
  void: "bg-raised text-ink-muted",
  "pending-review": "bg-warn-tint text-warn",
  bot: "bg-raised text-ink-muted",
  "test-coins": "bg-brass-tint text-brass",
};

const defaultLabel: Record<BadgeTone, string> = {
  live: "live",
  upcoming: "upcoming",
  open: "open",
  suspended: "suspended",
  won: "won",
  lost: "lost",
  void: "void",
  "pending-review": "pending review",
  bot: "bot",
  "test-coins": "test coins",
};

export interface BadgeProps {
  tone: BadgeTone;
  children?: ReactNode;
  /** A dot before the text, for live and suspended. */
  dot?: boolean;
  className?: string;
}

export function Badge({ tone, children, dot, className }: BadgeProps) {
  const showDot = dot ?? (tone === "live" || tone === "suspended");
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex h-badge items-center gap-1 whitespace-nowrap rounded-control border border-line px-2 text-micro font-medium leading-none",
        toneClass[tone],
        className,
      )}
    >
      {showDot ? (
        <span
          aria-hidden="true"
          className={cn(
            "h-1 w-1 rounded-full bg-current",
            tone === "live" && "motion-safe:animate-pulse",
          )}
        />
      ) : null}
      {children ?? defaultLabel[tone]}
    </span>
  );
}
