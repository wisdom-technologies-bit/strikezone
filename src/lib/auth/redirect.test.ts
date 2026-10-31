import { describe, expect, it } from "vitest";
import { DEFAULT_NEXT, safeNextPath, signInPathFor } from "./redirect";

describe("safeNextPath", () => {
  it("keeps a path on this site", () => {
    expect(safeNextPath("/wallet")).toBe("/wallet");
    expect(safeNextPath("/me?tab=bets")).toBe("/me?tab=bets");
  });

  it("refuses an absolute URL", () => {
    for (const value of ["https://evil.example", "http://evil.example/x", "javascript:alert(1)"]) {
      expect(safeNextPath(value)).toBe(DEFAULT_NEXT);
    }
  });

  it("refuses a protocol-relative URL", () => {
    expect(safeNextPath("//evil.example")).toBe(DEFAULT_NEXT);
    expect(safeNextPath("///evil.example")).toBe(DEFAULT_NEXT);
  });

  it("refuses a backslash, which browsers read as a slash", () => {
    expect(safeNextPath("/\\evil.example")).toBe(DEFAULT_NEXT);
    expect(safeNextPath("\\\\evil.example")).toBe(DEFAULT_NEXT);
    expect(safeNextPath("/%5Cevil.example")).toBe(DEFAULT_NEXT);
    expect(safeNextPath("/%2F%2Fevil.example")).toBe(DEFAULT_NEXT);
  });

  it("refuses a control character and a broken escape", () => {
    // Trailing whitespace is trimmed; a control character inside the path is not.
    expect(safeNextPath("/me\n")).toBe("/me");
    expect(safeNextPath("/m\u0000e")).toBe(DEFAULT_NEXT);
    expect(safeNextPath("/%E0%A4%A")).toBe(DEFAULT_NEXT);
  });

  it("falls back for nothing at all", () => {
    expect(safeNextPath(null)).toBe(DEFAULT_NEXT);
    expect(safeNextPath(undefined)).toBe(DEFAULT_NEXT);
    expect(safeNextPath("")).toBe(DEFAULT_NEXT);
    expect(safeNextPath("me")).toBe(DEFAULT_NEXT);
  });
});

describe("signInPathFor", () => {
  it("carries the page it came from", () => {
    expect(signInPathFor("/wallet")).toBe("/sign-in?next=%2Fwallet");
  });

  it("carries nothing hostile", () => {
    expect(signInPathFor("//evil.example")).toBe("/sign-in?next=%2F");
  });
});
