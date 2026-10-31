import { z } from "zod";

/**
 * The auth forms' own rules, checked before Supabase sees them.
 *
 * The username rule is the database trigger's rule minus its fallback: it strips
 * everything but letters, numbers and underscore and lowercases what is left. A
 * value that breaks that rule is refused here so a player is not surprised by a
 * silently different username than the one they typed.
 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(320, "That email address is too long.")
  .email("Enter an email address like name@example.com.");

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Use at least ${String(USERNAME_MIN)} characters.`)
  .max(USERNAME_MAX, `Use at most ${String(USERNAME_MAX)} characters.`)
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscore only.");

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${String(PASSWORD_MIN)} characters.`)
  .max(200, "Use at most 200 characters.");

export const signUpSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  acceptedTerms: z.literal(true, {
    message: "Confirm you are 18 or older and accept the policies.",
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Repeat the password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

/** A hint that does not depend on color: it says what is missing, in words. */
export function passwordStrengthHint(value: string): string {
  const hasLetter = /[a-z]/i.test(value);
  const hasNumber = /[0-9]/.test(value);
  if (value.length < PASSWORD_MIN) {
    return `${String(PASSWORD_MIN)}+ characters, mix letters and numbers`;
  }
  if (!hasLetter || !hasNumber) {
    return "Add a number and a letter to make it stronger";
  }
  return "Long enough, with letters and numbers";
}

/** The same rule the trigger applies, for showing what will be stored. */
export function normalizeUsername(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase()
    .slice(0, USERNAME_MAX);
}
