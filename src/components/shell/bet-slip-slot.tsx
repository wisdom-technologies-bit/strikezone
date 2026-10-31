/**
 * The collapsed bet slip handle sits here, above the tab bar. The slot exists so
 * the layout and the scroll padding are already correct when the slip lands.
 */
export function BetSlipSlot() {
  return (
    <div
      className="sz-betslip flex items-center justify-center"
      data-slot="betslip"
      aria-hidden="true"
    >
      <div className="h-px w-8 rounded-full bg-line-strong" />
    </div>
  );
}
