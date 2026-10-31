/**
 * Watching a match over Colyseus.
 *
 * Two rules from the handoff are load-bearing here and easy to get wrong:
 *
 * 1. The client is constructed with the bare origin. The SDK appends its own
 *    matchmake paths, so a path-suffixed endpoint answers 404 for a room that
 *    exists.
 * 2. Frames are decoded only through src/contract. Nothing in this file reads a
 *    frame by hand.
 *
 * A spectator that falls behind is told how many shots it missed and is sent a
 * fresh snapshot. The snapshot is kept; the skipped shots are counted, not faked.
 */
import { Client } from "@colyseus/sdk";
import { STREAM_MESSAGES } from "@/contract/contract";
import {
  decodeStreamMessage,
  snapshotOf,
  streamMessageType,
  type StreamMessage,
  type StreamSnapshot,
} from "./messages";

export type StreamStatus = "idle" | "connecting" | "connected" | "reconnecting" | "lost" | "closed";

export const RECONNECT_DELAYS_MS = [500, 1_000, 2_000, 4_000, 8_000] as const;
export const MAX_RECONNECT_ATTEMPTS = RECONNECT_DELAYS_MS.length;

export interface SpectatorJoinOptions {
  matchId: string;
  spectate: true;
  token?: string;
}

/** The part of a Room this wrapper uses, so a test can stand in for it. */
export interface RoomLike {
  roomId: string;
  onMessage(type: "*", callback: (type: string | number, payload: unknown) => void): () => void;
  onLeave(callback: (code: number) => void): () => void;
  leave(consented?: boolean): Promise<number>;
}

export type JoinById = (roomId: string, options: SpectatorJoinOptions) => Promise<RoomLike>;

export interface SpectatorStreamOptions {
  /** The bare origin, e.g. wss://host. No path, ever. */
  endpoint: string;
  joinById?: JoinById;
  onStatus?: (status: StreamStatus) => void;
  onMessage?: (message: StreamMessage) => void;
  onSnapshot?: (snapshot: StreamSnapshot) => void;
  onLag?: (skippedShots: number) => void;
  onEnd?: (message: StreamMessage) => void;
}

export interface StreamState {
  status: StreamStatus;
  latestSnapshot: StreamSnapshot | null;
  lastMessageType: string | null;
  messageCount: number;
  skippedShots: number;
}

export interface SpectatorStream {
  readonly state: StreamState;
  join(roomId: string, matchId: string): Promise<void>;
  close(): Promise<void>;
}

const NORMAL_CLOSURE = 1000;
/** 4000-4999 is the application range: a refused room, not a dropped socket. */
const FATAL_MIN = 4000;

function defaultJoin(endpoint: string): JoinById {
  return (roomId, options) => {
    const client = new Client(endpoint);
    return client.joinById(roomId, options) as unknown as Promise<RoomLike>;
  };
}

export function createSpectatorStream(options: SpectatorStreamOptions): SpectatorStream {
  const join = options.joinById ?? defaultJoin(options.endpoint);

  const state: StreamState = {
    status: "idle",
    latestSnapshot: null,
    lastMessageType: null,
    messageCount: 0,
    skippedShots: 0,
  };

  let room: RoomLike | null = null;
  let detach: Array<() => void> = [];
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;
  let current: { roomId: string; matchId: string } | null = null;

  const setStatus = (status: StreamStatus) => {
    if (state.status === status) return;
    state.status = status;
    options.onStatus?.(status);
  };

  const teardownRoom = () => {
    for (const off of detach) off();
    detach = [];
    room = null;
  };

  const handleMessage = (raw: unknown) => {
    const type = streamMessageType(raw);
    const decoded = decodeStreamMessage(raw);

    state.messageCount += 1;
    state.lastMessageType = type;

    if (!decoded) return;

    if (type === STREAM_MESSAGES.lag) {
      const parsed =
        decoded.kind === "spectator" && decoded.message.type === "lag" ? decoded.message : null;
      if (parsed) {
        state.skippedShots += parsed.skippedShots;
        options.onLag?.(parsed.skippedShots);
      }
    }

    const snapshot = snapshotOf(decoded);
    if (snapshot) {
      // A snapshot replaces what came before: it is the board as it stands now.
      state.latestSnapshot = snapshot;
      options.onSnapshot?.(snapshot);
    }

    options.onMessage?.(decoded);

    if (type === STREAM_MESSAGES.end) options.onEnd?.(decoded);
  };

  const connect = async (): Promise<void> => {
    if (!current || closed) return;
    setStatus(attempt === 0 ? "connecting" : "reconnecting");

    try {
      room = await join(current.roomId, { matchId: current.matchId, spectate: true });
      const joined = room;
      attempt = 0;
      setStatus("connected");

      detach.push(joined.onMessage("*", (_type, payload) => handleMessage(payload)));
      detach.push(
        joined.onLeave((code) => {
          if (closed) return;
          teardownRoom();
          // A refused room will not accept a retry; a dropped socket might.
          if (code === NORMAL_CLOSURE || code >= FATAL_MIN) {
            setStatus(code === NORMAL_CLOSURE ? "closed" : "lost");
            return;
          }
          scheduleReconnect();
        }),
      );
    } catch {
      scheduleReconnect();
    }
  };

  const scheduleReconnect = (): void => {
    if (closed) return;
    if (attempt >= MAX_RECONNECT_ATTEMPTS) {
      setStatus("lost");
      return;
    }
    const delay = RECONNECT_DELAYS_MS[attempt] ?? 8_000;
    attempt += 1;
    setStatus("reconnecting");
    timer = setTimeout(() => {
      void connect();
    }, delay);
  };

  return {
    get state() {
      return state;
    },

    async join(roomId, matchId) {
      closed = false;
      current = { roomId, matchId };
      attempt = 0;
      state.latestSnapshot = null;
      state.lastMessageType = null;
      state.messageCount = 0;
      state.skippedShots = 0;
      await connect();
    },

    async close() {
      closed = true;
      if (timer) clearTimeout(timer);
      timer = undefined;
      const joined = room;
      teardownRoom();
      setStatus("closed");
      if (joined) {
        try {
          await joined.leave(true);
        } catch {
          // Leaving a room that is already gone is not a failure worth surfacing.
        }
      }
    },
  };
}
