import { describe, expect, it } from "vitest";
import { formatMoney, parseMoney, type MoneyConfig } from "./money";

const xts: MoneyConfig = { currency: "XTS", moneyMode: "virtual" };
const ngn: MoneyConfig = { currency: "NGN", moneyMode: "real" };

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("formatMoney", () => {
  it("writes the amount with two decimals", () => {
    expect(formatMoney(0, xts)).toBe("0.00 XTS");
    expect(formatMoney(100, xts)).toBe("1.00 XTS");
    expect(formatMoney(1234567, xts)).toBe("12,345.67 XTS");
  });

  it("uses the naira symbol when the server says NGN", () => {
    expect(formatMoney(1234567, ngn)).toBe("\u20A612,345.67");
  });

  it("keeps a minus sign for a debit", () => {
    expect(formatMoney(-50000, xts)).toBe("\u2212500.00 XTS");
    expect(formatMoney(50000, xts, { signed: true })).toBe("+500.00 XTS");
  });

  it("drops the currency for a column of numbers", () => {
    expect(formatMoney(12345, ngn, { withCurrency: false })).toBe("123.45");
  });

  it("refuses a fractional amount in development", () => {
    expect(() => formatMoney(12.5, xts)).toThrow(/non-integer/);
  });
});

describe("parseMoney", () => {
  it("reads plain and grouped amounts exactly", () => {
    expect(parseMoney("1")).toBe(100);
    expect(parseMoney("1.05")).toBe(105);
    expect(parseMoney("12,345.67")).toBe(1234567);
    expect(parseMoney(" 1000 ")).toBe(100000);
    expect(parseMoney("0.29")).toBe(29);
  });

  it("rejects more than two decimals and anything ambiguous", () => {
    expect(parseMoney("1.234")).toBeNull();
    expect(parseMoney("1.2.3")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("1,2,3.4.5")).toBeNull();
  });

  it("reads a negative amount in either minus glyph", () => {
    expect(parseMoney("-1.50")).toBe(-150);
    expect(parseMoney("\u22121.50")).toBe(-150);
  });

  it("round trips formatMoney for 1000 random integers", () => {
    const random = mulberry32(20261031);
    for (let index = 0; index < 1000; index += 1) {
      // Up to 10 million major units: wide enough to catch grouping mistakes.
      const amount = Math.floor(random() * 1_000_000_000) - 500_000_000;
      const text = formatMoney(amount, xts, { withCurrency: false });
      expect(parseMoney(text)).toBe(amount);
    }
  });

  it("round trips through the naira format too, symbol stripped", () => {
    const random = mulberry32(7);
    for (let index = 0; index < 200; index += 1) {
      const amount = Math.floor(random() * 1_000_000);
      const text = formatMoney(amount, ngn).replace("\u20A6", "");
      expect(parseMoney(text)).toBe(amount);
    }
  });
});
