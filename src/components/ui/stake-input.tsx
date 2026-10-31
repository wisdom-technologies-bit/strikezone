"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatMoney, parseMoney, type MoneyConfig } from "@/lib/money";

/** Digits and at most one decimal point. Everything else is dropped as typed. */
function sanitizeText(raw: string): string {
  let seenDot = false;
  let out = "";
  for (const character of raw) {
    if (character >= "0" && character <= "9") {
      out += character;
    } else if (character === "." && !seenDot) {
      seenDot = true;
      out += character;
    }
  }
  return out;
}

/** The same parser the rest of the app uses, so the field cannot round. */
function minorFromText(text: string): number | null {
  return parseMoney(text);
}

/** 123456 -> "1234.56"; 100000 -> "1000". Keeps trailing ".00" out of the field. */
function textFromMinor(minor: number | null): string {
  if (minor === null) return "";
  const major = Math.trunc(minor / 100);
  const fraction = minor % 100;
  return fraction === 0 ? String(major) : `${major}.${String(fraction).padStart(2, "0")}`;
}

export interface StakeInputProps {
  /** Minor units. The component never holds a float. */
  value: number | null;
  onValueChange: (value: number | null) => void;
  /** Minor units. From GET /api/config, or the market's maxStakeMinor. */
  min: number;
  max?: number;
  /** Minor units. One tap fills the field. */
  quickAmounts?: readonly number[];
  /** Currency and mode, straight from GET /api/config. */
  config: MoneyConfig;
  label?: string;
  hint?: string;
  disabled?: boolean;
  id?: string;
}

export function StakeInput({
  value,
  onValueChange,
  config,
  min,
  max,
  quickAmounts = [10000, 50000, 100000, 500000],
  label = "Stake",
  hint,
  disabled = false,
  id,
}: StakeInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const [text, setText] = useState(() => textFromMinor(value));
  const lastEmitted = useRef<number | null>(value);

  // Keep the field in step with the outside value (a chip, a reset, a clamp).
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(textFromMinor(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const emit = (next: number | null) => {
    lastEmitted.current = next;
    onValueChange(next);
  };

  const parsed = minorFromText(text);
  const belowMin = parsed !== null && parsed < min;
  const aboveMax = parsed !== null && max !== undefined && parsed > max;
  const error = belowMin
    ? `Minimum stake is ${formatMoney(min, config)}`
    : aboveMax && max !== undefined
      ? `Maximum stake is ${formatMoney(max, config)}`
      : null;

  const clamp = () => {
    if (parsed === null) {
      setText(textFromMinor(min));
      emit(min);
      return;
    }
    const bounded = Math.min(parsed, max ?? parsed);
    const next = Math.max(bounded, min);
    if (next !== parsed) {
      setText(textFromMinor(next));
      emit(next);
    } else {
      emit(parsed);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-small font-medium text-ink-muted">
          {label}
        </label>
        <span className="num text-micro text-ink-faint">{formatMoney(min, config)} min</span>
      </div>

      <div
        data-invalid={error ? "true" : undefined}
        className={cn(
          "tap-target field-surface flex h-control-md items-center gap-2 rounded-control bg-page px-control-md",
          error ? "" : "",
          disabled && "cursor-not-allowed",
        )}
      >
        <input
          id={inputId}
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          onChange={(event) => setText(sanitizeText(event.target.value))}
          onBlur={clamp}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="num h-full min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:text-ink-faint"
          placeholder="0"
        />
        <span className="num shrink-0 text-small text-ink-faint">{config.currency}</span>
      </div>

      {error ? (
        <p id={messageId} className="text-small text-loss">
          {error}
        </p>
      ) : (
        <p id={messageId} className="num text-micro text-ink-faint">
          {parsed === null ? "No stake set" : `= ${formatMoney(parsed, config)}`}
        </p>
      )}

      <div className="flex flex-wrap gap-1" role="group" aria-label="Quick stake amounts">
        {quickAmounts.map((amount) => {
          const selected = value === amount;
          return (
            <button
              key={amount}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => {
                setText(textFromMinor(amount));
                emit(amount);
              }}
              className={cn(
                "tap-target num h-control-sm rounded-control border px-2 text-small transition-colors duration-fast ease-out",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-brass-600 bg-brass-tint text-brass"
                  : "border-line bg-panel text-ink-muted hover:border-line-strong hover:bg-raised hover:text-ink",
              )}
            >
              {formatMoney(amount, config, { withCurrency: false })}
            </button>
          );
        })}
      </div>

      {hint ? <p className="text-small text-ink-faint">{hint}</p> : null}
    </div>
  );
}
