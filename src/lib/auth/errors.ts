/**
 * What a player is told when Supabase refuses.
 *
 * Wrong credentials get one message whether the address exists or not, so the
 * form cannot be used to ask "is this email registered?". Only the cases where
 * Supabase has already told the player what is going on get a distinct line.
 */
export type AuthErrorKind =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limited"
  | "weak_password"
  | "same_password"
  | "invalid_email_link"
  | "unknown";

export interface AuthErrorCopy {
  readonly kind: AuthErrorKind;
  readonly message: string;
  /** True when a "resend confirmation" button belongs next to the message. */
  readonly canResend: boolean;
}

const COPY: Record<AuthErrorKind, Omit<AuthErrorCopy, "kind">> = {
  invalid_credentials: {
    message: "That email and password do not match an account.",
    canResend: false,
  },
  email_not_confirmed: {
    message: "This email has not been confirmed yet. Check your inbox for the link.",
    canResend: true,
  },
  rate_limited: {
    message: "Too many attempts. Wait a minute, then try again.",
    canResend: false,
  },
  weak_password: {
    message: "That password is too easy to guess. Use at least 8 characters.",
    canResend: false,
  },
  same_password: {
    message: "The new password has to be different from the current one.",
    canResend: false,
  },
  invalid_email_link: {
    message: "That link has expired or was already used. Ask for a new one.",
    canResend: true,
  },
  unknown: {
    message: "Something went wrong. Nothing was changed. Try again.",
    canResend: false,
  },
};

/** Reads the shape Supabase returns, and never the message it wrote. */
export function classifyAuthError(error: unknown): AuthErrorCopy {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
  const status =
    typeof error === "object" && error !== null && "status" in error ? error.status : null;
  const text = code !== null && typeof code === "string" ? code : "";

  if (text === "invalid_credentials" || text === "invalid_grant") {
    return { kind: "invalid_credentials", ...COPY.invalid_credentials };
  }
  if (text === "email_not_confirmed") {
    return { kind: "email_not_confirmed", ...COPY.email_not_confirmed };
  }
  if (
    text === "over_email_send_rate_limit" ||
    text === "over_request_rate_limit" ||
    status === 429
  ) {
    return { kind: "rate_limited", ...COPY.rate_limited };
  }
  if (text === "weak_password") {
    return { kind: "weak_password", ...COPY.weak_password };
  }
  if (text === "same_password") {
    return { kind: "same_password", ...COPY.same_password };
  }
  if (text === "otp_expired" || text === "invalid_token" || text === "flow_state_not_found") {
    return { kind: "invalid_email_link", ...COPY.invalid_email_link };
  }
  return { kind: "unknown", ...COPY.unknown };
}
