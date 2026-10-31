import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoticeStrip } from "./notice-strip";

describe("NoticeStrip", () => {
  it("shows the short line below 640 and the full sentence above it", () => {
    render(<NoticeStrip moneyMode="virtual" />);

    const short = screen.getByText("Test coins: no real money");
    const full = screen.getByText("No real money. Stakes and payouts here are virtual.");

    // Same fact, swapped by width. Each copy is hidden at the other size.
    expect(short.className).toContain("sm:hidden");
    expect(full.className).toContain("hidden");
    expect(full.className).toContain("sm:block");
  });

  it("never truncates either copy", () => {
    const { container } = render(<NoticeStrip moneyMode="virtual" />);
    for (const paragraph of container.querySelectorAll("p")) {
      expect(paragraph.className).not.toContain("truncate");
      expect(paragraph.getAttribute("style") ?? "").not.toContain("ellipsis");
    }
  });

  it("says nothing in real-money mode", () => {
    const { container } = render(<NoticeStrip moneyMode="real" />);
    expect(container).toBeEmptyDOMElement();
  });
});
