"use client";

import { useState } from "react";
import { Copy, Plus, Settings2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { CarromIcon, LudoIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { OddsButton } from "@/components/ui/odds-button";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StakeInput } from "@/components/ui/stake-input";
import { Stat } from "@/components/ui/stat";
import { Switch } from "@/components/ui/switch";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { Wordmark } from "@/components/ui/wordmark";
import { CONTRAST_PAIRS, CONTRAST_SUMMARY } from "@/lib/contrast-table";
import { formatMoney, type MoneyConfig } from "@/lib/money";

/** The gallery shows the virtual currency, the way the shell does today. */
const GALLERY_MONEY: MoneyConfig = { currency: "XTS", moneyMode: "virtual" };

const TOKENS: readonly { name: string; value: string; varName: string; note?: string }[] = [
  { name: "surface-0", value: "#0A0F1A", varName: "--surface-0", note: "page" },
  { name: "surface-1", value: "#0F1626", varName: "--surface-1", note: "panels" },
  { name: "surface-2", value: "#151D30", varName: "--surface-2", note: "raised, hover" },
  { name: "border", value: "#1F2A42", varName: "--border" },
  { name: "border-strong", value: "#2B3A5A", varName: "--border-strong" },
  { name: "text", value: "#E7EBF3", varName: "--text" },
  { name: "text-muted", value: "#94A0B8", varName: "--text-muted" },
  {
    name: "text-faint",
    value: "#7A869F",
    varName: "--text-faint",
    note: "lifted from #66728A for AA",
  },
  { name: "brass-500", value: "#C8A24A", varName: "--brass-500", note: "accent" },
  { name: "brass-600", value: "#A8852F", varName: "--brass-600", note: "accent pressed" },
  { name: "brass tint", value: "rgba(200,162,74,0.12)", varName: "--brass-tint" },
  { name: "win", value: "#2CBFA6", varName: "--win" },
  { name: "loss", value: "#E5586D", varName: "--loss" },
  { name: "warn", value: "#E0A93B", varName: "--warn" },
  { name: "info", value: "#5B8DEF", varName: "--info" },
];

const TYPE_SCALE: readonly { label: string; className: string; spec: string }[] = [
  { label: "Micro label", className: "text-micro text-ink-muted", spec: "11/14" },
  { label: "Small, secondary", className: "text-small text-ink-muted", spec: "12/16" },
  { label: "Body", className: "text-body text-ink", spec: "13/18" },
  {
    label: "Section title",
    className: "text-section font-semibold text-ink",
    spec: "14/20 semibold",
  },
  { label: "Page title", className: "text-title font-semibold text-ink", spec: "16/22 semibold" },
  { label: "Odds, money", className: "num text-title font-semibold text-ink", spec: "16/22 mono" },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-4 first:border-t-0">
      <h2 className="text-section font-semibold text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-prose text-small text-ink-muted">{description}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <span className="w-40 shrink-0 text-micro text-ink-faint">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Gallery() {
  const toast = useToast();
  const [segment, setSegment] = useState("all");
  const [tab, setTab] = useState("open");
  const [checked, setChecked] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [market, setMarket] = useState("all");
  const [stake, setStake] = useState<number | null>(10000);
  const [odds, setOdds] = useState(3.64);
  const [selected, setSelected] = useState<string | null>("red");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="pb-8">
      <header className="py-3">
        <h1 className="text-title font-semibold text-ink">Design system</h1>
        <p className="mt-1 text-small text-ink-muted">
          Every component at its real size and states. Tokens are the only source of colour, spacing
          and type. Hover and focus-visible are live: point at a control or tab through.
        </p>
      </header>

      <Section
        id="tokens"
        title="Colour tokens"
        description="Defined once in src/styles/tokens.css."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TOKENS.map((token) => (
            <div key={token.name} className="rounded-control border border-line bg-panel p-2">
              <div
                className="h-6 w-full rounded-control border border-line"
                style={{ background: `var(${token.varName})` }}
              />
              <p className="mt-1 truncate text-small text-ink">{token.name}</p>
              <p className="num truncate text-micro text-ink-faint">{token.value}</p>
              {token.note ? (
                <p className="truncate text-micro text-ink-faint">{token.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="contrast"
        title="Contrast"
        description={`${CONTRAST_SUMMARY.pairs} pairs measured with the WCAG 2.1 formula. ${CONTRAST_SUMMARY.failures} failures, lowest ratio ${CONTRAST_SUMMARY.minimum}:1.`}
      >
        <Table>
          <THead>
            <TR>
              <TH>Pair</TH>
              <TH>Foreground</TH>
              <TH>Background</TH>
              <TH numeric>Ratio</TH>
              <TH>Verdict</TH>
            </TR>
          </THead>
          <TBody>
            {CONTRAST_PAIRS.map((pair) => (
              <TR key={pair.label}>
                <TD mono={false}>{pair.label}</TD>
                <TD mono={false}>{pair.foreground}</TD>
                <TD mono={false}>{pair.background}</TD>
                <TD numeric>{pair.ratio.toFixed(2)}</TD>
                <TD
                  mono={false}
                  className={pair.verdict === "fail" ? "text-loss" : "text-ink-muted"}
                >
                  {pair.verdict}
                  {pair.note ? <span className="text-ink-faint"> · {pair.note}</span> : null}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section
        id="type"
        title="Type scale"
        description="Geist for the UI, Geist Mono for every number that matters."
      >
        <div className="flex flex-col gap-2">
          {TYPE_SCALE.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 border-b border-line pb-2"
            >
              <span className={row.className}>
                {row.label === "Odds, money" ? "3.64 · ₦12,345.67" : row.label}
              </span>
              <span className="num shrink-0 text-micro text-ink-faint">{row.spec}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="buttons"
        title="Buttons"
        description="Sizes 28 / 32 / 36. Brass primary, secondary, ghost, danger."
      >
        <Row label="primary / secondary / ghost / danger">
          <Button variant="primary">Place bet</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Details</Button>
          <Button variant="danger">Self-exclude</Button>
        </Row>
        <Row label="sizes">
          <Button variant="primary" size="sm">
            Small 28
          </Button>
          <Button variant="primary" size="md">
            Medium 32
          </Button>
          <Button variant="primary" size="lg">
            Large 36
          </Button>
        </Row>
        <Row label="disabled">
          <Button variant="primary" disabled>
            Place bet
          </Button>
          <Button variant="secondary" disabled>
            Cancel
          </Button>
          <Button variant="danger" disabled>
            Self-exclude
          </Button>
        </Row>
        <Row label="loading">
          <Button variant="primary" loading loadingLabel="Placing">
            Place bet
          </Button>
          <Button variant="secondary" loading loadingLabel="Checking">
            Check price
          </Button>
        </Row>
        <Row label="icon buttons">
          <IconButton icon={Plus} label="Add" size="sm" />
          <IconButton icon={Settings2} label="Settings" />
          <IconButton icon={Trash2} label="Remove" size="lg" />
          <IconButton icon={Copy} label="Copy (selected)" selected />
          <IconButton icon={Plus} label="Disabled" disabled />
          <IconButton icon={Plus} label="Loading" loading />
        </Row>
      </Section>

      <Section
        id="fields"
        title="Fields"
        description="Stakes and amounts are integers in minor units, formatted once."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Display name" placeholder="Ada" hint="Shown on your matches." />
          <Input label="Display name" placeholder="Ada" error="That name is taken." />
          <Input label="Search" placeholder="Match id or player" size="sm" />
          <Input label="Disabled" defaultValue="Not editable" disabled />
          <Select
            label="Market filter"
            value={market}
            onValueChange={setMarket}
            options={[
              { value: "all", label: "All markets" },
              { value: "winner", label: "Match winner" },
              { value: "queen", label: "Queen markets", disabled: true },
            ]}
          />
          <StakeInput
            value={stake}
            onValueChange={setStake}
            min={100}
            max={5000000}
            config={GALLERY_MONEY}
            hint="Between 1.00 and 50,000.00."
          />
          <StakeInput
            value={null}
            onValueChange={() => undefined}
            min={100}
            max={5000000}
            config={GALLERY_MONEY}
            label="Stake (disabled)"
            disabled
          />
        </div>
      </Section>

      <Section id="toggles" title="Toggles and segments">
        <Row label="switch">
          <Switch checked={checked} onCheckedChange={setChecked} label="Live odds" />
          <Switch checked={false} onCheckedChange={() => undefined} label="Off" />
          <Switch checked disabled onCheckedChange={() => undefined} label="Disabled" />
        </Row>
        <Row label="checkbox">
          <Checkbox
            checked={acknowledged}
            onCheckedChange={setAcknowledged}
            label="I understand the rules"
          />
          <Checkbox
            checked="indeterminate"
            onCheckedChange={() => undefined}
            label="Part selected"
          />
          <Checkbox checked={false} onCheckedChange={() => undefined} label="Disabled" disabled />
        </Row>
        <Row label="segmented control">
          <SegmentedControl
            label="Game"
            value={segment}
            onValueChange={setSegment}
            options={[
              { value: "all", label: "All" },
              { value: "carrom", label: "Carrom" },
              { value: "ludo", label: "Ludo" },
            ]}
          />
          <SegmentedControl
            label="Disabled"
            value="all"
            onValueChange={() => undefined}
            disabled
            options={[
              { value: "all", label: "All" },
              { value: "carrom", label: "Carrom" },
            ]}
          />
        </Row>
      </Section>

      <Section
        id="tabs"
        title="Tabs"
        description="Compact underline. The underline is the state, nothing else moves."
      >
        <Tabs
          label="Market groups"
          value={tab}
          onValueChange={setTab}
          items={[
            { value: "open", label: "Open", count: 12 },
            { value: "live", label: "Live", count: 3 },
            { value: "settled", label: "Settled", count: 41 },
            { value: "void", label: "Void" },
          ]}
        >
          <TabPanel value="open">
            <p className="text-small text-ink-muted">Open markets panel.</p>
          </TabPanel>
          <TabPanel value="live">
            <p className="text-small text-ink-muted">Live markets panel.</p>
          </TabPanel>
          <TabPanel value="settled">
            <p className="text-small text-ink-muted">Settled markets panel.</p>
          </TabPanel>
          <TabPanel value="void">
            <p className="text-small text-ink-muted">Void markets panel.</p>
          </TabPanel>
        </Tabs>
      </Section>

      <Section
        id="badges"
        title="Badges"
        description="Bots are labelled, test coins are labelled, nothing is inferred by colour alone."
      >
        <div className="flex flex-wrap gap-2">
          {(
            [
              "live",
              "upcoming",
              "open",
              "suspended",
              "won",
              "lost",
              "void",
              "pending-review",
              "bot",
              "test-coins",
            ] as const
          ).map((tone) => (
            <Badge key={tone} tone={tone} />
          ))}
        </div>
        <Row label="in context">
          <Badge tone="bot" dot={false}>
            bot · club
          </Badge>
          <Badge tone="live">live · board 2</Badge>
          <Badge tone="pending-review" dot={false}>
            pending review
          </Badge>
        </Row>
      </Section>

      <Section
        id="panel"
        title="Panel and stats"
        description="Borders separate; the shadow is only for sheets and dialogs."
      >
        <Panel>
          <PanelHeader
            title="Carrom · board 2"
            description="Ada vs Club Bot. Seed committed before play."
            actions={<IconButton icon={Settings2} label="Match settings" size="sm" />}
          />
          <PanelBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Available" value={formatMoney(2500000, GALLERY_MONEY)} />
              <Stat label="At risk" value={formatMoney(10000, GALLERY_MONEY)} tone="warn" />
              <Stat label="Odds" value="3.64" />
              <Stat label="Payout" value={formatMoney(36400, GALLERY_MONEY)} tone="win" />
            </div>
          </PanelBody>
          <PanelFooter>
            <span className="text-micro text-ink-faint">Updated 2s ago</span>
            <Button size="sm" variant="secondary">
              Open match
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section
        id="table"
        title="Table"
        description="Dense rows, sticky header, scrolls inside its own box on mobile."
      >
        <Table>
          <THead>
            <TR>
              <TH>Seat</TH>
              <TH>Player</TH>
              <TH numeric>Score</TH>
              <TH numeric>Odds</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {[
              { seat: 1, name: "Ada", score: 25, odds: 1.82, status: "won" as const },
              { seat: 2, name: "Club Bot", score: 11, odds: 3.64, status: "lost" as const },
              { seat: 1, name: "Tunde", score: 14, odds: 2.1, status: "open" as const },
              { seat: 2, name: "Master Bot", score: 18, odds: 1.74, status: "open" as const },
            ].map((row, index) => (
              <TR key={`${row.name}-${index}`}>
                <TD numeric>{row.seat}</TD>
                <TD mono={false}>
                  <span className="flex items-center gap-1">
                    {row.name}
                    {row.name.includes("Bot") ? <Badge tone="bot" /> : null}
                  </span>
                </TD>
                <TD numeric>{row.score}</TD>
                <TD numeric>{row.odds.toFixed(2)}</TD>
                <TD mono={false}>
                  <Badge tone={row.status} dot={row.status === "open"} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section
        id="odds"
        title="Odds button"
        description="Label left, price right in mono. Up flashes win for 600 ms, down flashes loss."
      >
        <div className="grid gap-2 md:grid-cols-2">
          <OddsButton
            label="Ada to win"
            odds={odds}
            state={selected === "ada" ? "selected" : "default"}
            onSelect={() => setSelected("ada")}
          />
          <OddsButton
            label="Club Bot to win"
            odds={Number((odds + 1.2).toFixed(2))}
            state={selected === "bot" ? "selected" : "default"}
            onSelect={() => setSelected("bot")}
          />
          <OddsButton label="Draw" odds={4.5} state="suspended" />
          <OddsButton label="Board 3 winner" odds={1.95} state="disabled" />
        </div>
        <Row label="move the price">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOdds((current) => Number((current + 0.12).toFixed(2)))}
          >
            Price up
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOdds((current) => Number((current - 0.12).toFixed(2)))}
          >
            Price down
          </Button>
          <span className="num text-small text-ink-faint">now {odds.toFixed(2)}</span>
        </Row>
      </Section>

      <Section
        id="overlays"
        title="Sheet, dialog, toast"
        description="Sheet is a bottom sheet at 360 and a side panel from 768."
      >
        <Row label="open">
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.show({ title: "Bet placed", description: "10.00 at 3.64", tone: "win" })
            }
          >
            Show toast
          </Button>
        </Row>
      </Section>

      <Section id="feedback" title="Loading and empty states">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Skeleton />
            <Skeleton lines={3} />
          </div>
          <div className="flex items-center gap-4">
            <Spinner />
            <Spinner size="md" />
            <span className="text-small text-ink-muted">Loading label next to a spinner</span>
          </div>
        </div>
        <EmptyState
          message="No markets are open for this match."
          action={
            <Button size="sm" variant="secondary">
              Reload
            </Button>
          }
        />
      </Section>

      <Section
        id="identity"
        title="Icons and wordmark"
        description="Lucide at 16, stroke 1.5. Two custom game icons, both stroke-only."
      >
        <Row label="game icons">
          <span className="flex items-center gap-2 text-ink">
            <CarromIcon />
            <span className="text-small">Carrom</span>
          </span>
          <span className="flex items-center gap-2 text-ink">
            <LudoIcon />
            <span className="text-small">Ludo</span>
          </span>
          <span className="text-ink-muted">
            <CarromIcon size={32} />
          </span>
        </Row>
        <Row label="lucide">
          <Plus size={16} strokeWidth={1.5} aria-hidden />
          <Settings2 size={16} strokeWidth={1.5} aria-hidden />
          <Trash2 size={16} strokeWidth={1.5} aria-hidden />
          <Copy size={16} strokeWidth={1.5} aria-hidden />
        </Row>
        <Row label="tooltip">
          <Tooltip content="Odds are decimal and already include the margin.">
            <button
              type="button"
              className="tap-target h-control-md rounded-control border border-line px-2 text-small text-ink-muted hover:text-ink"
            >
              What is decimal odds?
            </button>
          </Tooltip>
        </Row>
        <Row label="wordmark">
          <Wordmark />
          <Wordmark height={24} />
        </Row>
      </Section>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Bet slip"
        description="Bottom sheet at 360, side panel from 768."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>
              Clear
            </Button>
            <Button variant="primary" onClick={() => setSheetOpen(false)}>
              Place bet
            </Button>
          </>
        }
      >
        <p className="text-small text-ink-muted">
          Sheet body. It scrolls on its own and keeps the footer in place.
        </p>
        <div className="mt-3">
          <StakeInput
            value={stake}
            onValueChange={setStake}
            min={100}
            max={5000000}
            config={GALLERY_MONEY}
          />
        </div>
      </Sheet>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Price moved"
        description="3.64 is now 3.71. The bet was not placed."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              Accept 3.71
            </Button>
          </>
        }
      >
        <p className="text-small text-ink-muted">
          Nothing is filled silently at a different price than the one on screen.
        </p>
      </Dialog>
    </div>
  );
}
