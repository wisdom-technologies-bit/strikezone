/**
 * Two failures the UI has to tell apart:
 *
 * - ApiError: the server answered, and said no. `code` is the string to branch on.
 * - ContractMismatchError: the server answered something the contract does not
 *   describe. That is a bug on one side or the other, and it must never be shown
 *   as if it were a normal refusal.
 */

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
}

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number;
  readonly code: string;

  constructor({ status, code, message }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class ContractMismatchError extends Error {
  /** The route only: never the body, which may hold another player's data. */
  readonly route: string;
  readonly issues: readonly string[];

  constructor(route: string, issues: readonly string[]) {
    super(`the response from ${route} does not match the contract`);
    this.name = "ContractMismatchError";
    this.route = route;
    this.issues = issues;
  }
}

export class NetworkError extends Error {
  readonly reason?: unknown;

  constructor(message: string, reason?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.reason = reason;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** The plain-language line for a failure, or a neutral fallback. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ContractMismatchError) {
    return "The server sent something this site does not understand. Nothing was changed.";
  }
  if (error instanceof ApiError) return error.message;
  if (error instanceof NetworkError) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return "Something went wrong.";
}
