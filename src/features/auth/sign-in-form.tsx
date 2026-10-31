"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm, Field, FormAlert } from "./form-parts";
import { useResendCooldown } from "./use-resend-cooldown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { classifyAuthError, type AuthErrorCopy } from "@/lib/auth/errors";
import { signInSchema } from "@/lib/auth/schemas";
import { safeNextPath } from "@/lib/auth/redirect";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cooldown = useResendCooldown();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<AuthErrorCopy | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    setNotice(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0] ?? "form")] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    const client = getSupabaseBrowserClient();
    if (!client) {
      setFailure({
        kind: "unknown",
        message: "Sign-in is unavailable: no Supabase project is configured.",
        canResend: false,
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await client.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        setFailure(classifyAuthError(error));
        return;
      }

      router.replace(safeNextPath(searchParams.get("next")));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const client = getSupabaseBrowserClient();
    if (!client || cooldown.resting) return;
    cooldown.start();
    const { error } = await client.auth.resend({ type: "signup", email });
    setNotice(error ? classifyAuthError(error).message : "Confirmation email sent.");
  }

  return (
    <AuthForm
      title="Sign in"
      description="Email and password."
      footer={
        <>
          No account?{" "}
          <Link href="/sign-up" className="underline">
            Create one
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        {failure !== null ? <FormAlert>{failure.message}</FormAlert> : null}
        {notice !== null ? <p className="text-small text-ink-muted">{notice}</p> : null}

        {failure?.canResend === true ? (
          <Button
            type="button"
            variant="secondary"
            disabled={cooldown.resting}
            onClick={() => {
              void handleResend();
            }}
          >
            {cooldown.resting
              ? `Resend in ${String(cooldown.remaining)}s`
              : "Resend the confirmation email"}
          </Button>
        ) : null}

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

        <Field id="password" label="Password" error={errors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={errors.password !== undefined}
            aria-describedby={errors.password !== undefined ? "password-error" : undefined}
          />
        </Field>

        <Button type="submit" loading={submitting} loadingLabel="Signing in">
          Sign in
        </Button>

        <Link href="/forgot-password" className="text-small text-ink-muted underline">
          Forgot your password?
        </Link>
      </form>
    </AuthForm>
  );
}
