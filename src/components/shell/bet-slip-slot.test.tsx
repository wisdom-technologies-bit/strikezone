import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const pathname = { current: "/" };

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

import { BetSlipSlot, isMatchPath } from "./bet-slip-slot";
import { addSelection, resetSlipForTests } from "@/lib/slip/store";

beforeEach(() => {
  resetSlipForTests();
  pathname.current = "/";
});

describe("bet slip surfaces", () => {
  it("draws nothing at all with an empty slip away from a match", () => {
    render(<BetSlipSlot />);
    expect(screen.queryByTestId("slip-bar")).toBeNull();
    expect(screen.queryByTestId("slip-panel")).toBeNull();
  });

  it("adds the bar and the panel once a selection exists", () => {
    addSelection({ marketId: "m1", selectionKey: "red", oddsDecimal: 3.64 });
    render(<BetSlipSlot />);

    const bar = screen.getByTestId("slip-bar");
    const panel = screen.getByTestId("slip-panel");

    // The bar cannot survive the desktop breakpoint, the panel cannot show below it.
    expect(bar.className).toContain("lg:hidden");
    expect(panel.className).toContain("hidden");
    expect(panel.className).toContain("lg:flex");
    expect(screen.getByText("1 selection")).toBeInTheDocument();
  });

  it("shows the panel alone on a match page with nothing picked", () => {
    pathname.current = "/matches/abc123";
    render(<BetSlipSlot />);

    expect(screen.queryByTestId("slip-bar")).toBeNull();
    expect(screen.getByTestId("slip-panel")).toBeInTheDocument();
    expect(screen.getByText("No selections yet. Pick a price to start.")).toBeInTheDocument();
  });

  it("knows a match page from any other route", () => {
    expect(isMatchPath("/matches/abc123")).toBe(true);
    expect(isMatchPath("/matches/abc123/markets")).toBe(false);
    expect(isMatchPath("/matches")).toBe(false);
    expect(isMatchPath("/live")).toBe(false);
  });
});
