import { describe, expect, it } from "vitest";
import {
  BET_ERROR_CODES,
  betErrorMessage,
  DEPOSIT_ERROR_CODES,
  depositErrorMessage,
  isServerFault,
  needsConfirmationAgain,
  WITHDRAWAL_ERROR_CODES,
  withdrawalErrorMessage,
} from "./bet-errors";

/**
 * The contract this test protects: every refusal code the server can send has a
 * sentence a player can read. Adding a code without a message fails here, which is
 * the only place it can fail cheaply.
 */
describe("bet error coverage", () => {
  it("has a message for every bet code", () => {
    const missing = BET_ERROR_CODES.filter((code) => betErrorMessage(code) === "");
    expect(missing).toEqual([]);
    for (const code of BET_ERROR_CODES) {
      expect(betErrorMessage(code)).not.toBe("Something went wrong. Nothing was changed.");
    }
  });

  it("has a message for every withdrawal code", () => {
    for (const code of WITHDRAWAL_ERROR_CODES) {
      expect(withdrawalErrorMessage(code)).not.toBe("Something went wrong. Nothing was changed.");
    }
  });

  it("has a message for every deposit block code", () => {
    for (const code of DEPOSIT_ERROR_CODES) {
      expect(depositErrorMessage(code)).not.toBe("Something went wrong. Nothing was changed.");
    }
  });

  it("names all 22 bet codes the server's betting module can return", () => {
    expect(BET_ERROR_CODES).toHaveLength(22);
    expect(new Set(BET_ERROR_CODES).size).toBe(22);
  });

  it("falls back for a code it does not know, without inventing a reason", () => {
    expect(betErrorMessage("something_new")).toBe("Something went wrong. Nothing was changed.");
    expect(withdrawalErrorMessage("something_new")).toBe(
      "Something went wrong. Nothing was changed.",
    );
  });

  it("separates a moved price from a real refusal, and a server fault from both", () => {
    expect(needsConfirmationAgain("odds_moved")).toBe(true);
    expect(needsConfirmationAgain("insufficient_funds")).toBe(false);
    expect(isServerFault("house_account_missing")).toBe(true);
    expect(isServerFault("match_exposure_closed")).toBe(false);
  });
});
