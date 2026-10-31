import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OddsButton } from "./odds-button";

afterEach(() => {
  vi.useRealTimers();
});

describe("OddsButton", () => {
  it("reports selection state and price to assistive tech", () => {
    render(<OddsButton label="Ada to win" odds={3.64} state="selected" />);
    const button = screen.getByRole("button", { name: /Ada to win/ });

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-state", "selected");
    expect(screen.getByText("3.64")).toBeInTheDocument();
  });

  it("cannot be selected while suspended and says so", () => {
    const onSelect = vi.fn();
    render(<OddsButton label="Draw" odds={4.5} state="suspended" onSelect={onSelect} />);
    const button = screen.getByRole("button", { name: /Draw/ });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-state", "suspended");
    expect(screen.getByText("suspended")).toBeInTheDocument();

    act(() => {
      button.click();
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("flashes a win tint for 600ms when the price goes up", () => {
    vi.useFakeTimers();
    const { rerender } = render(<OddsButton label="Ada to win" odds={3.64} />);
    const button = screen.getByRole("button", { name: /Ada to win/ });

    expect(button).not.toHaveAttribute("data-flash");

    rerender(<OddsButton label="Ada to win" odds={3.76} />);
    expect(button).toHaveAttribute("data-flash", "up");
    expect(screen.getByText("Ada to win price moved up to 3.76")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(button).toHaveAttribute("data-flash", "up");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(button).not.toHaveAttribute("data-flash");
  });

  it("flashes a loss tint for 600ms when the price goes down", () => {
    vi.useFakeTimers();
    const { rerender } = render(<OddsButton label="Ada to win" odds={3.64} />);
    const button = screen.getByRole("button", { name: /Ada to win/ });

    rerender(<OddsButton label="Ada to win" odds={3.5} />);
    expect(button).toHaveAttribute("data-flash", "down");
    expect(screen.getByText("Ada to win price moved down to 3.50")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(button).not.toHaveAttribute("data-flash");
  });

  it("hands the price on screen to the caller", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<OddsButton label="Ada to win" odds={3.64} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /Ada to win/ }));
    expect(onSelect).toHaveBeenCalledWith(3.64);
  });
});
