import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelfExclusionPanel, isExclusionRunning } from "./self-exclusion-panel";

const selfExcludeCall = vi.fn();

vi.mock("@/lib/api/endpoints", () => ({
  SELF_EXCLUSION_HOURS: [24, 168, 720, 2160, 8760],
  selfExclude: (hours: number) => selfExcludeCall(hours) as unknown,
}));

describe("isExclusionRunning", () => {
  it("is true only for a future end", () => {
    const now = new Date("2026-10-31T12:00:00.000Z");
    expect(isExclusionRunning("2026-11-01T12:00:00.000Z", now)).toBe(true);
    expect(isExclusionRunning("2026-10-01T12:00:00.000Z", now)).toBe(false);
    expect(isExclusionRunning(null, now)).toBe(false);
    expect(isExclusionRunning("not a date", now)).toBe(false);
  });
});

describe("self exclusion", () => {
  beforeEach(() => {
    selfExcludeCall.mockReset();
  });

  it("asks for confirmation in plain words before calling the server", async () => {
    selfExcludeCall.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<SelfExclusionPanel excludedUntil={null} />);

    await user.click(screen.getByRole("button", { name: "7 days" }));

    expect(
      await screen.findByText(
        "You will not be able to place bets or deposit until then. This cannot be undone.",
      ),
    ).toBeDefined();
    expect(selfExcludeCall).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Self-exclude" }));

    expect(selfExcludeCall).toHaveBeenCalledWith(168);
  });

  it("sends the hours each duration means", async () => {
    selfExcludeCall.mockResolvedValue({ ok: true });
    const user = userEvent.setup();

    for (const [label, hours] of [
      ["24 hours", 24],
      ["30 days", 720],
      ["90 days", 2160],
      ["1 year", 8760],
    ] as const) {
      selfExcludeCall.mockClear();
      const view = render(<SelfExclusionPanel excludedUntil={null} />);
      await user.click(screen.getByRole("button", { name: label }));
      await user.click(await screen.findByRole("button", { name: "Self-exclude" }));
      expect(selfExcludeCall).toHaveBeenCalledWith(hours);
      view.unmount();
    }
  });

  it("states a running exclusion and offers no way to shorten it", () => {
    render(<SelfExclusionPanel excludedUntil="2099-01-01T09:00:00.000Z" />);

    expect(screen.getByText(/Self-excluded until/)).toBeDefined();
    expect(screen.getByText(/cannot be shortened/)).toBeDefined();
    expect(screen.queryByRole("button", { name: "24 hours" })).toBeNull();
  });

  it("says nothing changed when the server refuses", async () => {
    selfExcludeCall.mockRejectedValue(new Error("network"));
    const user = userEvent.setup();
    render(<SelfExclusionPanel excludedUntil={null} />);

    await user.click(screen.getByRole("button", { name: "24 hours" }));
    await user.click(await screen.findByRole("button", { name: "Self-exclude" }));

    expect(
      await screen.findByText("The exclusion was not saved. Nothing has changed. Try again."),
    ).toBeDefined();
  });
});
