import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "./sign-up-form";

const replace = vi.fn();
const showToast = vi.fn();
const signUp = vi.fn();
const readProfile = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ show: showToast }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  getSupabaseBrowserClient: () => ({ auth: { signUp, resend: vi.fn() } }),
}));

vi.mock("@/lib/auth/profile", () => ({
  readOwnProfileWithRetry: (...args: unknown[]) => readProfile(...args) as unknown,
}));

const USER_ID = "33333333-3333-4333-8333-333333333333";

async function fillAndSubmit(): Promise<void> {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Username"), "ada_7");
  await user.type(screen.getByLabelText("Password"), "letters123");
  await user.click(screen.getByLabelText(/I am 18 or older/));
  await user.click(screen.getByRole("button", { name: "Create account" }));
}

describe("sign up", () => {
  beforeEach(() => {
    replace.mockClear();
    showToast.mockClear();
    signUp.mockReset();
    readProfile.mockReset();
  });

  it("sends the username and the age confirmation with the sign-up", async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null });

    render(<SignUpForm />);
    await fillAndSubmit();

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledTimes(1);
    });
    const call = signUp.mock.calls[0]?.[0] as {
      email: string;
      password: string;
      options: { data: { username: string; age_confirmed_at: string }; emailRedirectTo: string };
    };
    expect(call.email).toBe("ada@example.com");
    expect(call.options.data.username).toBe("ada_7");
    expect(new Date(call.options.data.age_confirmed_at).toString()).not.toBe("Invalid Date");
    expect(call.options.emailRedirectTo).toContain("/auth/callback?next=/");
  });

  it("waits on the email screen when no session comes back", async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null });

    render(<SignUpForm />);
    await fillAndSubmit();

    expect(await screen.findByText("Check your email")).toBeDefined();
    expect(screen.getByRole("button", { name: "Resend the email" })).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });

  it("tells the player the username the trigger gave them", async () => {
    signUp.mockResolvedValue({
      data: { session: { user: { id: USER_ID } } },
      error: null,
    });
    readProfile.mockResolvedValue({ username: "ada_7" });

    render(<SignUpForm />);
    await fillAndSubmit();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringContaining("ada_7") }),
      );
    });
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("says the account is still being set up when the row is not there yet", async () => {
    signUp.mockResolvedValue({
      data: { session: { user: { id: USER_ID } } },
      error: null,
    });
    readProfile.mockResolvedValue(null);

    render(<SignUpForm />);
    await fillAndSubmit();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Setting up your account, refresh in a moment" }),
      );
    });
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("refuses a short password before it asks the server", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Username"), "ada_7");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByLabelText(/I am 18 or older/));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Use at least 8 characters.")).toBeDefined();
    expect(signUp).not.toHaveBeenCalled();
  });
});
