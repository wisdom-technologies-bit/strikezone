import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSpectatorStream, MAX_RECONNECT_ATTEMPTS, type RoomLike } from "./spectator";
import { decodeStreamMessage, snapshotOf } from "./messages";

interface FakeRoom extends RoomLike {
  emit: (payload: unknown) => void;
  leaveWith: (code: number) => void;
  left: boolean;
}

function fakeRoom(roomId: string): FakeRoom {
  let onMessage: ((type: string | number, payload: unknown) => void) | null = null;
  let onLeave: ((code: number) => void) | null = null;

  return {
    roomId,
    left: false,
    onMessage(_type, callback) {
      onMessage = callback;
      return () => {
        onMessage = null;
      };
    },
    onLeave(callback) {
      onLeave = callback;
      return () => {
        onLeave = null;
      };
    },
    async leave() {
      this.left = true;
      return 1000;
    },
    emit(payload) {
      onMessage?.("message", payload);
    },
    leaveWith(code) {
      onLeave?.(code);
    },
  };
}

const snapshot = {
  type: "snapshot",
  matchId: "m1",
  status: "live",
  board: 1,
  turn: "white",
  turnSeat: 1,
  phase: "aiming",
  shotNumber: 4,
  turnEndsAt: 1_700_000_000,
  queenOnBoard: false,
  queenPendingSeat: 0,
  scores: { white: 3, black: 2 },
  seats: [
    {
      seat: 1,
      playerId: "p1",
      displayName: "Ada",
      isBot: false,
      botLevel: null,
      score: 3,
      connected: true,
    },
  ],
  coins: [],
  seedCommit: "abc123",
} as const;

const lag = { type: "lag", skippedShots: 3, reason: "slow_consumer" } as const;

describe("spectator stream", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("joins with the bare match id, spectating, and reports connected", async () => {
    const room = fakeRoom("m1");
    const joinById = vi.fn(async () => room);
    const statuses: string[] = [];

    const stream = createSpectatorStream({
      endpoint: "wss://api.test",
      joinById,
      onStatus: (status) => statuses.push(status),
    });

    await stream.join("m1", "m1");

    expect(joinById).toHaveBeenCalledWith("m1", { matchId: "m1", spectate: true });
    expect(statuses).toEqual(["connecting", "connected"]);
    expect(stream.state.status).toBe("connected");
  });

  it("keeps the latest snapshot and counts a lag", async () => {
    const room = fakeRoom("m1");
    const stream = createSpectatorStream({
      endpoint: "wss://api.test",
      joinById: async () => room,
    });
    await stream.join("m1", "m1");

    room.emit(snapshot);
    room.emit(lag);
    room.emit({ ...snapshot, shotNumber: 9 });

    expect(stream.state.latestSnapshot?.matchId).toBe("m1");
    expect(stream.state.skippedShots).toBe(3);
    expect(stream.state.messageCount).toBe(3);
    expect(stream.state.lastMessageType).toBe("snapshot");
  });

  it("counts a message it cannot decode without inventing one", async () => {
    const room = fakeRoom("m1");
    const stream = createSpectatorStream({
      endpoint: "wss://api.test",
      joinById: async () => room,
    });
    await stream.join("m1", "m1");

    room.emit({ type: "unheard_of", payload: 1 });

    expect(stream.state.messageCount).toBe(1);
    expect(stream.state.lastMessageType).toBe("unheard_of");
    expect(stream.state.latestSnapshot).toBeNull();
  });

  it("reconnects after a dropped socket", async () => {
    vi.useFakeTimers();
    const first = fakeRoom("m1");
    const second = fakeRoom("m1");
    const joinById = vi
      .fn<() => Promise<RoomLike>>()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);

    const stream = createSpectatorStream({ endpoint: "wss://api.test", joinById });
    await stream.join("m1", "m1");

    first.leaveWith(1006);
    expect(stream.state.status).toBe("reconnecting");

    await vi.advanceTimersByTimeAsync(600);
    expect(joinById).toHaveBeenCalledTimes(2);
    expect(stream.state.status).toBe("connected");

    vi.useRealTimers();
  });

  it("reports the stream lost after the last attempt, and not before", async () => {
    vi.useFakeTimers();
    const joinById = vi.fn(async () => {
      throw new Error("join refused");
    });

    const stream = createSpectatorStream({ endpoint: "wss://api.test", joinById });
    await stream.join("m1", "m1");

    for (let attempt = 0; attempt < MAX_RECONNECT_ATTEMPTS + 1; attempt += 1) {
      await vi.advanceTimersByTimeAsync(9_000);
    }

    expect(stream.state.status).toBe("lost");
    expect(joinById).toHaveBeenCalledTimes(MAX_RECONNECT_ATTEMPTS + 1);

    vi.useRealTimers();
  });

  it("treats a refused room as final rather than retrying forever", async () => {
    const room = fakeRoom("m1");
    const stream = createSpectatorStream({
      endpoint: "wss://api.test",
      joinById: async () => room,
    });
    await stream.join("m1", "m1");

    room.leaveWith(4403);

    expect(stream.state.status).toBe("lost");
  });

  it("leaves the room on close", async () => {
    const room = fakeRoom("m1");
    const stream = createSpectatorStream({
      endpoint: "wss://api.test",
      joinById: async () => room,
    });
    await stream.join("m1", "m1");
    await stream.close();

    expect(room.left).toBe(true);
    expect(stream.state.status).toBe("closed");
  });
});

describe("stream message decoding", () => {
  it("reads a Carrom snapshot and a Ludo snapshot without confusing them", () => {
    const carrom = decodeStreamMessage(snapshot);
    expect(carrom?.kind).toBe("spectator");
    expect(snapshotOf(carrom!)?.game).toBe("carrom");

    const ludo = decodeStreamMessage({
      type: "snapshot",
      matchId: "m2",
      status: "playing",
      turnSeat: 2,
      roll: 6,
      moveNumber: 12,
      seeds: { commit: "c1", reveal: null },
      seats: [
        {
          seat: 1,
          displayName: "Ada",
          isBot: false,
          botPolicy: null,
          connected: true,
          home: 1,
          progress: [4, 9, 20, -1],
        },
      ],
      finishingOrder: [],
    });
    expect(ludo?.kind).toBe("ludo_snapshot");
    expect(snapshotOf(ludo!)?.game).toBe("ludo");
  });

  it("drops a frame that is not in the contract", () => {
    expect(decodeStreamMessage({ type: "nonsense" })).toBeNull();
    expect(decodeStreamMessage("a string")).toBeNull();
  });
});
