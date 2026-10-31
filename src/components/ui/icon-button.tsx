import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import { Spinner } from "./spinner";

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  /** Required: an icon alone is not a label. */
  label: string;
  size?: IconButtonSize;
  loading?: boolean;
  selected?: boolean;
}

const sizeClass: Record<IconButtonSize, string> = {
  sm: "h-control-sm w-control-sm",
  md: "h-control-md w-control-md",
  lg: "h-control-lg w-control-lg",
};

export function IconButton({
  icon: Icon,
  label,
  size = "md",
  loading = false,
  selected = false,
  disabled,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={selected || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        "tap-target inline-flex shrink-0 items-center justify-center rounded-control border transition-colors duration-fast ease-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-brass-600 bg-brass-tint text-brass"
          : "border-line bg-panel text-ink-muted hover:border-line-strong hover:bg-raised hover:text-ink",
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" label={null} />
      ) : (
        <Icon size={16} strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}
