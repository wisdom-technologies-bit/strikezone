import { cn } from "@/lib/cn";

export interface WordmarkProps {
  className?: string;
  /** Height in CSS token terms; width follows the viewBox. */
  height?: number;
}

/**
 * Text-only wordmark: the name set in Geist semibold with wide tracking, drawn
 * as inline SVG so it never reflows and never needs a font request of its own.
 * No mark, no mascot.
 */
export function Wordmark({ className, height = 16 }: WordmarkProps) {
  return (
    <svg
      role="img"
      aria-label="Strikezone"
      viewBox="0 0 112 16"
      height={height}
      className={cn("block w-auto text-ink", className)}
      focusable="false"
    >
      <text
        x="0"
        y="11.6"
        textLength="112"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-ui)"
        fontSize="13"
        fontWeight="600"
        letterSpacing="2.3"
        fill="currentColor"
      >
        STRIKEZONE
      </text>
    </svg>
  );
}
