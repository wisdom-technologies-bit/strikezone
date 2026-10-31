"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useSlip } from "@/lib/slip/use-slip";
import {
  shouldReservePanelSpace,
  shouldShowSlipBar,
  shouldShowSlipPanel,
} from "@/lib/slip/visibility";
import { formatOdds } from "@/lib/odds";

/** A match page is one whose route is a single match: /matches/<id>. */
export function isMatchPath(pathname: string): boolean {
  return /^\/matches\/[^/]+$/.test(pathname);
}

/**
 * The slip surface.
 *
 * Below 1024: a bar above the tab bar, present only once something is in the
 * slip. From 1024 up: a 320px panel on the right, present with a selection or
 * on a match page. Both read the same visibility rules.
 */
export function BetSlipSlot() {
  const pathname = usePathname();
  const slip = useSlip();
  const input = {
    selectionCount: slip.selections.length,
    isMatchPage: isMatchPath(pathname),
  };

  const showBar = shouldShowSlipBar(input);
  const showPanel = shouldShowSlipPanel(input);

  return (
    <>
      {showBar ? (
        <div
          className="sz-betslip flex items-center justify-between gap-2 px-3 lg:hidden"
          data-surface="slip-bar"
          data-testid="slip-bar"
        >
          <span className="text-small text-ink-muted">
            {slip.selections.length === 1 ? "1 selection" : `${slip.selections.length} selections`}
          </span>
          <span className="num text-small text-ink">
            {formatOdds(slip.selections[0]?.oddsDecimal ?? 0)}
          </span>
        </div>
      ) : null}

      {showPanel ? (
        <aside
          className={cn("sz-slip-panel hidden lg:flex", shouldReservePanelSpace(input) ? "" : "")}
          data-surface="slip-panel"
          data-testid="slip-panel"
          aria-label="Bet slip"
        >
          <div className="flex h-full w-full flex-col">
            <div className="flex h-topbar-h shrink-0 items-center justify-between border-b border-line px-3">
              <span className="text-small font-medium text-ink">Bet slip</span>
              <span className="num text-small text-ink-faint">{slip.selections.length}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {slip.selections.length === 0 ? (
                <p className="text-small text-ink-muted">
                  No selections yet. Pick a price to start.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {slip.selections.map((selection) => (
                    <li
                      key={selection.marketId}
                      className="flex items-center justify-between gap-2 rounded-panel border border-line bg-raised px-2 py-1"
                    >
                      <span className="truncate text-small text-ink">{selection.selectionKey}</span>
                      <span className="num shrink-0 text-small text-brass">
                        {formatOdds(selection.oddsDecimal)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
