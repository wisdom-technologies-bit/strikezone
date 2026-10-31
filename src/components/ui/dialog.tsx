"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/** Centred dialog. The one place the shadow token is used besides sheets. */
export function Dialog({ open, onOpenChange, title, description, children, footer }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="sz-overlay fixed inset-0 z-overlay bg-scrim" />
        <DialogPrimitive.Content className="sz-dialog fixed left-1/2 top-1/2 z-overlay w-[calc(100vw-24px)] max-w-dialog -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line-strong bg-panel shadow-sheet">
          <div className="flex items-start justify-between gap-2 border-b border-line p-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-section font-semibold text-ink">
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

          {children ? <div className="p-3">{children}</div> : null}

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
