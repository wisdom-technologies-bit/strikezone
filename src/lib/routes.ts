import { Home, Radio, Trophy, Wallet, ReceiptText, ShieldCheck, CircleUser } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Mobile tab label, where space is tighter. */
  tabLabel: string;
}

/** One nav model, rendered by the rail and the tab bar. Order is meaningful. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home, tabLabel: "Home" },
  { href: "/live", label: "Live", icon: Radio, tabLabel: "Live" },
  { href: "/tournaments", label: "Tournaments", icon: Trophy, tabLabel: "Tournaments" },
  { href: "/wallet", label: "Wallet", icon: Wallet, tabLabel: "Wallet" },
  { href: "/bets", label: "My bets", icon: ReceiptText, tabLabel: "Me" },
  { href: "/fairness", label: "Fairness", icon: ShieldCheck, tabLabel: "Fair" },
] as const;

/** The first five are the mobile tabs; the rest live behind Me on mobile. */
export const MOBILE_TAB_ITEMS: readonly NavItem[] = [
  NAV_ITEMS[0]!,
  NAV_ITEMS[1]!,
  NAV_ITEMS[2]!,
  NAV_ITEMS[3]!,
  { href: "/bets", label: "Me", icon: CircleUser, tabLabel: "Me" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
