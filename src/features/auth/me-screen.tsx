"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useProfile } from "./use-profile";
import { SelfExclusionPanel } from "./self-exclusion-panel";

const KYC_LABEL: Readonly<Record<string, string>> = {
  none: "Not started",
  pending: "In review",
  verified: "Verified",
  rejected: "Rejected",
};

function Row({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-line py-1.5 last:border-b-0">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-small text-ink">{children}</dd>
    </div>
  );
}

function memberSince(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function MeScreen() {
  const { user, signOut } = useAuth();
  const profile = useProfile();
  const row = profile.data ?? null;

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-3 py-2">
      <h1 className="text-section font-semibold text-ink">Me</h1>

      <section
        aria-labelledby="account-heading"
        className="rounded-control border border-line bg-raised p-3"
      >
        <h2 id="account-heading" className="text-small font-semibold text-ink">
          Account
        </h2>

        {row === null ? (
          <p className="mt-1 text-small text-ink-muted">
            {profile.isPending
              ? "Reading your profile"
              : "Setting up your account, refresh in a moment"}
          </p>
        ) : (
          <dl className="mt-1">
            <Row label="Username">@{row.username}</Row>
            <Row label="Email">{user?.email ?? "unknown"}</Row>
            <Row label="Member since">{memberSince(row.created_at)}</Row>
            <Row label="Identity check">
              <span className="rounded-control border border-line px-1.5 py-0.5 text-micro">
                {KYC_LABEL[row.kyc_status] ?? row.kyc_status}
              </span>
            </Row>
          </dl>
        )}
      </section>

      <SelfExclusionPanel
        excludedUntil={row?.self_excluded_until ?? null}
        onChanged={() => {
          void profile.refetch();
        }}
      />

      <nav aria-label="Account links" className="flex flex-wrap items-center gap-2 text-small">
        <Link href="/responsible-play" className="text-ink-muted underline">
          Responsible play
        </Link>
        <Link href="/terms" className="text-ink-muted underline">
          Terms
        </Link>
        <Link href="/privacy" className="text-ink-muted underline">
          Privacy
        </Link>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="ml-auto"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </Button>
      </nav>
    </div>
  );
}
