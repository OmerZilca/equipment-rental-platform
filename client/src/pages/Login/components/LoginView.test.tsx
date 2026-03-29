/** Unit tests for LoginView (submit and validation wiring). */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginView from "./LoginView";

describe("LoginView", () => {
  it("calls onSubmit when Login is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const setEmail = vi.fn();
    const setPassword = vi.fn();

    render(
      <LoginView
        email=""
        setEmail={setEmail}
        password=""
        setPassword={setPassword}
        onSubmit={onSubmit}
        loading={false}
        error=""
      />
    );

    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows error message when error prop is set", () => {
    render(
      <LoginView
        email=""
        setEmail={vi.fn()}
        password=""
        setPassword={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error="Bad credentials"
      />
    );
    expect(screen.getByText("Bad credentials")).toBeInTheDocument();
  });

  it("disables button while loading", () => {
    render(
      <LoginView
        email=""
        setEmail={vi.fn()}
        password=""
        setPassword={vi.fn()}
        onSubmit={vi.fn()}
        loading={true}
        error=""
      />
    );
    expect(
      screen.getByRole("button", { name: /logging in/i })
    ).toBeDisabled();
  });
});
