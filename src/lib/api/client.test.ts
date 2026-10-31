import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createApiClient } from "./client";
import { ApiError, ContractMismatchError, NetworkError } from "./errors";

const bodySchema = z.object({ ok: z.literal(true), value: z.number().int() });

interface Call {
  url: string;
  init: RequestInit;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeClient(
  responses: Array<Response | (() => never)>,
  overrides: Partial<Parameters<typeof createApiClient>[0]> = {},
) {
  const calls: Call[] = [];
  let index = 0;
  const fetchImpl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    const next = responses[index] ?? responses[responses.length - 1];
    index += 1;
    if (typeof next === "function") return next();
    return next as Response;
  }) as unknown as typeof fetch;

  const client = createApiClient({
    baseUrl: "https://api.test",
    fetchImpl,
    retryDelays: [1, 2],
    sleep: async () => {},
    getToken: async () => null,
    ...overrides,
  });

  return { client, calls, fetchImpl };
}

describe("api client", () => {
  it("retries a GET twice on 503 and then succeeds", async () => {
    const { client, calls } = makeClient([
      jsonResponse(503, { ok: false, error: "read_unavailable" }),
      jsonResponse(503, { ok: false, error: "read_unavailable" }),
      jsonResponse(200, { ok: true, value: 7 }),
    ]);

    await expect(client.request(bodySchema, "/api/config")).resolves.toEqual({
      ok: true,
      value: 7,
    });
    expect(calls).toHaveLength(3);
  });

  it("gives up after three GET attempts and raises the waking notice", async () => {
    const onWaking = vi.fn();
    const { client, calls } = makeClient([jsonResponse(502, { ok: false, error: "bad_gateway" })], {
      onWaking,
    });

    await expect(client.request(bodySchema, "/api/config")).rejects.toBeInstanceOf(ApiError);
    expect(calls).toHaveLength(3);
    expect(onWaking).toHaveBeenCalledTimes(1);
  });

  it("never retries a POST, because it may already have been applied", async () => {
    const { client, calls } = makeClient([jsonResponse(503, { ok: false, error: "unavailable" })]);

    await expect(
      client.request(bodySchema, "/api/bets", { method: "POST", body: { stakeMinor: 100 } }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(calls).toHaveLength(1);
  });

  it("retries a GET after a network failure", async () => {
    const { client, calls } = makeClient([
      () => {
        throw new TypeError("fetch failed");
      },
      jsonResponse(200, { ok: true, value: 1 }),
    ]);

    await expect(client.request(bodySchema, "/health")).resolves.toEqual({ ok: true, value: 1 });
    expect(calls).toHaveLength(2);
  });

  it("raises the waking notice for a request that drags past the slow mark", async () => {
    const onWaking = vi.fn();
    const slowFetch = (async () => {
      await new Promise((resolve) => setTimeout(resolve, 40));
      return jsonResponse(200, { ok: true, value: 3 });
    }) as unknown as typeof fetch;

    const client = createApiClient({
      baseUrl: "https://api.test",
      fetchImpl: slowFetch,
      slowMs: 5,
      onWaking,
      getToken: async () => null,
    });

    const result = await client.request(bodySchema, "/api/config");
    expect(result.value).toBe(3);
    expect(onWaking).toHaveBeenCalled();
  });

  it("turns a contract mismatch into its own error, naming the route and not the body", async () => {
    const { client } = makeClient([jsonResponse(200, { ok: true, value: "not a number" })]);

    const error = await client.request(bodySchema, "/api/matches/x").catch((caught) => caught);
    expect(error).toBeInstanceOf(ContractMismatchError);
    expect((error as ContractMismatchError).route).toBe("/api/matches/x");
    expect(error.message).not.toContain("not a number");
  });

  it("normalises a refusal to status and code", async () => {
    const { client } = makeClient([
      jsonResponse(409, { ok: false, error: "odds_moved", message: "the price moved" }),
    ]);

    const error = await client
      .request(bodySchema, "/api/bets", {
        method: "POST",
        body: {},
      })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).code).toBe("odds_moved");
    expect((error as ApiError).message).toBe("the price moved");
  });

  it("sends the bearer token when there is a session, and nothing when there is not", async () => {
    const withToken = makeClient([jsonResponse(200, { ok: true, value: 1 })], {
      getToken: async () => "token-abc",
    });
    await withToken.client.request(bodySchema, "/api/me/wallet");
    const headers = withToken.calls[0]?.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer token-abc");

    const anonymous = makeClient([jsonResponse(200, { ok: true, value: 1 })]);
    await anonymous.client.request(bodySchema, "/api/config");
    const anonymousHeaders = anonymous.calls[0]?.init.headers as Record<string, string>;
    expect(anonymousHeaders.Authorization).toBeUndefined();
  });

  it("builds the query string and drops empty values", async () => {
    const { client, calls } = makeClient([jsonResponse(200, { ok: true, value: 1 })]);
    await client.request(bodySchema, "/api/matches/live", {
      query: { limit: 20, cursor: undefined, game: "ludo" },
    });
    expect(calls[0]?.url).toBe("https://api.test/api/matches/live?limit=20&game=ludo");
  });

  it("reports a network failure as a NetworkError once retries are spent", async () => {
    const onWaking = vi.fn();
    const { client } = makeClient(
      [
        () => {
          throw new TypeError("fetch failed");
        },
      ],
      { onWaking },
    );

    await expect(client.request(bodySchema, "/health")).rejects.toBeInstanceOf(NetworkError);
    expect(onWaking).toHaveBeenCalledTimes(1);
  });
});
