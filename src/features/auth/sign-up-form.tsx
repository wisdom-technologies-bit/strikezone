"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm, Field, FieldError, FormAlert } from "./form-parts";
import { useResendCooldown } from "./use-resend-cooldown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { readOwnProfileWithRetry } from "@/lib/auth/profile";
import { classifyAuthError } from "@/lib/auth/errors";
import { passwordStrengthHint, signUpSchema } from "@/lib/auth/schemas";

type Phase = "form" | "check-email";

export function SignUpForm() {
  const router = useRouter();
  const toast = useToast();
  const cooldown = useResendCooldown();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = signUpSchema.safeParse({ email, username, password, acceptedTerms });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError("Sign-up is unavailable: this site has no Supabase project configured.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await client.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            username: parsed.data.username,
            age_confirmed_at: new Date().toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });

      if (error) {
        setFormError(classifyAuthError(error).message);
        return;
      }

      if (!data.session) {
        setPhase("check-email");
        return;
      }

      // The trigger writes the profiles row; give it its three chances before
      // telling the player the truth, which is that it is still being set up.
      const profile = await readOwnProfileWithRetry(client, data.session.user.id);
      if (profile) {
        toast.show({ title: `Your username is ${profile.username}`, tone: "info" });
      } else {
        toast.show({ title: "Setting up your account, refresh in a moment", tone: "info" });
      }
      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const client = getSupabaseBrowserClient();
    if (!client || cooldown.resting) return;
    cooldown.start();
    const { error } = await client.auth.resend({ type: "signup", email });
    setFormError(error ? classifyAuthError(error).message : null);
  }

  if (phase === "check-email") {
    return (
      <AuthForm
        title="Check your email"
        description={`We sent a confirmation link to ${email}. Open it to finish signing up.`}
      >
        {formError !== null ? <FormAlert>{formError}</FormAlert> : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void handleResend();
          }}
          disabled={cooldown.resting}
        >
          {cooldown.resting ? `Resend in ${String(cooldown.remaining)}s` : "Resend the email"}
        </Button>
        <p className="text-micro text-ink-muted">
          Nothing arrived? Check the spam folder, or{" "}
          <Link href="/sign-in" className="underline">
            sign in
          </Link>{" "}
          if you have confirmed already.
        </p>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Create an account"
      description="Email and password only. You need to be 18 or older."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        {formError !== null ? <FormAlert>{formError}</FormAlert> : null}

        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={errors.email !== undefined}
            aria-describedby={errors.email !== undefined ? "email-error" : undefined}
          />
        </Field>

        <Field
          id="username"
          label="Username"
          hint="3 to 20 lowercase letters, numbers or underscore. A number is added if the name is taken."
          error={errors.username}
        >
          <Input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-invalid={errors.username !== undefined}
            aria-describedby={errors.username !== undefined ? "username-error" : "username-hint"}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          hint={passwordStrengthHint(password)}
          error={errors.password}
        >
          <div className="flex items-center gap-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={errors.password !== undefined}
              aria-describedby={errors.password !== undefined ? "password-error" : "password-hint"}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
        </Field>

        <div className="flex flex-col">
          <label htmlFor="terms" className="flex items-start gap-2 text-small text-ink">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              aria-invalid={errors.acceptedTerms !== undefined}
              aria-describedby={errors.acceptedTerms !== undefined ? "terms-error" : undefined}
              className="mt-0.5 size-4 shrink-0 accent-brass"
            />
            <span>
              I am 18 or older and accept the{" "}
              <Link href="/terms" className="underline">
                terms
              </Link>{" "}
              and the{" "}
              <Link href="/responsible-play" className="underline">
                responsible play policy
              </Link>
              .
            </span>
          </label>
          {errors.acceptedTerms !== undefined ? (
            <FieldError id="terms-error">{errors.acceptedTerms}</FieldError>
          ) : null}
        </div>

        <Button type="submit" loading={submitting} loadingLabel="Creating your account">
          Create account
        </Button>
        <p className="text-micro text-ink-muted">
          Nothing you stake is real money in test-coin mode. Play is entertainment, not income.
        </p>
      </form>
    </AuthForm>
  );
}
