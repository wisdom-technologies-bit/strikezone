import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats integer minor units without floating point", () => {
    expect(formatMoney(0, "XTS")).toBe("0.00 XTS");
    expect(formatMoney(100, "XTS")).toBe("1.00 XTS");
    expect(formatMoney(1234567, "XTS")).toBe("12,345.67 XTS");
  });

  it("puts a single-glyph symbol in front", () => {
    expect(formatMoney(1234567, "NGN")).toBe("\u20A612,345.67");
  });

  it("formats negative amounts for ledger rows", () => {
    expect(formatMoney(-50000, "XTS")).toBe("\u2212500.00 XTS");
  });

  it("can omit the currency and sign a positive amount", () => {
    expect(formatMoney(250000, "XTS", { withCurrency: false })).toBe("2,500.00");
    expect(formatMoney(250000, "XTS", { signed: true })).toBe("+2,500.00 XTS");
  });

  it("refuses a fractional amount in development", () => {
    expect(() => formatMoney(10.5, "XTS")).toThrow(/non-integer/);
  });
});
