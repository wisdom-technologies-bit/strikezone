import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Carrom: a square board, four corner pockets, a centre circle. */
export function CarromIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} {...base} {...rest}>
      <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1" />
      <circle cx="4.4" cy="4.4" r="1" />
      <circle cx="11.6" cy="4.4" r="1" />
      <circle cx="4.4" cy="11.6" r="1" />
      <circle cx="11.6" cy="11.6" r="1" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

/** Ludo: a square split into four quadrants by a cross. */
export function LudoIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} {...base} {...rest}>
      <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1" />
      <path d="M8 1.75v12.5M1.75 8h12.5" />
    </svg>
  );
}
