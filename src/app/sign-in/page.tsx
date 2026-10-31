import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/features/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-form py-4" />}>
      <SignInForm />
    </Suspense>
  );
}
