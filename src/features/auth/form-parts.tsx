"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The compact form furniture the auth screens share: a label above its field, a
 * 12px helper line, and an error under the field that carries an icon and text.
 * The error never relies on colour alone.
 */

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1 flex items-start gap-1 text-micro text-loss">
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="mt-px size-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 4.75v4" strokeLinecap="round" />
        <path d="M8 11.1v.15" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Field({ id, label, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="mb-1 text-small font-medium text-ink">
        {label}
      </label>
      {children}
      {hint !== undefined && error === undefined ? (
        <p id={`${id}-hint`} className="mt-1 text-micro text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error !== undefined ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

/** The narrow, single-column column every auth form sits in. */
export function AuthForm({
  title,
  description,
  children,
  footer,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-form py-4">
      <h1 className="text-section font-semibold text-ink">{title}</h1>
      {description !== undefined ? (
        <p className="mt-1 text-small text-ink-muted">{description}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
      {footer !== undefined ? <div className="mt-3 text-small text-ink-muted">{footer}</div> : null}
    </div>
  );
}

/** A refusal that belongs to the whole form rather than one field. */
export function FormAlert({ children }: { readonly children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-1.5 rounded-control border border-loss bg-loss-tint px-2 py-1.5 text-small text-loss"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="mt-0.5 size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 4.75v4" strokeLinecap="round" />
        <path d="M8 11.1v.15" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
