import { cn } from "@/lib/cn";

type SpinnerSize = "sm" | "md";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Rendered for screen readers; pass null when the parent already announces work. */
  label?: string | null;
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
};

export function Spinner({ size = "sm", className, label = "Loading" }: SpinnerProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <svg
        className={cn("animate-spin text-current", sizeClass[size])}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="8"
          cy="8"
          r="6.5"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        <path
          d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
