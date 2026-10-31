"use client";

import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";
import { useAuth } from "@/components/providers/auth-provider";
import { AccountMenu, SignInLinks } from "@/features/auth/account-menu";
import type { PublicConfig } from "@/lib/config";

export interface TopBarProps {
  config: PublicConfig;
}

/** The chrome that does not change with the page: the wordmark, and who you are. */
export function TopBar({ config }: TopBarProps) {
  const { signedIn } = useAuth();

  return (
    <div className="flex h-topbar-h items-center gap-2 px-3">
      <Link
        href="/"
        aria-label="Strikezone home"
        className="tap-target flex shrink-0 items-center rounded-control lg:min-h-control-sm"
      >
        <Wordmark />
      </Link>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        {signedIn ? <AccountMenu config={config} /> : <SignInLinks />}
      </div>
    </div>
  );
}
