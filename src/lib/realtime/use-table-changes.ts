"use client";

/**
 * One table, one filter, one callback.
 *
 * Supabase Realtime decides what arrives from RLS, so the filter is the same one
 * the handoff documents. If the channel does not join within five seconds the
 * hook falls back to polling the query that owns the data, so a blocked socket
 * degrades to a slower page rather than a silent one. A dropped channel is
 * re-joined with backoff and unsubscribed on unmount.
 */
import { useEffect, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ChangeEventType, TableChange } from "./types";

export const JOIN_TIMEOUT_MS = 5_000;
export const FALLBACK_POLL_MS = 5_000;
const BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];

export interface TableChangesOptions {
  /** Off until the data is worth watching, e.g. until a match is live. */
  enabled?: boolean;
  /** The query to invalidate when polling stands in for the socket. */
  fallbackQueryKey?: QueryKey;
  fallbackPollMs?: number;
}

export function useTableChanges(
  table: string,
  filter: string | undefined,
  onChange: (change: TableChange) => void,
  options: TableChangesOptions = {},
): void {
  const { enabled = true, fallbackQueryKey, fallbackPollMs = FALLBACK_POLL_MS } = options;
  const queryClient = useQueryClient();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    let disposed = false;
    let channel: RealtimeChannel | null = null;
    let attempt = 0;
    let joinTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    const stopPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = undefined;
    };

    const startPolling = () => {
      if (pollTimer || !fallbackQueryKey) return;
      pollTimer = setInterval(() => {
        void queryClient.invalidateQueries({ queryKey: fallbackQueryKey });
      }, fallbackPollMs);
    };

    const teardown = () => {
      if (joinTimer) clearTimeout(joinTimer);
      joinTimer = undefined;
      stopPolling();
      if (channel) {
        void client.removeChannel(channel);
        channel = null;
      }
    };

    const connect = () => {
      if (disposed) return;
      teardown();

      channel = client
        .channel(`table:${table}:${filter ?? "all"}:${attempt}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            ...(filter ? { filter } : {}),
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            const eventType = payload.eventType as ChangeEventType;
            onChangeRef.current({
              table,
              eventType,
              new: (payload.new ?? {}) as Record<string, unknown>,
              old: (payload.old ?? {}) as Record<string, unknown>,
            });
          },
        )
        .subscribe((status) => {
          if (disposed) return;

          if (status === "SUBSCRIBED") {
            attempt = 0;
            if (joinTimer) clearTimeout(joinTimer);
            joinTimer = undefined;
            stopPolling();
            return;
          }

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)] ?? 30_000;
            attempt += 1;
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(connect, delay);
          }
        });

      // Not joined in time: treat the socket as unavailable and poll instead.
      if (joinTimer) clearTimeout(joinTimer);
      joinTimer = setTimeout(() => {
        startPolling();
      }, JOIN_TIMEOUT_MS);
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      teardown();
    };
  }, [table, filter, enabled, fallbackQueryKey, fallbackPollMs, queryClient]);
}
