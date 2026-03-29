/** Unit tests for MyBookingsView lists and cancel behavior. */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyBookingsView from "./MyBookingsView";

const futureBooking = {
  id: 42,
  equipmentId: 7,
  quantity: 1,
  startDate: "2099-01-10",
  endDate: "2099-01-12",
  status: "confirmed",
};

describe("MyBookingsView", () => {
  it("renders future booking and cancel triggers onCancel", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <MyBookingsView
        current={[]}
        future={[futureBooking]}
        history={[]}
        onCancel={onCancel}
        cancellingId={null}
        successMessage=""
      />
    );

    expect(screen.getByText(/future bookings/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cancel booking/i }));
    expect(onCancel).toHaveBeenCalledWith(42);
  });

  it("shows success message when provided", () => {
    render(
      <MyBookingsView
        current={[]}
        future={[]}
        history={[]}
        onCancel={vi.fn()}
        cancellingId={null}
        successMessage="Booking #42 cancelled."
      />
    );
    expect(screen.getByText(/booking #42 cancelled/i)).toBeInTheDocument();
  });
});
