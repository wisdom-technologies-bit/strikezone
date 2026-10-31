import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about our token names, otherwise it treats
 * `text-ink-inverse` and `text-body` as the same group and drops the colour.
 * Keep this list in step with tailwind.config.ts.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["micro", "small", "body", "section", "title"] }],
      "text-color": [
        {
          text: [
            "ink",
            "ink-muted",
            "ink-faint",
            "ink-inverse",
            "brass",
            "brass-500",
            "brass-600",
            "win",
            "loss",
            "warn",
            "info",
          ],
        },
      ],
      "bg-color": [
        {
          bg: [
            "page",
            "panel",
            "raised",
            "brass",
            "brass-tint",
            "win",
            "win-tint",
            "loss",
            "loss-tint",
            "warn",
            "warn-tint",
            "info",
            "info-tint",
            "scrim",
          ],
        },
      ],
      "border-color": [
        {
          border: ["line", "line-strong", "brass", "brass-600", "win", "loss", "warn", "info"],
        },
      ],
    },
  },
});

/** Joins class names and lets a caller's class win over a component default. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
