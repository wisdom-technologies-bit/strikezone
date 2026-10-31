/**
 * The bet slip, as little as it can be for now.
 *
 * A plain module store with a subscription, so the shell can react to the slip
 * without pulling a state library in before the slip has any product UI. The
 * visibility rules below are pure and live next to the store so they can be
 * tested without a browser.
 */

export interface SlipSelection {
  marketId: string;
  selectionKey: string;
  oddsDecimal: number;
}

export interface SlipState {
  selections: readonly SlipSelection[];
}

type Listener = () => void;

const EMPTY: SlipState = { selections: [] };

let state: SlipState = EMPTY;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getSlipState(): SlipState {
  return state;
}

export function subscribeToSlip(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Adds a selection, or replaces the one for the same market. */
export function addSelection(selection: SlipSelection): void {
  const others = state.selections.filter((entry) => entry.marketId !== selection.marketId);
  state = { selections: [...others, selection] };
  emit();
}

export function removeSelection(marketId: string): void {
  const remaining = state.selections.filter((entry) => entry.marketId !== marketId);
  if (remaining.length === state.selections.length) return;
  state = { selections: remaining };
  emit();
}

export function clearSelection(): void {
  if (state.selections.length === 0) return;
  state = EMPTY;
  emit();
}

/** Test seam: no exported mutable state, so a test cannot leak into the app. */
export function resetSlipForTests(): void {
  state = EMPTY;
  listeners.clear();
}
