"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "info" | "win" | "loss" | "warn";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (toast: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClass: Record<ToastTone, string> = {
  info: "border-info text-info",
  win: "border-win text-win",
  loss: "border-loss text-loss",
  warn: "border-warn text-warn",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((toast: { title: string; description?: string; tone?: ToastTone }) => {
    setItems((current) => [
      ...current,
      { id: Date.now() + Math.trunc(performance.now()), tone: "info", ...toast },
    ]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            onOpenChange={(open) => {
              if (!open) remove(item.id);
            }}
            className={cn(
              "sz-toast flex items-start gap-2 rounded-panel border border-l-2 border-line bg-raised p-3 shadow-sheet",
              toneClass[item.tone],
            )}
          >
            <div className="min-w-0 flex-1">
              <ToastPrimitive.Title className="text-body font-medium text-ink">
                {item.title}
              </ToastPrimitive.Title>
              {item.description ? (
                <ToastPrimitive.Description className="mt-1 text-small text-ink-muted">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Dismiss"
                className="tap-target -mr-1 -mt-1 flex h-control-sm w-control-sm shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-panel hover:text-ink"
              >
                <X size={14} strokeWidth={1.5} aria-hidden />
              </button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed inset-x-3 bottom-3 z-toast flex max-w-none flex-col gap-2 md:inset-x-auto md:bottom-4 md:right-4 md:w-sheet" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
