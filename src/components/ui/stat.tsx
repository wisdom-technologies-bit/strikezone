import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StatProps {
  label: string;
  /** Already formatted, mono figures. */
  value: string;
  /** A short qualifier: "of 5,000", "since 09:00". */
  meta?: ReactNode;
  tone?: "default" | "win" | "loss" | "warn" | "muted";
  className?: string;
}

const toneClass = {
  default: "text-ink",
  win: "text-win",
  loss: "text-loss",
  warn: "text-warn",
  muted: "text-ink-muted",
} as const;

export function Stat({ label, value, meta, tone = "default", className }: StatProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="truncate text-micro font-medium text-ink-muted">{label}</span>
      <span className={cn("num truncate text-title font-semibold", toneClass[tone])}>{value}</span>
      {meta ? <span className="truncate text-micro text-ink-faint">{meta}</span> : null}
    </div>
  );
}
