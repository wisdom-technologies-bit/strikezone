/**
 * Whether the game server is awake.
 *
 * The Render instance can idle out, and the first request after that takes up to
 * a minute. Rather than let a request sit on a spinner, the client marks the
 * server "waking" and polls /health until it answers.
 *
 * A module store, so the notice can render without a provider and the fetch
 * wrapper can set it without importing React.
 */

export type ServerStatus = "up" | "waking";

export const HEALTH_POLL_INTERVAL_MS = 3_000;
export const HEALTH_POLL_BUDGET_MS = 90_000;
export const SLOW_REQUEST_MS = 4_000;

interface Options {
  fetchImpl?: typeof fetch;
  intervalMs?: number;
  budgetMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

type Listener = () => void;

let status: ServerStatus = "up";
let polling = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getServerStatus(): ServerStatus {
  return status;
}

export function subscribeToServerStatus(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setServerStatus(next: ServerStatus): void {
  if (status === next) return;
  status = next;
  emit();
}

const realSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** One probe. Never throws: a failed probe is simply "not awake yet". */
export async function probeHealth(
  apiBase: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetchImpl(`${apiBase}/health`, { method: "GET", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Enters the waking state and polls /health until it answers or the budget runs
 * out. Repeated calls while already polling are ignored, so a page that fires six
 * requests at once still makes one poller.
 */
export async function markWaking(apiBase: string, options: Options = {}): Promise<void> {
  setServerStatus("waking");
  if (polling) return;

  polling = true;
  const fetchImpl = options.fetchImpl ?? fetch;
  const intervalMs = options.intervalMs ?? HEALTH_POLL_INTERVAL_MS;
  const budgetMs = options.budgetMs ?? HEALTH_POLL_BUDGET_MS;
  const wait = options.sleep ?? realSleep;
  const startedAt = Date.now();

  try {
    while (Date.now() - startedAt < budgetMs) {
      await wait(intervalMs);
      if (await probeHealth(apiBase, fetchImpl)) {
        setServerStatus("up");
        return;
      }
    }
    // Out of patience: back to "up" so the notice clears. The next failure starts
    // the wait again, which is the honest behaviour.
    setServerStatus("up");
  } finally {
    polling = false;
  }
}

/** Test seam only. */
export function resetServerStatusForTests(): void {
  status = "up";
  polling = false;
  listeners.clear();
}
