"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthForm, Field } from "./form-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { forgotPasswordSchema } from "@/lib/auth/schemas";

const ANSWER = "If that email has an account, a reset link is on its way.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
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
    setSubmitting(true);
    try {
      // The answer is the same whether the address exists or the call failed, so
      // this screen cannot be used to find out who has an account.
      if (client) {
        await client.auth.resetPasswordForEmail(parsed.data.email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
      }
      setAnswered(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (answered) {
    return (
      <AuthForm title="Check your email" description={ANSWER}>
        <p className="text-small text-ink-muted">
          The link works once and expires. If it does not arrive, ask again in a minute.
        </p>
        <Link href="/sign-in" className="text-small underline">
          Back to sign in
        </Link>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Reset your password"
      description="We send a one-time link to the address on the account."
      footer={
        <Link href="/sign-in" className="underline">
          Back to sign in
        </Link>
      }
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
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
        <Button type="submit" loading={submitting} loadingLabel="Sending the link">
          Send the link
        </Button>
        <p className="text-micro text-ink-muted">{ANSWER}</p>
      </form>
    </AuthForm>
  );
}
