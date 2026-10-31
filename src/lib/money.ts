/**
 * The only place money becomes a string.
 *
 * Amounts are integers in minor units everywhere in the app. Nothing here
 * multiplies, divides or rounds a float: the major and minor parts are split
 * with integer arithmetic and the grouping is done by Intl on the integer part.
 * The currency code always comes from the server's GET /api/config.
 */

const MINOR_PER_MAJOR = 100;
const MINOR_DIGITS = 2;

type SymbolCache = Map<string, string>;
const symbolCache: SymbolCache = new Map();

function currencySymbol(currency: string): string {
  const cached = symbolCache.get(currency);
  if (cached) return cached;

  let symbol = currency;
  try {
    const parts = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    const found = parts.find((part) => part.type === "currency")?.value;
    if (found) symbol = found;
  } catch {
    // An unknown code: fall back to the code itself, never to a guessed symbol.
    symbol = currency;
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
 * 1234567 with NGN -> "₦12,345.67"; 1234567 with XTS -> "12,345.67 XTS".
 * Exact for any integer minor-unit value, including negatives.
 */
export function formatMoney(
  amountMinor: number,
  currency: string,
  options: FormatMoneyOptions = {},
): string {
  if (!Number.isInteger(amountMinor)) {
    // A fractional amount is a bug upstream. Fail loudly in development and
    // render the integer part in production rather than inventing a value.
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
  const body = `${negative ? "\u2212" : ""}${majorGroups}.${fraction}`;

  const sign = !negative && options.signed && amountMinor > 0 ? "+" : "";
  if (options.withCurrency === false) return `${sign}${body}`;

  const symbol = currencySymbol(currency);
  // A single glyph (₦, $) goes before; a three-letter code goes after.
  const isCode = /^[A-Z]{3}$/.test(symbol);
  return isCode ? `${sign}${body} ${symbol}` : `${sign}${symbol}${body}`;
}

/** The integer part of an amount in minor units, for compact chips. */
export function majorUnits(amountMinor: number): number {
  return Math.trunc(amountMinor / MINOR_PER_MAJOR);
}
