import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StakeInput } from "./stake-input";

const baseProps = {
  min: 100, // 1.00
  max: 500000, // 5,000.00
  config: { currency: "XTS", moneyMode: "virtual" } as const,
  quickAmounts: [10000, 50000] as const,
};

/** A controlled host, the way a bet slip will use it. */
function Controlled(props: { onChange?: (value: number | null) => void }) {
  const [value, setValue] = useState<number | null>(null);
  return (
    <StakeInput
      {...baseProps}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe("StakeInput", () => {
  it("fills the field from a quick amount, in minor units", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Controlled onChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "100.00" }));
    expect(onValueChange).toHaveBeenLastCalledWith(10000);
    expect(screen.getByLabelText("Stake")).toHaveValue("100");
    expect(screen.getByRole("button", { name: "100.00" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "500.00" }));
    expect(onValueChange).toHaveBeenLastCalledWith(50000);
    expect(screen.getByLabelText("Stake")).toHaveValue("500");
    expect(screen.getByRole("button", { name: "100.00" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "500.00" })).toHaveAttribute("aria-pressed", "true");
  });

  it("rejects a stake under the minimum and clamps it on blur", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<StakeInput {...baseProps} value={null} onValueChange={onValueChange} />);

    const field = screen.getByLabelText("Stake");
    await user.type(field, "0.5");

    expect(screen.getByText("Minimum stake is 1.00 XTS")).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");

    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    expect(field).toHaveValue("1");
  });

  it("rejects a stake over the maximum and clamps it on blur", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<StakeInput {...baseProps} value={null} onValueChange={onValueChange} />);

    const field = screen.getByLabelText("Stake");
    await user.type(field, "9000");

    expect(screen.getByText("Maximum stake is 5,000.00 XTS")).toBeInTheDocument();

    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(500000);
    expect(field).toHaveValue("5000");
  });

  it("drops non-numeric characters as they are typed", async () => {
    const user = userEvent.setup();
    render(<StakeInput {...baseProps} value={null} onValueChange={() => undefined} />);

    const field = screen.getByLabelText("Stake");
    await user.type(field, "12a3.4x5");
    expect(field).toHaveValue("123.45");
  });

  it("does not accept input when disabled", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<StakeInput {...baseProps} value={10000} onValueChange={onValueChange} disabled />);

    expect(screen.getByLabelText("Stake")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "500.00" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
