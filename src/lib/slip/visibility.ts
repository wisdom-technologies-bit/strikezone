/**
 * When the slip is on screen.
 *
 * Below 1024 there is one surface: a bar above the tab bar, and only once
 * something is in the slip. From 1024 up that bar never appears; instead the
 * slip is a 320px panel on the right, shown when there is a selection or when
 * the page is a match page (where the markets are).
 */

export const SLIP_PANEL_MIN_WIDTH = 1024;

export interface SlipVisibilityInput {
  /** How many selections are in the slip. */
  selectionCount: number;
  /** True on a match page, where the panel is useful before a pick is made. */
  isMatchPage: boolean;
}

/** The bottom bar: below 1024 only, and only with something in the slip. */
export function shouldShowSlipBar({ selectionCount }: SlipVisibilityInput): boolean {
  return selectionCount > 0;
}

/** The right panel: from 1024 up, with a selection or on a match page. */
export function shouldShowSlipPanel({ selectionCount, isMatchPage }: SlipVisibilityInput): boolean {
  return selectionCount > 0 || isMatchPage;
}

/** True when the main column has to make room for the panel at 1024 and up. */
export function shouldReservePanelSpace(input: SlipVisibilityInput): boolean {
  return shouldShowSlipPanel(input);
}
