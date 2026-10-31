/**
 * Every way a bet or a withdrawal can be refused, in plain language.
 *
 * The codes are the server's: BET_REJECTION_CODES from
 * strikezone-server/src/betting/errors.ts (copied verbatim in BET_ERROR_CODES)
 * and the withdrawal refusals from docs/WEBSITE_HANDOFF.md section 3. Branching
 * happens on the code, never on the server's message, which is for logs.
 *
 * A test fails the build if a code here has no message, so a new refusal on the
 * server shows up as "Something went wrong" plus a red test rather than as a
 * sentence nobody wrote.
 */

/** Verbatim from the server: src/betting/errors.ts, BET_REJECTION_CODES. */
export const BET_ERROR_CODES = [
  "invalid_request",
  "invalid_stake",
  "invalid_odds",
  "invalid_idempotency_key",
  "idempotency_conflict",
  "user_not_found",
  "market_not_found",
  "market_closed",
  "odds_moved",
  "stake_below_minimum",
  "stake_above_market_max",
  "stake_above_limit",
  "daily_loss_limit",
  "rate_limited",
  "self_excluded",
  "kyc_required",
  "insufficient_funds",
  "betting_paused",
  "match_exposure_cap",
  "global_exposure_cap",
  "house_account_missing",
  "escrow_account_missing",
] as const;

export type BetErrorCode = (typeof BET_ERROR_CODES)[number];

/** From docs/WEBSITE_HANDOFF.md section 3, the withdrawal table. */
export const WITHDRAWAL_ERROR_CODES = [
  "amount_invalid",
  "insufficient_funds",
  "kyc_required",
  "account_too_new",
  "not_found",
  "wrong_status",
] as const;

export type WithdrawalErrorCode = (typeof WITHDRAWAL_ERROR_CODES)[number];

/** Codes a deposit can be blocked with, from the limits layer. */
export const DEPOSIT_ERROR_CODES = [
  "self_excluded",
  "daily_deposit_limit",
  "kyc_required",
  "account_too_new",
] as const;

export type DepositErrorCode = (typeof DEPOSIT_ERROR_CODES)[number];

const BET_MESSAGES: Record<BetErrorCode, string> = {
  invalid_request: "Some of the bet details are not valid. Check the stake and the price.",
  invalid_stake: "The stake must be a whole number of coins, above zero.",
  invalid_odds: "The price could not be read. Refresh the market and try again.",
  invalid_idempotency_key: "The bet could not be sent safely. Try placing it again.",
  idempotency_conflict: "This bet was already placed with different terms. Check your bets.",
  user_not_found: "Your session has expired. Sign in again.",
  market_not_found: "This market no longer exists. Reload the match.",
  market_closed: "Betting on this market has closed.",
  odds_moved: "The price has moved. Check the new price and confirm again.",
  stake_below_minimum: "The stake is below the minimum for this game.",
  stake_above_market_max: "The stake is above the most this market accepts.",
  stake_above_limit: "The stake is above your own limit.",
  daily_loss_limit: "You have reached your daily loss limit. Betting reopens tomorrow.",
  rate_limited: "Too many bets at once. Wait a moment and try again.",
  self_excluded: "You are self-excluded, so betting is closed until the exclusion ends.",
  kyc_required: "An identity check is needed before you can bet.",
  insufficient_funds: "There is not enough available balance for this stake.",
  betting_paused: "Betting is paused at the moment.",
  match_exposure_cap: "This match has taken as much as it can. Try another match.",
  global_exposure_cap: "The book has taken as much as it can right now.",
  house_account_missing: "The server is misconfigured. Report this; retrying will not help.",
  escrow_account_missing: "The server is misconfigured. Report this; retrying will not help.",
};

const WITHDRAWAL_MESSAGES: Record<WithdrawalErrorCode, string> = {
  amount_invalid: "The amount must be a whole number above zero.",
  insufficient_funds: "There is not enough available balance to withdraw that.",
  kyc_required: "An identity check is needed before you can withdraw.",
  account_too_new: "This account is too new to withdraw. Try again later.",
  not_found: "That withdrawal could not be found.",
  wrong_status: "That withdrawal is already approved, paid or refused.",
};

const DEPOSIT_MESSAGES: Record<DepositErrorCode, string> = {
  self_excluded: "You are self-excluded, so deposits are closed until the exclusion ends.",
  daily_deposit_limit: "This deposit would go over your daily deposit limit.",
  kyc_required: "An identity check is needed before you can deposit.",
  account_too_new: "This account is too new to deposit. Try again later.",
};

const UNKNOWN = "Something went wrong. Nothing was changed.";

function isKnown<T extends string>(codes: readonly T[], code: string): code is T {
  return (codes as readonly string[]).includes(code);
}

/** The line to show for a bet refusal. */
export function betErrorMessage(code: string): string {
  return isKnown(BET_ERROR_CODES, code) ? BET_MESSAGES[code] : UNKNOWN;
}

/** The line to show for a withdrawal refusal. */
export function withdrawalErrorMessage(code: string): string {
  return isKnown(WITHDRAWAL_ERROR_CODES, code) ? WITHDRAWAL_MESSAGES[code] : UNKNOWN;
}

/** The line to show for a blocked deposit. */
export function depositErrorMessage(code: string): string {
  return isKnown(DEPOSIT_ERROR_CODES, code) ? DEPOSIT_MESSAGES[code] : UNKNOWN;
}

/** Codes that mean "the terms changed, ask again" rather than "you cannot bet". */
export function needsConfirmationAgain(code: string): boolean {
  return code === "odds_moved";
}

/** Codes that are server misconfiguration: report, never retry. */
export function isServerFault(code: string): boolean {
  return code === "house_account_missing" || code === "escrow_account_missing";
}
