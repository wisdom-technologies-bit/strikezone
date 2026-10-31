import { describe, expect, it } from "vitest";
import {
  passwordSchema,
  passwordStrengthHint,
  normalizeUsername,
  signUpSchema,
  usernameSchema,
} from "./schemas";

describe("username", () => {
  it("accepts three to twenty lowercase letters, numbers and underscore", () => {
    for (const value of ["abc", "ada_7", "a".repeat(20), "player_0001"]) {
      expect(usernameSchema.safeParse(value).success).toBe(true);
    }
  });

  it("refuses two characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });

  it("refuses twenty one characters", () => {
    expect(usernameSchema.safeParse("a".repeat(21)).success).toBe(false);
  });

  it("refuses uppercase, spaces, symbols and hyphens", () => {
    for (const value of ["Ada", "ada lovelace", "ada!", "ada-bet", "ada.7", "ada@x"]) {
      expect(usernameSchema.safeParse(value).success).toBe(false);
    }
  });

  it("trims around the value before judging it", () => {
    expect(usernameSchema.safeParse("  ada_7  ").success).toBe(true);
  });
});

describe("password", () => {
  it("needs eight characters", () => {
    expect(passwordSchema.safeParse("1234567").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(true);
  });

  it("refuses an absurd length", () => {
    expect(passwordSchema.safeParse("a".repeat(201)).success).toBe(false);
  });

  it("hints in words, never in colour", () => {
    expect(passwordStrengthHint("short")).toBe("8+ characters, mix letters and numbers");
    expect(passwordStrengthHint("lettersnly")).toBe(
      "Add a number and a letter to make it stronger",
    );
    expect(passwordStrengthHint("letters123")).toBe("Long enough, with letters and numbers");
  });
});

describe("sign up", () => {
  const base = { email: "ada@example.com", username: "ada_7", password: "letters123" };

  it("requires the age and policy checkbox to be ticked", () => {
    expect(signUpSchema.safeParse({ ...base, acceptedTerms: false }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, acceptedTerms: true }).success).toBe(true);
  });

  it("refuses a malformed email", () => {
    expect(signUpSchema.safeParse({ ...base, email: "ada", acceptedTerms: true }).success).toBe(
      false,
    );
  });
});

describe("normalizeUsername", () => {
  it("applies the trigger's rule: strip, lowercase, cap", () => {
    expect(normalizeUsername("Ada Lovelace!")).toBe("adalovelace");
    expect(normalizeUsername("a".repeat(30))).toHaveLength(20);
  });
});
