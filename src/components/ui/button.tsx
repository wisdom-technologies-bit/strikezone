import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Announced while loading instead of the children. */
  loadingLabel?: string;
  children?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-brass-600 bg-brass text-ink-inverse hover:bg-brass-600 active:bg-brass-600 disabled:hover:bg-brass",
  secondary:
    "border-line-strong bg-raised text-ink hover:border-brass-600 hover:bg-raised active:bg-panel disabled:hover:border-line-strong",
  ghost:
    "border-transparent bg-transparent text-ink-muted hover:bg-raised hover:text-ink active:bg-raised disabled:hover:bg-transparent",
  danger:
    "border-line-strong bg-loss-tint text-loss hover:border-loss hover:bg-loss hover:text-ink-inverse active:bg-loss",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-control-sm gap-1 px-control-sm text-small",
  md: "h-control-md gap-2 px-control-md text-body",
  lg: "h-control-lg gap-2 px-control-lg text-body",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingLabel = "Working",
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      className={cn(
        "tap-target inline-flex select-none items-center justify-center whitespace-nowrap rounded-control border font-medium tracking-tight transition-colors duration-fast ease-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" label={null} /> : null}
      <span className={cn(loading && "opacity-80")}>{loading ? loadingLabel : children}</span>
    </button>
  );
}
