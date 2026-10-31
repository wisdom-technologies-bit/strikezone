/**
 * The one place money becomes a string, and the one place a typed amount becomes
 * an integer.
 *
 * Amounts are integers in minor units everywhere. Nothing here multiplies,
 * divides or rounds a float: the major and minor parts are split with integer
 * arithmetic, and parsing works on the digits of the string it is given.
 *
 * The currency and the mode both come from GET /api/config. XTS is the virtual
 * currency and shows as a code after the amount ("12,345.67 XTS"); NGN shows as
 * the naira symbol before it. Neither is hardcoded in a component.
 */
import type { MoneyMode } from "@/contract/contract";

const MINOR_PER_MAJOR = 100;
const MINOR_DIGITS = 2;
const MINUS = "\u2212";

export interface MoneyConfig {
  currency: string;
  moneyMode: MoneyMode;
}

const symbolCache = new Map<string, string>();

function currencySymbol(currency: string): string {
  const cached = symbolCache.get(currency);
  if (cached) return cached;

  // XTS is a test code with no symbol of its own: show the code, like "coins".
  let symbol = currency;
  if (currency !== "XTS") {
    try {
      const parts = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      }).formatToParts(0);
      const found = parts.find((part) => part.type === "currency")?.value;
      if (found) symbol = found;
    } catch {
      symbol = currency;
    }
  }

  symbolCache.set(currency, symbol);
  return symbol;
}

export interface FormatMoneyOptions {
  /** Show a leading + on positive amounts (ledger rows). Default false. */
  signed?: boolean;
  /** Show the currency symbol or code. Default true. */
  withCurrency?: boolean;
}

/**
 * 1234567 with XTS -> "12,345.67 XTS"; 1234567 with NGN -> "₦12,345.67".
 * Exact for any integer minor-unit value, including negatives.
 */
export function formatMoney(
  amountMinor: number,
  config: MoneyConfig,
  options: FormatMoneyOptions = {},
): string {
  if (!Number.isInteger(amountMinor)) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`formatMoney received a non-integer amount: ${amountMinor}`);
    }
  }

  const negative = amountMinor < 0;
  const absolute = Math.abs(Math.trunc(amountMinor));
  const major = Math.trunc(absolute / MINOR_PER_MAJOR);
  const minor = absolute % MINOR_PER_MAJOR;

  const majorGroups = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(major);

  const fraction = String(minor).padStart(MINOR_DIGITS, "0");
  const body = `${negative ? MINUS : ""}${majorGroups}.${fraction}`;

  const sign = !negative && options.signed && amountMinor > 0 ? "+" : "";
  if (options.withCurrency === false) return `${sign}${body}`;

  const symbol = currencySymbol(config.currency);
  // A single glyph (₦, $) goes before; a three-letter code (XTS) goes after.
  const isCode = /^[A-Z]{3}$/.test(symbol);
  return isCode ? `${sign}${body} ${symbol}` : `${sign}${symbol}${body}`;
}

/** Only digits, at most one dot, and at most two decimals. */
const MONEY_TEXT = /^-?(\d+)(?:\.(\d{1,2}))?$/;

/**
 * "12,345.67" -> 1234567. Returns null for anything ambiguous: more than two
 * decimals, a second dot, letters, or a value too large to be exact.
 *
 * String arithmetic only: the digits are split at the dot and the fraction is
 * padded, so 0.29 is 29 and never 28.999999999999996.
 */
export function parseMoney(input: string): number | null {
  const trimmed = input
    .trim()
    .replace(/[\s,_]/g, "")
    .replace(/^\u2212/, "-");
  if (trimmed === "") return null;

  const match = MONEY_TEXT.exec(trimmed);
  if (!match) return null;

  const negative = trimmed.startsWith("-");
  const whole = match[1] ?? "0";
  const fraction = match[2] ?? "";

  const minorDigits = `${fraction}00`.slice(0, MINOR_DIGITS);
  const amount = Number(whole) * MINOR_PER_MAJOR + Number(minorDigits);
  if (!Number.isSafeInteger(amount)) return null;

  return negative ? -amount : amount;
}

/** The integer part of an amount in minor units, for compact chips. */
export function majorUnits(amountMinor: number): number {
  return Math.trunc(amountMinor / MINOR_PER_MAJOR);
}
