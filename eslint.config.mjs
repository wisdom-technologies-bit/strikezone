import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "No default exports except where Next requires them (page, layout, route handlers, config files).",
        },
      ],
    },
  },
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/route.ts",
      "src/app/**/not-found.tsx",
      "src/app/**/error.tsx",
      "src/app/**/loading.tsx",
      "*.config.{ts,mjs,js}",
      "next.config.ts",
      "vitest.config.ts",
      "postcss.config.mjs",
      "eslint.config.mjs",
      "scripts/**",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // Command line audit tools are supposed to print their report.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
];

export default config;
