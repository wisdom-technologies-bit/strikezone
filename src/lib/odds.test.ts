import { describe, expect, it } from "vitest";
import { compareOdds, formatOdds, potentialPayoutMinor } from "./odds";

describe("odds", () => {
  it("formats to two places, always", () => {
    expect(formatOdds(3.6)).toBe("3.60");
    expect(formatOdds(12)).toBe("12.00");
    expect(formatOdds(1.005)).toBe("1.00");
  });

  it("describes the direction of a price move", () => {
    expect(compareOdds(3.64, 3.76)).toBe("up");
    expect(compareOdds(3.64, 3.5)).toBe("down");
    expect(compareOdds(3.64, 3.64)).toBe("same");
  });

  it("rounds a payout down to whole minor units", () => {
    expect(potentialPayoutMinor(10000, 3.64)).toBe(36400);
    expect(potentialPayoutMinor(333, 1.5)).toBe(499);
  });
});
