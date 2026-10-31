/**
 * The one way the site talks to the game server.
 *
 * Every response is parsed by a schema from the contract before it reaches a
 * component, so a protocol change fails here, loudly, and never halfway down the
 * tree. Errors come out normalised: an ApiError with a code to branch on, a
 * ContractMismatchError, or a NetworkError.
 *
 * Two behaviours are deliberate rather than incidental:
 *
 * - Only GET is retried. A POST that failed may have been applied, so the caller
 *   decides (a bet retry reuses its idempotency key).
 * - A slow or unreachable server is not a spinner for a minute. The client marks
 *   the server "waking", and the notice under the top bar takes over.
 */
import type { z } from "zod";
import { ApiError, ContractMismatchError, NetworkError } from "./errors";
import { errorEnvelopeSchema } from "./schemas";
import { SLOW_REQUEST_MS } from "./server-status";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getToken?: () => Promise<string | null>;
  timeoutMs?: number;
  /** Delays between GET attempts. Two entries means three attempts in total. */
  retryDelays?: readonly number[];
  sleep?: (ms: number) => Promise<void>;
  /** Called when the server is slow or unreachable, to raise the waking notice. */
  onWaking?: () => void;
  slowMs?: number;
}

export interface ApiClient {
  request<T>(schema: z.ZodType<T>, route: string, config?: RequestConfig): Promise<T>;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAYS = [300, 900] as const;
const GATEWAY_CODES = new Set([502, 503, 504]);

const realSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function buildUrl(baseUrl: string, route: string, query?: Record<string, QueryValue>): string {
  const url = `${baseUrl}${route}`;
  if (!query) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text.length > 0 ? `${url}?${text}` : url;
}

/** Refusals are read for their code only; unknown shapes still become an ApiError. */
function errorFromResponse(status: number, body: unknown): ApiError {
  const parsed = errorEnvelopeSchema.safeParse(body);
  if (parsed.success) {
    const detail = parsed.data.issues?.map((issue) => `${issue.path}: ${issue.message}`).join(", ");
    return new ApiError({
      status,
      code: parsed.data.error,
      message:
        parsed.data.message ?? (detail ? `${parsed.data.error}: ${detail}` : parsed.data.error),
    });
  }
  return new ApiError({ status, code: "http_error", message: `The server answered ${status}.` });
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const getToken = options.getToken ?? (async () => null);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retryDelays = options.retryDelays ?? DEFAULT_RETRY_DELAYS;
  const sleep = options.sleep ?? realSleep;
  const slowMs = options.slowMs ?? SLOW_REQUEST_MS;

  async function once<T>(
    schema: z.ZodType<T>,
    route: string,
    method: HttpMethod,
    config: RequestConfig,
  ): Promise<T> {
    const url = buildUrl(options.baseUrl, route, config.query);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, config.timeoutMs ?? timeoutMs);

    let slowTimer: ReturnType<typeof setTimeout> | undefined;
    if (options.onWaking) {
      slowTimer = setTimeout(() => {
        options.onWaking?.();
      }, slowMs);
    }
    if (config.signal) {
      if (config.signal.aborted) controller.abort();
      else config.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    const token = await getToken();

    const headers: Record<string, string> = { Accept: "application/json" };
    if (config.body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body: config.body === undefined ? undefined : JSON.stringify(config.body),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (reason) {
      throw new NetworkError("could not reach the server", reason);
    } finally {
      clearTimeout(timer);
      if (slowTimer) clearTimeout(slowTimer);
    }

    if (GATEWAY_CODES.has(response.status)) {
      throw new ApiError({
        status: response.status,
        code: "unavailable",
        message: "The server is not answering yet.",
      });
    }

    let body: unknown = null;
    if (response.status !== 204) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    }

    if (!response.ok) throw errorFromResponse(response.status, body);

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      // The route only. The body stays out of logs: it can belong to someone else.
      const issues = parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      throw new ContractMismatchError(route, issues);
    }
    return parsed.data;
  }

  return {
    async request<T>(schema: z.ZodType<T>, route: string, config: RequestConfig = {}): Promise<T> {
      const method = config.method ?? "GET";
      const attempts = method === "GET" ? retryDelays.length + 1 : 1;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const last = attempt === attempts - 1;
        try {
          return await once(schema, route, method, config);
        } catch (error) {
          const retryable =
            error instanceof NetworkError ||
            (error instanceof ApiError && GATEWAY_CODES.has(error.status));
          if (!retryable) throw error;

          if (!last) {
            const delay = retryDelays[attempt] ?? 0;
            await sleep(delay);
            continue;
          }

          // Out of attempts: the server looks asleep rather than wrong.
          options.onWaking?.();
          throw error;
        }
      }

      throw new NetworkError("request did not run");
    },
  };
}
