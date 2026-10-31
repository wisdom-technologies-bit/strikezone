import { describe, expect, it } from "vitest";
import { decideMiddleware, isGuestOnlyPath, isProtectedPath } from "./middleware-decision";

describe("protected paths", () => {
  it("covers me, wallet and bets and their children", () => {
    for (const path of ["/me", "/wallet", "/bets", "/wallet/deposit", "/bets/abc"]) {
      expect(isProtectedPath(path)).toBe(true);
    }
  });

  it("does not cover a lookalike", () => {
    for (const path of ["/", "/members", "/betting", "/walletx"]) {
      expect(isProtectedPath(path)).toBe(false);
    }
  });
});

describe("decideMiddleware", () => {
  it("sends a signed-out visitor to sign-in with the page to return to", () => {
    expect(decideMiddleware({ pathname: "/wallet", signedIn: false })).toEqual({
      action: "redirect",
      to: "/sign-in?next=%2Fwallet",
    });
  });

  it("leaves a signed-out visitor alone on a public page", () => {
    expect(decideMiddleware({ pathname: "/live", signedIn: false })).toEqual({ action: "next" });
  });

  it("moves a signed-in visitor away from sign-in and sign-up", () => {
    expect(decideMiddleware({ pathname: "/sign-in", signedIn: true })).toEqual({
      action: "redirect",
      to: "/",
    });
    expect(decideMiddleware({ pathname: "/sign-up", signedIn: true })).toEqual({
      action: "redirect",
      to: "/",
    });
  });

  it("leaves a signed-in visitor on their own page", () => {
    expect(decideMiddleware({ pathname: "/me", signedIn: true })).toEqual({ action: "next" });
  });

  it("keeps the guest-only list to the two screens", () => {
    expect(isGuestOnlyPath("/sign-in")).toBe(true);
    expect(isGuestOnlyPath("/forgot-password")).toBe(false);
    expect(isGuestOnlyPath("/signed-in")).toBe(false);
  });
});
