"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { TopBar } from "./top-bar";
import { NoticeStrip } from "./notice-strip";
import { Rail } from "./rail";
import { TabBar } from "./tab-bar";
import { BetSlipSlot } from "./bet-slip-slot";
import { getPublicConfig } from "@/lib/config";

const RAIL_KEY = "sz.rail.expanded";

function readRailPreference(): boolean {
  try {
    return window.localStorage.getItem(RAIL_KEY) === "1";
  } catch {
    // Private mode, blocked storage, or no window: the shell still works.
    return false;
  }
}

function writeRailPreference(expanded: boolean): void {
  try {
    window.localStorage.setItem(RAIL_KEY, expanded ? "1" : "0");
  } catch {
    // Ignore: a preference that cannot be saved is not an error worth showing.
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const config = getPublicConfig();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(readRailPreference());
  }, []);

  const toggleRail = () => {
    setExpanded((current) => {
      const next = !current;
      writeRailPreference(next);
      return next;
    });
  };

  const shellStyle = {
    "--chrome-h":
      config.moneyMode === "virtual"
        ? "calc(var(--topbar-h) + var(--notice-h))"
        : "var(--topbar-h)",
    "--rail-current-w": expanded ? "var(--rail-w-expanded)" : "var(--rail-w-collapsed)",
  } as CSSProperties;

  return (
    <div style={shellStyle} className="min-h-dvh">
      <header className="sz-chrome">
        <TopBar config={config} />
        <NoticeStrip moneyMode={config.moneyMode} />
      </header>

      <Rail expanded={expanded} onToggle={toggleRail} />

      <main id="main" className="sz-main page-gutter">
        <div className="mx-auto w-full max-w-content">{children}</div>
      </main>

      <BetSlipSlot />
      <TabBar />
    </div>
  );
}
