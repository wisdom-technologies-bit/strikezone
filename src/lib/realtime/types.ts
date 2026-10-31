/** The market statuses the server writes, from the handoff's Realtime section. */
export type MarketStatus = "open" | "suspended" | "closed" | "settled" | "void";

export type ChangeEventType = "INSERT" | "UPDATE" | "DELETE";

export interface TableChange {
  table: string;
  eventType: ChangeEventType;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

/** Human wording for a market status. "closed" is normal, not a failure. */
export function marketStatusLabel(status: MarketStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "suspended":
      return "Suspended";
    case "closed":
      return "Closed";
    case "settled":
      return "Settled";
    case "void":
      return "Void";
  }
}

/** True for the two states that mean "briefly no betting", never "error". */
export function isBrieflyNoBetting(status: MarketStatus): boolean {
  return status === "suspended" || status === "closed";
}
