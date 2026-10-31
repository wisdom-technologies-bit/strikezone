import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PanelProps {
  children: ReactNode;
  className?: string;
  /** Removes the inner padding when the panel holds a table. */
  flush?: boolean;
}

export function Panel({ children, className, flush }: PanelProps) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-panel border border-line bg-panel",
        !flush && "p-3",
        className,
      )}
    >
      {children}
    </section>
  );
}

export interface PanelHeaderProps {
  title: string;
  /** One short line under the title. */
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PanelHeader({ title, description, actions, className }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-2 pb-2", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-section font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-small text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

export function PanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mt-3 flex items-center justify-between gap-2 border-t border-line pt-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
