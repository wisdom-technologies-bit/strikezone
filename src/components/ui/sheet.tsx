"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Hide the visual title but keep it for screen readers. */
  hideTitle?: boolean;
}

/** Bottom sheet on mobile, side panel from 768px. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  hideTitle,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="sz-overlay fixed inset-0 z-overlay bg-scrim" />
        <DialogPrimitive.Content
          className={cn(
            "sz-sheet fixed inset-x-0 bottom-0 z-overlay flex max-h-[85dvh] flex-col rounded-t-panel border-t border-line bg-panel shadow-sheet",
            "md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-sheet md:rounded-none md:rounded-l-panel md:border-l md:border-t-0",
          )}
        >
          <div className="flex items-start justify-between gap-2 border-b border-line p-3">
            <div className="min-w-0">
              <DialogPrimitive.Title
                className={cn("text-section font-semibold text-ink", hideTitle && "sr-only")}
              >
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-small text-ink-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="tap-target -mr-1 -mt-1 flex h-control-sm w-control-sm shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors duration-fast ease-out hover:bg-raised hover:text-ink"
              >
                <X size={16} strokeWidth={1.5} aria-hidden />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>

          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-line p-3">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
