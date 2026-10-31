import { describe, expect, it } from "vitest";
import { validatePublicEnv, type RawPublicEnv } from "./env";

const VALID: RawPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://xbgiifdhpdkyirmyydwc.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "a".repeat(60),
  NEXT_PUBLIC_API_BASE: "https://strikezone-server-ex45.onrender.com",
  NEXT_PUBLIC_SOCKET_URL: "wss://strikezone-server-ex45.onrender.com",
};

describe("public env validation", () => {
  it("accepts a complete set", () => {
    const result = validatePublicEnv(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.env.NEXT_PUBLIC_API_BASE).toBe(VALID.NEXT_PUBLIC_API_BASE);
  });

  it("trims a trailing slash so paths never double up", () => {
    const result = validatePublicEnv({
      ...VALID,
      NEXT_PUBLIC_API_BASE: `${VALID.NEXT_PUBLIC_API_BASE}/`,
    });
    expect(result.ok && result.env.NEXT_PUBLIC_API_BASE).toBe(VALID.NEXT_PUBLIC_API_BASE);
  });

  it("names every missing variable and no value", () => {
    const result = validatePublicEnv({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.name).sort()).toEqual(
      [
        "NEXT_PUBLIC_API_BASE",
        "NEXT_PUBLIC_SOCKET_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_URL",
      ].sort(),
    );
    for (const issue of result.issues) expect(issue.message).not.toContain("https://");
  });

  it("rejects a malformed REST base and a socket with a path protocol", () => {
    const result = validatePublicEnv({
      ...VALID,
      NEXT_PUBLIC_API_BASE: "strikezone-server",
      NEXT_PUBLIC_SOCKET_URL: "https://strikezone-server-ex45.onrender.com",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.name).sort()).toEqual([
      "NEXT_PUBLIC_API_BASE",
      "NEXT_PUBLIC_SOCKET_URL",
    ]);
  });

  it("rejects a short anon key", () => {
    const result = validatePublicEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_ANON_KEY: "short" });
    expect(result.ok).toBe(false);
  });
});
