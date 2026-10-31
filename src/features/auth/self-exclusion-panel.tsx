"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "./form-parts";
import { SELF_EXCLUSION_HOURS, selfExclude } from "@/lib/api/endpoints";

/**
 * Responsible play, as one panel.
 *
 * A running exclusion is stated, never shortened: the only control on screen is
 * the end date. Otherwise the durations are offered and one confirmation stands
 * between the player and it, in plain words, because the action cannot be undone.
 */
export const EXCLUSION_LABELS: Readonly<Record<number, string>> = {
  24: "24 hours",
  168: "7 days",
  720: "30 days",
  2160: "90 days",
  8760: "1 year",
};

export function formatExclusionEnd(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function isExclusionRunning(
  iso: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (iso === null || iso === undefined) return false;
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return false;
  return at.getTime() > now.getTime();
}

export interface SelfExclusionPanelProps {
  readonly excludedUntil: string | null;
  /** Called after the server confirms, so the profile can be re-read. */
  readonly onChanged?: () => void | Promise<void>;
  readonly now?: Date;
}

export function SelfExclusionPanel({ excludedUntil, onChanged, now }: SelfExclusionPanelProps) {
  const [pendingHours, setPendingHours] = useState<number | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedUntil, setConfirmedUntil] = useState<string | null>(null);

  const running = isExclusionRunning(excludedUntil, now);
  const shownUntil = confirmedUntil ?? excludedUntil;

  async function confirm() {
    if (pendingHours === null) return;
    setWorking(true);
    setError(null);
    try {
      await selfExclude(pendingHours);
      setConfirmedUntil(new Date(Date.now() + pendingHours * 3_600_000).toISOString());
      setPendingHours(null);
      await onChanged?.();
    } catch {
      setError("The exclusion was not saved. Nothing has changed. Try again.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section
      aria-labelledby="responsible-play-heading"
      className="rounded-control border border-line bg-raised p-3"
    >
      <h2 id="responsible-play-heading" className="text-small font-semibold text-ink">
        Responsible play
      </h2>

      {running && shownUntil !== null ? (
        <p className="mt-1 text-small text-ink">
          Self-excluded until {formatExclusionEnd(shownUntil)}. This cannot be shortened.
        </p>
      ) : (
        <>
          <p className="mt-1 text-small text-ink-muted">
            A break you cannot undo. While it runs you cannot place a bet or deposit.
          </p>
          <ul className="mt-2 flex flex-wrap gap-1">
            {SELF_EXCLUSION_HOURS.map((hours) => (
              <li key={hours}>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPendingHours(hours)}
                >
                  {EXCLUSION_LABELS[hours] ?? `${String(hours)} hours`}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error !== null ? (
        <div className="mt-2">
          <FormAlert>{error}</FormAlert>
        </div>
      ) : null}

      <Dialog
        open={pendingHours !== null}
        onOpenChange={(open) => {
          if (!open) setPendingHours(null);
        }}
        title={`Self-exclude for ${EXCLUSION_LABELS[pendingHours ?? 24] ?? ""}`}
        description="You will not be able to place bets or deposit until then. This cannot be undone."
        footer={
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setPendingHours(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={working}
              loadingLabel="Saving the exclusion"
              onClick={() => {
                void confirm();
              }}
            >
              Self-exclude
            </Button>
          </div>
        }
      >
        {null}
      </Dialog>
    </section>
  );
}
