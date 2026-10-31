"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { PublicConfig } from "@/lib/config";
import { useWallet } from "@/lib/api/queries";
import { useProfile } from "./use-profile";

const MENU_LINKS = [
  { href: "/me", label: "Profile" },
  { href: "/wallet", label: "Wallet" },
  { href: "/bets", label: "My bets" },
] as const;

/**
 * The top bar's right hand: a balance chip, then the avatar button and its menu.
 *
 * The chip is shown only when the wallet has answered. A zero balance is a real
 * balance and is displayed; a pending or failed read is not a balance, and while
 * the game server is waking the wallet request is exactly what is pending or
 * failing, so the chip hides rather than claiming the player has nothing.
 */
export function AccountMenu({ config }: { readonly config: PublicConfig }) {
  const { user, signOut } = useAuth();
  const wallet = useWallet();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const username = profile.data?.username ?? null;
  const initial = (username ?? user?.email ?? "?").slice(0, 1).toUpperCase();
  const showBalance = wallet.data !== undefined && !wallet.isError;

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {showBalance && wallet.data !== undefined ? (
        <span
          className="flex h-control-sm min-w-0 items-center gap-1 rounded-control border border-line bg-raised px-2"
          aria-label={`Balance ${formatMoney(wallet.data.availableMinor, config)}`}
        >
          <span className="num truncate text-small text-ink">
            {formatMoney(wallet.data.availableMinor, config)}
          </span>
          {config.moneyMode === "virtual" ? (
            <span className="hidden text-micro text-ink-faint sm:inline">test</span>
          ) : null}
        </span>
      ) : null}

      <button
        type="button"
        className="tap-target flex h-control-sm w-control-sm items-center justify-center rounded-full border border-line bg-raised text-small font-medium text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={username === null ? "Account menu" : `Account menu for ${username}`}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span aria-hidden>{initial}</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+4px)] z-overlay w-44 overflow-hidden rounded-control border border-line bg-raised shadow-sheet"
        >
          {username !== null ? (
            <p className="truncate border-b border-line px-2 py-1.5 text-micro text-ink-muted">
              @{username}
            </p>
          ) : null}
          {MENU_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="flex h-control-sm items-center px-2 text-small text-ink hover:bg-panel"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            className="flex h-control-sm w-full items-center border-t border-line px-2 text-left text-small text-ink hover:bg-panel"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Signed out: one button, and a second from 640px up. */
export function SignInLinks() {
  return (
    <div className="flex items-center gap-1">
      <Link href="/sign-up" className="hidden sm:inline-flex">
        <Button size="sm" variant="ghost">
          Sign up
        </Button>
      </Link>
      <Link href="/sign-in">
        <Button size="sm" variant="secondary">
          Sign in
        </Button>
      </Link>
    </div>
  );
}
