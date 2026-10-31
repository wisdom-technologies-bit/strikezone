# src/components/ui

The design system. Empty in this commit; tokens arrive in the next task.

## What goes here

Primitives that every feature composes from: button, input, select, dialog, tabs,
tooltip, table, badge, skeleton, toast.

- Behaviour from Radix primitives where one exists. Styling only from our tokens.
- No component library default look. If a Radix part ships visible styling, it is
  overridden to our tokens, not left as-is.
- Every value (colour, size, spacing, radius, duration) comes from a CSS variable
  defined once in the design tokens. No raw hex, no arbitrary pixel values.
- Buttons and other tap targets are at least 36px tall. Density first: this is a
  dashboard, not a marketing page.

## How to test

Component tests with Vitest and Testing Library: render, assert roles and labels,
assert keyboard operation for interactive parts. Visual checks at 360px width.
