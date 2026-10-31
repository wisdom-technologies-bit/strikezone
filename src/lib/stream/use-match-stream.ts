"use client";

/**
 * A spectator stream for one match, as state.
 *
 * The room id comes from the match itself: the server sets `roomId` to the match
 * id while the match is live and null once it is not, so a finished match has no
 * socket to join. Nothing is rendered here, and nothing here decides a result.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicEnv } from "@/lib/env";
import { useMatch } from "@/lib/api/queries";
import { createSpectatorStream, type SpectatorStream, type StreamStatus } from "./spectator";
import type { StreamSnapshot } from "./messages";

export interface MatchStreamState {
  status: StreamStatus;
  latestSnapshot: StreamSnapshot | null;
  lastMessage: string | null;
  messageCount: number;
  lag: number;
  connect: () => void;
  disconnect: () => void;
}

const INITIAL: Omit<MatchStreamState, "connect" | "disconnect"> = {
  status: "idle" as StreamStatus,
  latestSnapshot: null,
  lastMessage: null,
  messageCount: 0,
  lag: 0,
};

export function useMatchStream(matchId: string | null): MatchStreamState {
  const match = useMatch(matchId);
  const [state, setState] = useState<Omit<MatchStreamState, "connect" | "disconnect">>(INITIAL);
  const streamRef = useRef<SpectatorStream | null>(null);

  const disconnect = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) void stream.close();
    setState(INITIAL);
  }, []);

  const connect = useCallback(() => {
    const roomId = match.data?.roomId ?? null;
    if (!matchId || !roomId) return;

    const env = getPublicEnv();
    if (!env.ok) return;

    streamRef.current?.close();
    const stream = createSpectatorStream({
      endpoint: env.env.NEXT_PUBLIC_SOCKET_URL,
      onStatus: (status) => {
        setState((previous) => ({ ...previous, status }));
      },
      onMessage: (message) => {
        setState((previous) => ({
          ...previous,
          lastMessage: message.kind === "spectator" ? message.message.type : message.message.type,
          messageCount: previous.messageCount + 1,
        }));
      },
      onSnapshot: (snapshot) => {
        setState((previous) => ({ ...previous, latestSnapshot: snapshot }));
      },
      onLag: (skippedShots) => {
        setState((previous) => ({ ...previous, lag: previous.lag + skippedShots }));
      },
    });

    streamRef.current = stream;
    void stream.join(roomId, matchId);
  }, [matchId, match.data?.roomId]);

  // A new match means a new room: drop the old socket rather than merge two.
  useEffect(() => disconnect, [matchId, disconnect]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return undefined;
    return () => {
      void stream.close();
    };
  }, [match.data?.roomId]);

  return { ...state, connect, disconnect };
}
