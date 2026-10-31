"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  id?: string;
  /** Shown under the field and turns the border to loss. */
  error?: string;
}

const sizeClass = {
  sm: "h-control-sm px-control-sm text-small",
  md: "h-control-md px-control-md text-body",
  lg: "h-control-lg px-control-lg text-body",
} as const;

export function Select({
  value,
  onValueChange,
  options,
  label,
  placeholder = "Select",
  disabled = false,
  size = "md",
  id,
  error,
}: SelectProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label ? (
        <span className="text-small font-medium text-ink-muted" id={`${id ?? "select"}-label`}>
          {label}
        </span>
      ) : null}

      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={id}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          className={cn(
            "tap-target flex items-center justify-between gap-2 rounded-control border bg-page text-left transition-colors duration-fast ease-out",
            "hover:border-line-strong data-[placeholder]:text-ink-faint",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-loss" : "border-line",
            sizeClass[size],
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} strokeWidth={1.5} className="text-ink-faint" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-overlay min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-control border border-line-strong bg-raised shadow-sheet"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "flex h-control-sm cursor-default select-none items-center justify-between gap-2 rounded-control px-2 text-small text-ink outline-none",
                    "data-[disabled]:pointer-events-none data-[highlighted]:bg-panel data-[disabled]:opacity-50",
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={14} strokeWidth={1.5} className="text-brass" aria-hidden />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error ? <p className="text-small text-loss">{error}</p> : null}
    </div>
  );
}
