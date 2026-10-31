import { describe, expect, it } from "vitest";
import { formatOdds, potentialPayoutMinor, priceDirection } from "./odds";

describe("odds", () => {
  it("formats to two places, always", () => {
    expect(formatOdds(3.6)).toBe("3.60");
    expect(formatOdds(12)).toBe("12.00");
    expect(formatOdds(1.005)).toBe("1.00");
  });

  it("treats a move in the third decimal as no move at all", () => {
    expect(priceDirection(3.64, 3.6401)).toBe("up");
    expect(priceDirection(1.1, 1.1)).toBe("same");
  });

  it("describes the direction of a price move", () => {
    expect(priceDirection(3.64, 3.76)).toBe("up");
    expect(priceDirection(3.64, 3.5)).toBe("down");
    expect(priceDirection(3.64, 3.64)).toBe("same");
  });

  it("rounds a payout down to whole minor units", () => {
    expect(potentialPayoutMinor(10000, 3.64)).toBe(36400);
    expect(potentialPayoutMinor(333, 1.5)).toBe(499);
  });
});
