"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
}

/**
 * The track is drawn inside a larger button: a 20px switch still gets a 36px
 * hit area on touch and 28px on desktop, without changing how small it looks.
 */
export function Switch({ checked, onCheckedChange, label, hideLabel, disabled, id }: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <div className="flex items-center gap-2">
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "tap-target group -m-1 inline-flex shrink-0 items-center justify-center rounded-full p-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span
          className={cn(
            "flex items-center rounded-full border transition-colors duration-fast ease-out",
            "group-data-[state=checked]:border-brass-600 group-data-[state=checked]:bg-brass",
            "group-data-[state=unchecked]:border-line-strong group-data-[state=unchecked]:bg-raised",
          )}
          style={{ width: "var(--switch-w)", height: "var(--switch-h)" }}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "block rounded-full transition-transform duration-fast ease-out",
              "data-[state=checked]:translate-x-switch-on data-[state=checked]:bg-ink-inverse",
              "data-[state=unchecked]:translate-x-half data-[state=unchecked]:bg-ink",
            )}
            style={{ width: "var(--switch-thumb)", height: "var(--switch-thumb)" }}
          />
        </span>
      </SwitchPrimitive.Root>
      <label
        htmlFor={switchId}
        className={cn("text-body text-ink", hideLabel && "sr-only", disabled && "opacity-50")}
      >
        {label}
      </label>
    </div>
  );
}
