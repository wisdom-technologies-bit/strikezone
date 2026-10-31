import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  /** Trailing text inside the field, e.g. a currency code. */
  suffix?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "h-control-sm px-control-sm text-small",
  md: "h-control-md px-control-md text-body",
  lg: "h-control-lg px-control-lg text-body",
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, suffix, size = "md", className, id, disabled, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-small font-medium text-ink-muted">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "tap-target field-surface flex items-center gap-2 rounded-control bg-page",
          error ? "" : "",
          disabled && "cursor-not-allowed",
          sizeClass[size],
        )}
      >
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none",
            "disabled:cursor-not-allowed disabled:text-ink-faint",
            className,
          )}
          {...rest}
        />
        {suffix ? <span className="num shrink-0 text-small text-ink-faint">{suffix}</span> : null}
      </div>

      {error ? (
        <p id={messageId} className="text-small text-loss">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-small text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
