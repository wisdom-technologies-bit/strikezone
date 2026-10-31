"use client";

import { useSyncExternalStore } from "react";
import { getServerStatus, subscribeToServerStatus, type ServerStatus } from "./server-status";

/** "up" on the server and on the first paint, so nothing flashes. */
export function useServerStatus(): ServerStatus {
  return useSyncExternalStore(subscribeToServerStatus, getServerStatus, () => "up" as const);
}
