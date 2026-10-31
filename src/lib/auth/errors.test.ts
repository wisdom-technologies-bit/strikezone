import { describe, expect, it } from "vitest";
import { classifyAuthError } from "./errors";

describe("classifyAuthError", () => {
  it("gives wrong credentials one generic line", () => {
    const copy = classifyAuthError({ code: "invalid_credentials" });
    expect(copy.kind).toBe("invalid_credentials");
    expect(copy.message).toBe("That email and password do not match an account.");
    expect(copy.canResend).toBe(false);
  });

  it("offers a resend only for an unconfirmed email", () => {
    const copy = classifyAuthError({ code: "email_not_confirmed" });
    expect(copy.kind).toBe("email_not_confirmed");
    expect(copy.canResend).toBe(true);
  });

  it("is calm about rate limiting", () => {
    expect(classifyAuthError({ code: "over_email_send_rate_limit" }).kind).toBe("rate_limited");
    expect(classifyAuthError({ code: "anything", status: 429 }).kind).toBe("rate_limited");
  });

  it("reads a dead reset link", () => {
    expect(classifyAuthError({ code: "otp_expired" }).kind).toBe("invalid_email_link");
    expect(classifyAuthError({ code: "otp_expired" }).canResend).toBe(true);
  });

  it("never repeats the provider's own message", () => {
    const copy = classifyAuthError({ code: "weird", message: "internal detail: user 42" });
    expect(copy.kind).toBe("unknown");
    expect(copy.message).not.toContain("internal detail");
  });

  it("survives a thrown string", () => {
    expect(classifyAuthError("boom").kind).toBe("unknown");
    expect(classifyAuthError(null).kind).toBe("unknown");
  });
});
