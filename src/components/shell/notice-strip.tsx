import { Badge } from "@/components/ui/badge";

export interface NoticeStripProps {
  moneyMode: "virtual" | "real";
}

/**
 * One honest line about what the coins are. It occupies its own row so it never
 * competes with the top bar for space at 360px.
 */
export function NoticeStrip({ moneyMode }: NoticeStripProps) {
  if (moneyMode !== "virtual") return null;

  return (
    <div className="flex h-notice-h items-center gap-2 border-t border-line bg-brass-tint px-3 text-small text-brass">
      <Badge tone="test-coins" dot={false}>
        test coins
      </Badge>
      {/* Short copy below 640, the full sentence above it. Never truncated. */}
      <p className="min-w-0 sm:hidden">Test coins: no real money</p>
      <p className="hidden min-w-0 sm:block">No real money. Stakes and payouts here are virtual.</p>
    </div>
  );
}
