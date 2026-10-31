"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import { useToast } from "@/components/ui/toast";

import { formatMoney } from "@/lib/money";
import type { PublicConfig } from "@/lib/config";

export interface TopBarProps {
  config: PublicConfig;
  /** Minor units. Placeholder until the wallet lands. */
  balanceMinor?: number;
}

export function TopBar({ config, balanceMinor = 0 }: TopBarProps) {
  const toast = useToast();

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
        <span
          className="flex h-control-sm min-w-0 items-center gap-1 rounded-control border border-line bg-raised px-2"
          aria-label={`Balance ${formatMoney(balanceMinor, config.currency)}`}
        >
          <span className="num truncate text-small text-ink">
            {formatMoney(balanceMinor, config.currency)}
          </span>
          {config.moneyMode === "virtual" ? (
            <span className="hidden text-micro text-ink-faint sm:inline">test</span>
          ) : null}
        </span>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => toast.show({ title: "Sign-in isn't wired yet", tone: "info" })}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
