"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: readonly SegmentOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** Group label, read by screen readers. */
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  label,
  size = "md",
  disabled = false,
  className,
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusByOffset = (offset: number) => {
    const buttons = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]:not(:disabled)") ??
        [],
    );
    if (buttons.length === 0) return;
    const current = buttons.findIndex((button) => button.getAttribute("aria-checked") === "true");
    const next = (current + offset + buttons.length) % buttons.length;
    const target = buttons[next];
    if (target) {
      target.focus();
      const option = options.find((candidate) => candidate.label === target.textContent);
      if (option) onValueChange(option.value);
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-half overflow-x-auto rounded-control border border-line bg-page p-half",
        disabled && "opacity-50",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          focusByOffset(1);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          focusByOffset(-1);
        }
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const isDisabled = disabled || option.disabled;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={isDisabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "tap-target shrink-0 whitespace-nowrap rounded-control border px-2 transition-colors duration-fast ease-out",
              size === "sm" ? "h-control-sm text-small" : "h-control-sm text-small",
              selected
                ? "border-line-strong bg-raised text-ink"
                : "border-transparent bg-transparent text-ink-muted hover:text-ink",
              isDisabled && "cursor-not-allowed opacity-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
