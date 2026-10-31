import type { Config } from "tailwindcss";

/**
 * Tailwind is a map from class names to CSS variables declared in
 * src/styles/tokens.css. There is no literal colour, size or spacing value in
 * this file, by design: change the token, change the product.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--surface-0)",
        panel: "var(--surface-1)",
        raised: "var(--surface-2)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",
        ink: "var(--text)",
        "ink-muted": "var(--text-muted)",
        "ink-faint": "var(--text-faint)",
        "ink-inverse": "var(--text-inverse)",
        brass: {
          DEFAULT: "var(--brass-500)",
          500: "var(--brass-500)",
          600: "var(--brass-600)",
          tint: "var(--brass-tint)",
        },
        win: "var(--win)",
        loss: "var(--loss)",
        warn: "var(--warn)",
        info: "var(--info)",
        scrim: "var(--overlay)",
        "win-tint": "var(--win-tint)",
        "loss-tint": "var(--loss-tint)",
        "warn-tint": "var(--warn-tint)",
        "info-tint": "var(--info-tint)",
      },
      fontFamily: {
        sans: "var(--font-ui)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        micro: ["var(--text-micro)", { lineHeight: "var(--leading-micro)" }],
        small: ["var(--text-small)", { lineHeight: "var(--leading-small)" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)" }],
        section: ["var(--text-section)", { lineHeight: "var(--leading-section)" }],
        title: ["var(--text-title)", { lineHeight: "var(--leading-title)" }],
      },
      fontWeight: {
        regular: "var(--weight-regular)",
        medium: "var(--weight-medium)",
        semibold: "var(--weight-semibold)",
      },
      letterSpacing: {
        tight: "var(--tracking-tight)",
        wide: "var(--tracking-wide)",
        wordmark: "var(--tracking-wordmark)",
      },
      spacing: {
        0: "var(--space-0)",
        px: "var(--space-px)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        "control-sm": "var(--control-h-sm)",
        "control-md": "var(--control-h-md)",
        "control-lg": "var(--control-h-lg)",
        "topbar-h": "var(--topbar-h)",
        "notice-h": "var(--notice-h)",
        "rail-collapsed": "var(--rail-w-collapsed)",
        "rail-expanded": "var(--rail-w-expanded)",
        "tabbar-h": "var(--tabbar-h)",
        "betslip-h": "var(--betslip-h)",
        "betslip-w": "var(--betslip-panel-w)",
        "row-dense": "var(--row-h-dense)",
        half: "var(--space-half)",
      },
      borderRadius: {
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
        table: "var(--radius-table)",
        full: "var(--radius-full)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        flash: "var(--flash-duration)",
      },
      boxShadow: {
        sheet: "var(--shadow-sheet)",
      },
      zIndex: {
        rail: "var(--z-rail)",
        topbar: "var(--z-topbar)",
        tabbar: "var(--z-tabbar)",
        overlay: "var(--z-overlay)",
        toast: "var(--z-toast)",
      },
      ringWidth: {
        focus: "var(--focus-ring-width)",
      },
      ringOffsetWidth: {
        focus: "var(--focus-ring-offset)",
      },
      screens: {
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      translate: {
        "switch-on": "var(--switch-thumb-on)",
      },
      maxWidth: {
        content: "var(--content-max)",
        form: "var(--form-max)",
        dialog: "var(--dialog-w)",
      },
      width: {
        sheet: "var(--sheet-w)",
        switch: "var(--switch-w)",
        checkbox: "var(--checkbox-size)",
      },
      height: {
        switch: "var(--switch-h)",
        badge: "var(--badge-h)",
      },
      minWidth: {
        table: "var(--table-min-w)",
      },
    },
  },
  plugins: [],
};

export default config;
