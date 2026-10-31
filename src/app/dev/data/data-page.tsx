"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stat } from "@/components/ui/stat";
import { getHealth } from "@/lib/api/endpoints";
import {
  useConfig,
  useLiveMatches,
  useMarkets,
  useRecentMatches,
  useUpcomingMatches,
} from "@/lib/api/queries";
import { useServerStatus } from "@/lib/api/use-server-status";
import { useMatchStream } from "@/lib/stream/use-match-stream";
import { PUBLIC_ENV_NAMES, getPublicEnv } from "@/lib/env";
import { marketStatusLabel } from "@/lib/realtime/types";

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={ok ? "size-1.5 rounded-full bg-win" : "size-1.5 rounded-full bg-loss"}
    />
  );
}

/** Names and a dot. Never a value: this page is fit to screenshot. */
function EnvPanel() {
  const env = getPublicEnv();
  const present = useMemo(() => {
    const names = new Set(PUBLIC_ENV_NAMES);
    return PUBLIC_ENV_NAMES.map((name) => ({
      name,
      ok: env.ok || !env.issues.some((issue) => issue.name === name && names.has(name)),
    }));
  }, [env]);

  return (
    <Panel>
      <PanelHeader title="Environment" description="Names only. Values are never printed." />
      <ul className="flex flex-col gap-1">
        {present.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-small">
            <Dot ok={entry.ok} />
            <span className="num truncate text-ink">{entry.name}</span>
            <span className="ml-auto text-ink-faint">{entry.ok ? "set" : "missing"}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function HealthPanel() {
  const status = useServerStatus();
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const health = useQuery({
    queryKey: ["dev-health"],
    queryFn: async () => {
      const started = performance.now();
      const body = await getHealth();
      return { body, latencyMs: Math.round(performance.now() - started) };
    },
    staleTime: 0,
  });

  return (
    <Panel>
      <PanelHeader
        title="Health"
        description="GET /health, as the client sees it."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setStartedAt(Date.now());
              void health.refetch();
            }}
          >
            Check
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <Stat
          label="Status"
          value={
            health.data ? (health.data.body.ok ? "ok" : "error") : health.isError ? "failed" : "…"
          }
        />
        <Stat label="Latency" value={health.data ? `${health.data.latencyMs} ms` : "…"} />
        <Stat label="Version" value={health.data?.body.version ?? "…"} />
        <Stat
          label="Uptime"
          value={health.data ? `${Math.round(health.data.body.uptimeSeconds)} s` : "…"}
        />
      </div>
      <div className="mt-2 flex items-center gap-2 text-small text-ink-muted">
        <Dot ok={status === "up"} />
        <span>serverStatus: {status}</span>
        {startedAt ? (
          <span className="num ml-auto text-ink-faint">
            last check {new Date(startedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </div>
    </Panel>
  );
}

function ConfigPanel() {
  const config = useConfig();

  return (
    <Panel>
      <PanelHeader title="Config" description="GET /api/config, whole." />
      {config.isPending ? (
        <p className="text-small text-ink-muted">Loading…</p>
      ) : config.isError ? (
        <p className="text-small text-loss">Could not read the config.</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-small">
          {Object.entries(config.data as unknown as Record<string, unknown>).map(([key, value]) => (
            <div
              key={key}
              className="col-span-2 flex items-baseline justify-between gap-2 border-b border-line py-1 last:border-0"
            >
              <dt className="num text-ink-muted">{key}</dt>
              <dd className="num truncate text-ink">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

function MatchCounts() {
  const live = useLiveMatches();
  const upcoming = useUpcomingMatches();
  const recent = useRecentMatches();

  return (
    <Panel>
      <PanelHeader title="Matches" description="How many each public list returns." />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Live" value={live.data ? String(live.data.matches.length) : "…"} />
        <Stat label="Upcoming" value={upcoming.data ? String(upcoming.data.matches.length) : "…"} />
        <Stat label="Recent" value={recent.data ? String(recent.data.matches.length) : "…"} />
      </div>
      <p className="mt-2 text-micro text-ink-faint">
        A count of what came back, not a total: the lists are paginated.
      </p>
    </Panel>
  );
}

function MatchProbe() {
  const [matchId, setMatchId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const markets = useMarkets(activeId);
  const stream = useMatchStream(activeId);

  const isLive = markets.data?.markets.some((market) => market.isLive) ?? false;
  const lastUpdate = markets.dataUpdatedAt
    ? new Date(markets.dataUpdatedAt).toLocaleTimeString()
    : "—";

  return (
    <Panel>
      <PanelHeader title="One match" description="Paste a match id. Reads only." />
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const next = matchId.trim();
          setActiveId(next.length > 0 ? next : null);
        }}
      >
        <Input
          aria-label="Match id"
          placeholder="match id"
          value={matchId}
          onChange={(event) => setMatchId(event.target.value)}
        />
        <Button size="sm" type="submit">
          Load
        </Button>
      </form>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat
          label="Markets"
          value={markets.data ? String(markets.data.markets.length) : activeId ? "…" : "—"}
        />
        <Stat label="Last update" value={lastUpdate} />
      </div>

      {markets.isError ? (
        <p className="mt-2 text-small text-loss">No markets for that id.</p>
      ) : null}

      {markets.data && markets.data.markets.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {markets.data.markets.slice(0, 4).map((market) => (
            <li key={market.id} className="flex items-center justify-between gap-2 text-small">
              <span className="num truncate text-ink-muted">{market.marketType}</span>
              <span className="flex items-center gap-2">
                <span className="num text-ink">{market.selections.length} sel</span>
                <Badge tone={market.status === "open" ? "open" : "suspended"}>
                  {marketStatusLabel(market.status)}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {activeId ? (
        <div className="mt-3 border-t border-line pt-2">
          <div className="flex items-center gap-2">
            <span className="text-small text-ink-muted">Stream</span>
            <Badge tone={stream.status === "connected" ? "open" : "void"}>{stream.status}</Badge>
            <span className="num ml-auto text-small text-ink-faint">
              {stream.messageCount} msgs
            </span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Stat label="Last message" value={stream.lastMessage ?? "—"} />
            <Stat label="Skipped" value={String(stream.lag)} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!isLive && stream.status === "idle"}
              onClick={stream.connect}
            >
              Connect spectator
            </Button>
            <Button size="sm" variant="ghost" onClick={stream.disconnect}>
              Disconnect
            </Button>
            {stream.latestSnapshot ? (
              <span className="num text-micro text-ink-faint">
                snapshot: {stream.latestSnapshot.status}
              </span>
            ) : null}
          </div>
          {!isLive ? (
            <p className="mt-1 text-micro text-ink-faint">
              The room only exists while the match is live.
            </p>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

export function DataPage() {
  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-section font-semibold text-ink">Data layer</h1>
        <span className="text-micro text-ink-faint">dev only</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <EnvPanel />
        <HealthPanel />
        <ConfigPanel />
        <MatchCounts />
      </div>
      <MatchProbe />
    </div>
  );
}
