import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getServerStatus,
  markWaking,
  probeHealth,
  resetServerStatusForTests,
  setServerStatus,
  subscribeToServerStatus,
} from "./server-status";

beforeEach(() => {
  resetServerStatusForTests();
});

const okFetch = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
const failFetch = (async () => {
  throw new TypeError("fetch failed");
}) as unknown as typeof fetch;

describe("server status", () => {
  it("starts up", () => {
    expect(getServerStatus()).toBe("up");
  });

  it("notifies subscribers on a change and only on a change", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToServerStatus(listener);

    setServerStatus("waking");
    setServerStatus("waking");
    setServerStatus("up");

    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    setServerStatus("waking");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("returns to up once health answers", async () => {
    const spy = vi.fn(async () => new Response("{}", { status: 200 }));
    const fetchImpl = spy as unknown as typeof fetch;

    await markWaking("https://api.test", {
      fetchImpl,
      intervalMs: 1,
      budgetMs: 100,
      sleep: async () => {},
    });

    expect(getServerStatus()).toBe("up");
    expect(spy).toHaveBeenCalledWith("https://api.test/health", expect.anything());
  });

  it("stays polling while health is down, then settles on up when the budget runs out", async () => {
    const spy = vi.fn(async () => {
      throw new TypeError("down");
    });
    const fetchImpl = spy as unknown as typeof fetch;

    await markWaking("https://api.test", {
      fetchImpl,
      intervalMs: 1,
      budgetMs: 5,
      sleep: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2));
      },
    });

    expect(getServerStatus()).toBe("up");
    expect(spy.mock.calls.length).toBeGreaterThan(0);
  });

  it("makes one poller for six simultaneous failures", async () => {
    const spy = vi.fn(async () => new Response("{}", { status: 200 }));
    const fetchImpl = spy as unknown as typeof fetch;

    await Promise.all(
      Array.from({ length: 6 }, () =>
        markWaking("https://api.test", {
          fetchImpl,
          intervalMs: 1,
          budgetMs: 100,
          sleep: async () => {},
        }),
      ),
    );

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("probes without throwing when the network is gone", async () => {
    await expect(probeHealth("https://api.test", failFetch)).resolves.toBe(false);
    await expect(probeHealth("https://api.test", okFetch)).resolves.toBe(true);
  });
});
