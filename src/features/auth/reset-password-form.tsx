"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm, Field, FormAlert } from "./form-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { classifyAuthError } from "@/lib/auth/errors";
import { passwordStrengthHint, resetPasswordSchema } from "@/lib/auth/schemas";

export function ResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();

  const [ready, setReady] = useState<"checking" | "recovery" | "none">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setReady("none");
      return;
    }
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setReady(data.session === null ? "none" : "recovery");
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
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
      setFormError("This site has no Supabase project configured.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await client.auth.updateUser({ password: parsed.data.password });
      if (error) {
        setFormError(classifyAuthError(error).message);
        return;
      }
      toast.show({ title: "Password changed", tone: "info" });
      router.replace("/me");
    } finally {
      setSubmitting(false);
    }
  }

  if (ready === "checking") {
    return <AuthForm title="Set a new password">{null}</AuthForm>;
  }

  if (ready === "none") {
    return (
      <AuthForm
        title="That link cannot be used"
        description="A reset link works once, and only in the browser it was opened in. Ask for a new one."
      >
        <Link href="/forgot-password" className="text-small underline">
          Send a new link
        </Link>
      </AuthForm>
    );
  }

  return (
    <AuthForm title="Set a new password" description="Use at least 8 characters.">
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        {formError !== null ? <FormAlert>{formError}</FormAlert> : null}

        <Field
          id="password"
          label="New password"
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

        <Field id="confirmPassword" label="Repeat the new password" error={errors.confirmPassword}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={errors.confirmPassword !== undefined}
            aria-describedby={
              errors.confirmPassword !== undefined ? "confirmPassword-error" : undefined
            }
          />
        </Field>

        <Button type="submit" loading={submitting} loadingLabel="Saving the new password">
          Save the new password
        </Button>
      </form>
    </AuthForm>
  );
}
