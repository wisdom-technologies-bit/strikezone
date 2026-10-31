"use client";

import { useSyncExternalStore } from "react";
import { getSlipState, subscribeToSlip, type SlipState } from "./store";

const SERVER_STATE: SlipState = { selections: [] };

/** The slip as the client sees it; the server and the first paint see it empty. */
export function useSlip(): SlipState {
  return useSyncExternalStore(subscribeToSlip, getSlipState, () => SERVER_STATE);
}
