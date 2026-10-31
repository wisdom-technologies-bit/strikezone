/**
 * Turning whatever arrives on the socket into a typed message.
 *
 * The contract owns the wire format. A spectator message is validated by its own
 * union; Ludo adds two more messages (`roll`, `move`) that the spectator union
 * does not carry, so they are read with the Ludo schemas before giving up. An
 * unknown frame is dropped, never guessed at.
 */
import {
  decodeFrames,
  ludoMoveMessageSchema,
  ludoRollMessageSchema,
  ludoSnapshotMessageSchema,
  spectatorMessageSchema,
  type DecodedFrames,
  type LudoMoveMessage,
  type LudoRollMessage,
  type LudoSnapshotMessage,
  type SpectatorMessage,
} from "@/contract/contract";

export type StreamMessage =
  | { kind: "spectator"; message: SpectatorMessage }
  | { kind: "ludo_roll"; message: LudoRollMessage }
  | { kind: "ludo_move"; message: LudoMoveMessage }
  | { kind: "ludo_snapshot"; message: LudoSnapshotMessage };

/** The wire name of a message, from the contract's own map. */
export function streamMessageType(raw: unknown): string | null {
  if (typeof raw !== "object" || raw === null) return null;
  const type = (raw as { type?: unknown }).type;
  return typeof type === "string" ? type : null;
}

export function decodeStreamMessage(raw: unknown): StreamMessage | null {
  const spectator = spectatorMessageSchema.safeParse(raw);
  if (spectator.success) return { kind: "spectator", message: spectator.data };

  const ludoSnapshot = ludoSnapshotMessageSchema.safeParse(raw);
  if (ludoSnapshot.success) return { kind: "ludo_snapshot", message: ludoSnapshot.data };

  const ludoRoll = ludoRollMessageSchema.safeParse(raw);
  if (ludoRoll.success) return { kind: "ludo_roll", message: ludoRoll.data };

  const ludoMove = ludoMoveMessageSchema.safeParse(raw);
  if (ludoMove.success) return { kind: "ludo_move", message: ludoMove.data };

  return null;
}

/** Frames for a Carrom shot, decoded only through the contract. */
export function decodeShotFrames(raw: unknown): DecodedFrames | null {
  const parsed = spectatorMessageSchema.safeParse(raw);
  if (!parsed.success || parsed.data.type !== "shot") return null;
  try {
    return decodeFrames(parsed.data.frames);
  } catch {
    return null;
  }
}

/** The snapshot carried by any of the three snapshot forms, in one shape. */
export interface StreamSnapshot {
  game: "carrom" | "ludo";
  matchId: string;
  status: string;
  seedCommit: string | null;
  /** Carrom carries the board; Ludo carries seats and finishing order. */
  carrom: Extract<SpectatorMessage, { type: "snapshot" }> | null;
  ludo: LudoSnapshotMessage | null;
}

export function snapshotOf(message: StreamMessage): StreamSnapshot | null {
  if (message.kind === "spectator" && message.message.type === "snapshot") {
    return {
      game: "carrom",
      matchId: message.message.matchId,
      status: message.message.status,
      seedCommit: message.message.seedCommit,
      carrom: message.message,
      ludo: null,
    };
  }
  if (message.kind === "ludo_snapshot") {
    return {
      game: "ludo",
      matchId: message.message.matchId,
      status: message.message.status,
      seedCommit: message.message.seeds.commit,
      carrom: null,
      ludo: message.message,
    };
  }
  return null;
}
