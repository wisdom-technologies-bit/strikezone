"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label: string;
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
  error?: string;
}

/** 16px box, larger hit area: the same pattern as Switch. */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  hideLabel,
  disabled,
  id,
  error,
}: CheckboxProps) {
  const generatedId = useId();
  const boxId = id ?? generatedId;
  const indeterminate = checked === "indeterminate";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <CheckboxPrimitive.Root
          id={boxId}
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(next === true)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            "tap-target group -m-1 inline-flex shrink-0 items-center justify-center rounded-control p-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-control border transition-colors duration-fast ease-out",
              "group-data-[state=checked]:border-brass-600 group-data-[state=checked]:bg-brass",
              "group-data-[state=indeterminate]:border-brass-600 group-data-[state=indeterminate]:bg-brass",
              "group-data-[state=unchecked]:border-line-strong group-data-[state=unchecked]:bg-page",
              error && "border-loss",
            )}
            style={{ width: "var(--checkbox-size)", height: "var(--checkbox-size)" }}
          >
            <CheckboxPrimitive.Indicator>
              {indeterminate ? (
                <Minus size={10} strokeWidth={2.5} className="text-ink-inverse" aria-hidden />
              ) : (
                <Check size={12} strokeWidth={2.5} className="text-ink-inverse" aria-hidden />
              )}
            </CheckboxPrimitive.Indicator>
          </span>
        </CheckboxPrimitive.Root>
        <label
          htmlFor={boxId}
          className={cn("text-body text-ink", hideLabel && "sr-only", disabled && "opacity-50")}
        >
          {label}
        </label>
      </div>
      {error ? <p className="text-small text-loss">{error}</p> : null}
    </div>
  );
}
