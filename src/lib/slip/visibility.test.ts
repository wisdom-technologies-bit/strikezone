import { describe, expect, it } from "vitest";
import {
  addSelection,
  clearSelection,
  getSlipState,
  removeSelection,
  resetSlipForTests,
  subscribeToSlip,
} from "./store";
import { shouldReservePanelSpace, shouldShowSlipBar, shouldShowSlipPanel } from "./visibility";

const pick = { marketId: "m1", selectionKey: "red", oddsDecimal: 3.64 };

describe("slip visibility", () => {
  it("keeps the bar away until something is in the slip", () => {
    expect(shouldShowSlipBar({ selectionCount: 0, isMatchPage: false })).toBe(false);
    expect(shouldShowSlipBar({ selectionCount: 0, isMatchPage: true })).toBe(false);
    expect(shouldShowSlipBar({ selectionCount: 1, isMatchPage: false })).toBe(true);
  });

  it("shows the panel for a selection or on a match page", () => {
    expect(shouldShowSlipPanel({ selectionCount: 0, isMatchPage: false })).toBe(false);
    expect(shouldShowSlipPanel({ selectionCount: 0, isMatchPage: true })).toBe(true);
    expect(shouldShowSlipPanel({ selectionCount: 2, isMatchPage: false })).toBe(true);
  });

  it("reserves the main column only when the panel is there", () => {
    expect(shouldReservePanelSpace({ selectionCount: 0, isMatchPage: false })).toBe(false);
    expect(shouldReservePanelSpace({ selectionCount: 1, isMatchPage: false })).toBe(true);
  });
});

describe("slip store", () => {
  it("adds, replaces by market, removes and clears", () => {
    resetSlipForTests();
    addSelection(pick);
    expect(getSlipState().selections).toHaveLength(1);

    addSelection({ ...pick, selectionKey: "green", oddsDecimal: 2.1 });
    expect(getSlipState().selections).toHaveLength(1);
    expect(getSlipState().selections[0]?.selectionKey).toBe("green");

    addSelection({ marketId: "m2", selectionKey: "white", oddsDecimal: 1.9 });
    expect(getSlipState().selections).toHaveLength(2);

    removeSelection("m1");
    expect(getSlipState().selections.map((s) => s.marketId)).toEqual(["m2"]);

    clearSelection();
    expect(getSlipState().selections).toHaveLength(0);
  });

  it("notifies only when something changed", () => {
    resetSlipForTests();
    let calls = 0;
    const unsubscribe = subscribeToSlip(() => {
      calls += 1;
    });

    clearSelection(); // empty already: no notification
    expect(calls).toBe(0);

    addSelection(pick);
    expect(calls).toBe(1);

    removeSelection("missing");
    expect(calls).toBe(1);

    unsubscribe();
    addSelection({ marketId: "m3", selectionKey: "red", oddsDecimal: 2 });
    expect(calls).toBe(1);
  });
});
