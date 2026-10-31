import type { EnvIssue } from "@/lib/env";

/**
 * Development only: a full page instead of a half-working app.
 *
 * It names the variables and says what is wrong with each, and never prints a
 * value. In production the same detail goes to the server log instead.
 */
export function ConfigError({ issues }: { issues: readonly EnvIssue[] }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-content flex-col gap-4 p-6">
      <h1 className="text-section font-semibold text-loss">Configuration error</h1>
      <p className="text-body text-ink-muted">
        These values are missing or malformed, so nothing on this site can talk to the server. Copy{" "}
        <code className="num rounded-control border border-line bg-raised px-1">.env.example</code>{" "}
        to <code className="num rounded-control border border-line bg-raised px-1">.env.local</code>{" "}
        and fill them in.
      </p>
      <ul className="flex flex-col gap-2" data-testid="config-error-list">
        {issues.map((issue) => (
          <li
            key={issue.name}
            className="rounded-panel border border-line bg-panel px-3 py-2 text-small"
          >
            <span className="num text-ink">{issue.name}</span>
            <span className="text-ink-muted"> {issue.message}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
