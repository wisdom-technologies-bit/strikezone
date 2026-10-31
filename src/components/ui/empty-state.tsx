import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  /** One line. */
  message: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-panel border border-dashed border-line-strong bg-panel p-4",
        className,
      )}
    >
      <p className="text-body text-ink-muted">{message}</p>
      {action}
    </div>
  );
}
