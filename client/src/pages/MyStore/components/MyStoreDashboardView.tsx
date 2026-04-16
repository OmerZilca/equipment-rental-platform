/**
 * Owner UI: store profile editor, product table, and "add product" form.
 */
import React, { useMemo } from "react";
import type {
  BookingOut,
  FulfillmentStatus,
  ProductOut,
  StoreOut,
  StoreStatsOut,
} from "../../../services/api";
import { PRODUCT_CATEGORIES } from "../constants";

const field =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type DashboardTab = "catalog" | "orders" | "stats";

function formatReturnedAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Local calendar YYYY-MM-DD, comparable to API booking dates. */
function localDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function canConfirmPickupOnOrAfterStart(startDate: string): boolean {
  return localDateString() >= startDate;
}

function canEditDamageReport(b: BookingOut): boolean {
  return b.damageReportAllowed === true;
}

function damageReportButtonLabel(b: BookingOut): string {
  return b.damageNotes ? "Update report" : "Report damage";
}

type Props = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  storeBookings: BookingOut[];
  ordersLoading: boolean;
  ordersError: string;
  fulfillmentUpdatingId: number | null;
  onChangeFulfillment: (
    bookingId: number,
    status: FulfillmentStatus
  ) => void;
  damageModalBooking: BookingOut | null;
  damageNotesDraft: string;
  setDamageNotesDraft: (v: string) => void;
  damageModalSaving: boolean;
  damageModalError: string;
  onOpenDamageReport: (b: BookingOut) => void;
  onCloseDamageModal: () => void;
  onSubmitDamageReport: () => void;
  onClearDamageReport: () => void;
  statsYear: number;
  statsMonth: number;
  onStatsYearChange: (y: number) => void;
  onStatsMonthChange: (m: number) => void;
  stats: StoreStatsOut | null;
  statsLoading: boolean;
  statsError: string;
  store: StoreOut;
  storeEditing: boolean;
  onStartEditStore: () => void;
  onCancelEditStore: () => void;
  onSaveStoreDetails: () => void;
  editStoreName: string;
  setEditStoreName: (v: string) => void;
  editLogoUrl: string;
  setEditLogoUrl: (v: string) => void;
  editStoreDescription: string;
  setEditStoreDescription: (v: string) => void;
  editAddress: string;
  setEditAddress: (v: string) => void;
  editOpeningHours: string;
  setEditOpeningHours: (v: string) => void;
  storeSaveLoading: boolean;
  storeSaveError: string;
  products: ProductOut[];
  newProductName: string;
  setNewProductName: (v: string) => void;
  newDescription: string;
  setNewDescription: (v: string) => void;
  newCategory: string;
  setNewCategory: (v: string) => void;
  newPricePerDay: string;
  setNewPricePerDay: (v: string) => void;
  newDeposit: string;
  setNewDeposit: (v: string) => void;
  newQuantity: string;
  setNewQuantity: (v: string) => void;
  newImageUrl: string;
  setNewImageUrl: (v: string) => void;
  onAddProduct: () => void;
  addLoading: boolean;
  addError: string;
  addSuccess: string;
  newImageUploading: boolean;
  onNewImageFile: (file: File) => void;
  editing: ProductOut | null;
  onSelectEdit: (p: ProductOut | null) => void;
  editName: string;
  setEditName: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editCategory: string;
  setEditCategory: (v: string) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editDeposit: string;
  setEditDeposit: (v: string) => void;
  editQuantity: string;
  setEditQuantity: (v: string) => void;
  editImageUrl: string;
  setEditImageUrl: (v: string) => void;
  onSaveEdit: () => void;
  onDeleteProduct: () => void;
  editLoading: boolean;
  editError: string;
  editImageUploading: boolean;
  onEditImageFile: (file: File) => void;
};

const MyStoreDashboardView: React.FC<Props> = (props) => {
  const s = props.store;
  const todayCalendar = localDateString();

  const { awaitingPickup, outOnRental, completed, cancelled } = useMemo(() => {
    const all = props.storeBookings;
    const pending = all
      .filter(
        (b) =>
          b.fulfillmentStatus === "pending" &&
          b.status !== "cancelled" &&
          b.endDate >= todayCalendar
      )
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const picked = all
      .filter(
        (b) => b.fulfillmentStatus === "picked_up" && b.status !== "cancelled"
      )
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
    const noShow = all
      .filter((b) => b.fulfillmentStatus === "not_picked_up")
      .sort((a, b) => b.endDate.localeCompare(a.endDate));
    const returnedOnly = all
      .filter((b) => b.fulfillmentStatus === "returned")
      .sort((a, b) => {
        const ra = a.returnedAt ?? "";
        const rb = b.returnedAt ?? "";
        return rb.localeCompare(ra);
      });
    const done = [...noShow, ...returnedOnly];
    const canc = all.filter((b) => b.status === "cancelled");
    return {
      awaitingPickup: pending,
      outOnRental: picked,
      completed: done,
      cancelled: canc,
    };
  }, [props.storeBookings, todayCalendar]);

  const tabBtn = (id: DashboardTab, label: string) => (
    <button
      key={id}
      type="button"
      className={
        props.activeTab === id
          ? "rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
          : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
      }
      onClick={() => props.onTabChange(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900">
        My store
      </h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabBtn("catalog", "Store & products")}
        {tabBtn("orders", "Orders")}
        {tabBtn("stats", "Statistics")}
      </div>

      {props.activeTab === "orders" ? (
        <section className="mb-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="mb-1 text-lg font-bold text-slate-900">Orders</h2>
            <p className="text-sm text-slate-600">
              Rows move between queues: expected pickup → out on rental →
              completed. If the rental end date passes and pickup was never
              confirmed, the order moves to Completed as{" "}
              <span className="font-semibold">not picked up</span>{" "}
              automatically. Revenue is counted only after you mark{" "}
              <span className="font-semibold">returned</span>. Use{" "}
              <span className="font-semibold">Report damage</span> only within
              24 hours after <span className="font-semibold">return</span>, and
              only if no other customer has picked up the same product since
              then.
            </p>
          </div>

          {props.ordersLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : props.storeBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <>
              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Awaiting pickup
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  Sorted by expected pickup (start date). You can confirm pickup
                  only on that date or later—not before the rental starts.
                </p>
                {awaitingPickup.length === 0 ? (
                  <p className="text-sm text-slate-500">No orders in this queue.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Customer
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Product
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Expected pickup
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Return due
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {awaitingPickup.map((b) => {
                          const productName =
                            props.products.find((p) => p.id === b.equipmentId)
                              ?.productName ?? `#${b.equipmentId}`;
                          const busy = props.fulfillmentUpdatingId === b.id;
                          const pickupAllowed = canConfirmPickupOnOrAfterStart(
                            b.startDate
                          );
                          return (
                            <tr
                              key={b.id}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {b.customerName ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-700">
                                {productName}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {b.startDate}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {b.endDate}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col items-start gap-1">
                                  <button
                                    type="button"
                                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                                    disabled={busy || !pickupAllowed}
                                    title={
                                      pickupAllowed
                                        ? "Confirm customer picked up the gear"
                                        : `Pickup can be confirmed from ${b.startDate}`
                                    }
                                    onClick={() =>
                                      props.onChangeFulfillment(
                                        b.id,
                                        "picked_up"
                                      )
                                    }
                                  >
                                    {busy ? "…" : "Mark picked up"}
                                  </button>
                                  {!pickupAllowed && !busy ? (
                                    <span className="max-w-[10rem] text-[10px] leading-tight text-slate-500">
                                      Opens {b.startDate}
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Out on rental
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  Sorted by return due date. Mark when equipment is back in store.
                  If the return date has passed, the button turns{" "}
                  <span className="font-semibold text-rose-700">red</span> so
                  overdue returns stand out.
                </p>
                {outOnRental.length === 0 ? (
                  <p className="text-sm text-slate-500">No orders in this queue.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-amber-100 bg-amber-50/30">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-amber-200/80 text-left">
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Customer
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Product
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Picked up from
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Return due
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {outOnRental.map((b) => {
                          const productName =
                            props.products.find((p) => p.id === b.equipmentId)
                              ?.productName ?? `#${b.equipmentId}`;
                          const busy = props.fulfillmentUpdatingId === b.id;
                          const returnOverdue = b.endDate < todayCalendar;
                          return (
                            <tr
                              key={b.id}
                              className="border-b border-amber-100 last:border-0"
                            >
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {b.customerName ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-700">
                                {productName}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {b.startDate}
                              </td>
                              <td
                                className={
                                  returnOverdue
                                    ? "px-3 py-2 font-bold text-rose-700"
                                    : "px-3 py-2 font-medium text-slate-800"
                                }
                              >
                                {b.endDate}
                                {returnOverdue ? (
                                  <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                                    Overdue
                                  </span>
                                ) : null}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  className={
                                    returnOverdue
                                      ? "rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                                      : "rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                  }
                                  disabled={busy}
                                  title={
                                    returnOverdue
                                      ? "Return date passed — equipment not yet marked returned"
                                      : "Mark equipment returned to the store"
                                  }
                                  onClick={() =>
                                    props.onChangeFulfillment(b.id, "returned")
                                  }
                                >
                                  {busy ? "…" : "Mark returned"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900">
                  Completed
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  Includes successful returns and auto-closed no-shows (rental
                  ended without pickup). Read-only.
                </p>
                {completed.length === 0 ? (
                  <p className="text-sm text-slate-500">No completed orders yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/40">
                    <table className="w-full min-w-[820px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Customer
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Product
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Rental period
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Outcome
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Returned at
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Booking
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Damage
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {completed.map((b) => {
                          const productName =
                            props.products.find((p) => p.id === b.equipmentId)
                              ?.productName ?? `#${b.equipmentId}`;
                          const isNoShow =
                            b.fulfillmentStatus === "not_picked_up";
                          return (
                            <tr
                              key={b.id}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {b.customerName ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-700">
                                {productName}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {b.startDate} → {b.endDate}
                              </td>
                              <td className="px-3 py-2">
                                {isNoShow ? (
                                  <span className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                    Not picked up
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                                    Returned
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {isNoShow ? "—" : formatReturnedAt(b.returnedAt)}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {b.status}
                              </td>
                              <td className="px-3 py-2">
                                {canEditDamageReport(b) ? (
                                  <div className="flex max-w-[9rem] flex-col gap-1">
                                    {b.damageNotes ? (
                                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                                        Reported
                                      </span>
                                    ) : null}
                                    <button
                                      type="button"
                                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-left text-[11px] font-bold text-slate-800 hover:border-brand-300 hover:bg-brand-50"
                                      onClick={() => props.onOpenDamageReport(b)}
                                    >
                                      {damageReportButtonLabel(b)}
                                    </button>
                                  </div>
                                ) : b.damageNotes ? (
                                  <div className="max-w-[10rem]">
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                      On file
                                    </span>
                                    <p className="line-clamp-2 text-[11px] text-slate-600">
                                      {b.damageNotes}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {cancelled.length > 0 ? (
                <div>
                  <h3 className="mb-1 text-base font-bold text-slate-900">
                    Cancelled
                  </h3>
                  <p className="mb-3 text-xs text-slate-500">
                    These bookings were cancelled; no fulfillment actions.
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Customer
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Product
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Dates
                          </th>
                          <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500">
                            Fulfillment
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancelled.map((b) => {
                          const productName =
                            props.products.find((p) => p.id === b.equipmentId)
                              ?.productName ?? `#${b.equipmentId}`;
                          return (
                            <tr
                              key={b.id}
                              className="border-b border-slate-100 last:border-0 opacity-80"
                            >
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {b.customerName ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-700">
                                {productName}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {b.startDate} → {b.endDate}
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {b.fulfillmentStatus}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}
          {props.ordersError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {props.ordersError}
            </p>
          ) : null}

          {props.damageModalBooking ? (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="damage-modal-title"
              onClick={() => props.onCloseDamageModal()}
            >
              <div
                className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3
                  id="damage-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Customer damage report
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Booking #{props.damageModalBooking.id} ·{" "}
                  {props.damageModalBooking.customerName ?? "Customer"}
                </p>
                {props.damageModalBooking.damageReportAllowed !== true ? (
                  <p className="mt-2 text-xs text-amber-800">
                    Filing window closed: more than 24 hours after return, or
                    another customer already picked up this product.
                  </p>
                ) : null}
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Describe damage
                  </span>
                  <textarea
                    className={field}
                    rows={5}
                    value={props.damageNotesDraft}
                    onChange={(e) => props.setDamageNotesDraft(e.target.value)}
                    disabled={
                      props.damageModalSaving ||
                      props.damageModalBooking.damageReportAllowed !== true
                    }
                    placeholder="What was damaged and how it occurred…"
                  />
                </label>
                {props.damageModalError ? (
                  <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    {props.damageModalError}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                    disabled={
                      props.damageModalSaving ||
                      props.damageModalBooking.damageReportAllowed !== true
                    }
                    onClick={() => props.onSubmitDamageReport()}
                  >
                    {props.damageModalSaving ? "Saving…" : "Save report"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    disabled={props.damageModalSaving}
                    onClick={() => props.onCloseDamageModal()}
                  >
                    Cancel
                  </button>
                  {props.damageModalBooking.damageNotes ? (
                    <button
                      type="button"
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                      disabled={props.damageModalSaving}
                      onClick={() => props.onClearDamageReport()}
                    >
                      Remove report
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {props.activeTab === "stats" ? (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-slate-900">Statistics</h2>
          <p className="mb-4 text-sm text-slate-600">
            Revenue includes only bookings marked <strong>returned</strong> in
            the selected month (by return date).
          </p>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase text-slate-500">
              Year
              <input
                type="number"
                className={field + " w-28"}
                min={2000}
                max={2100}
                value={props.statsYear}
                onChange={(e) =>
                  props.onStatsYearChange(Number(e.target.value) || 2000)
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase text-slate-500">
              Month
              <select
                className={field + " w-40"}
                value={props.statsMonth}
                onChange={(e) =>
                  props.onStatsMonthChange(Number(e.target.value))
                }
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {props.statsLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : props.stats ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Revenue (returned)
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {props.stats.revenue.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Returned bookings
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {props.stats.returnedBookingsCount}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                  Top products (units)
                </p>
                {props.stats.topProducts.length === 0 ? (
                  <p className="text-sm text-slate-500">No data this month.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                    {props.stats.topProducts.map((row) => (
                      <li
                        key={row.productId}
                        className="flex justify-between px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-slate-900">
                          {row.productName}
                        </span>
                        <span className="text-slate-600">{row.unitsRented}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
          {props.statsError ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {props.statsError}
            </p>
          ) : null}
        </section>
      ) : null}

      {props.activeTab === "catalog" ? (
        <>
      {!props.storeEditing ? (
        <section className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt=""
              className="h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 object-contain"
            />
          ) : null}
          <div className="min-w-[200px] flex-1">
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              {s.storeName}
            </h2>
            {s.description ? (
              <p className="text-sm text-slate-600">{s.description}</p>
            ) : null}
            {s.address ? (
              <p className="text-sm text-slate-600">📍 {s.address}</p>
            ) : null}
            {s.openingHours ? (
              <p className="text-sm text-slate-600">🕐 {s.openingHours}</p>
            ) : null}
            <button
              type="button"
              className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
              onClick={props.onStartEditStore}
            >
              Edit store details
            </button>
          </div>
        </section>
      ) : (
        <section className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/40 p-5 shadow-sm ring-1 ring-brand-500/10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Edit store details
          </h2>
          <div className="flex max-w-lg flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Store name (required)
              </span>
              <input
                className={field}
                value={props.editStoreName}
                onChange={(e) => props.setEditStoreName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Logo image URL (optional)
              </span>
              <input
                className={field}
                value={props.editLogoUrl}
                onChange={(e) => props.setEditLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Description
              </span>
              <textarea
                className={field}
                value={props.editStoreDescription}
                onChange={(e) => props.setEditStoreDescription(e.target.value)}
                rows={3}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Address
              </span>
              <input
                className={field}
                value={props.editAddress}
                onChange={(e) => props.setEditAddress(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Opening hours
              </span>
              <input
                className={field}
                value={props.editOpeningHours}
                onChange={(e) => props.setEditOpeningHours(e.target.value)}
                placeholder="09:00 - 18:00"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
              onClick={props.onSaveStoreDetails}
              disabled={props.storeSaveLoading}
            >
              {props.storeSaveLoading ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={props.onCancelEditStore}
              disabled={props.storeSaveLoading}
            >
              Cancel
            </button>
          </div>
          {props.storeSaveError ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {props.storeSaveError}
            </p>
          ) : null}
        </section>
      )}

      <h3 className="mb-3 text-lg font-bold text-slate-900">Products</h3>
      <div className="mb-6">
        {props.products.length === 0 ? (
          <p className="text-sm text-slate-500">No products yet. Add one below.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[540px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Price / day
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Stock
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {props.products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{p.pricePerDay}</td>
                    <td className="px-4 py-3 text-slate-600">{p.totalQuantity}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50"
                        onClick={() => props.onSelectEdit(p)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {props.editing ? (
        <section className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/40 p-5 shadow-sm ring-1 ring-brand-500/10">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            Edit product #{props.editing.id}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">Name</span>
              <input
                className={field}
                value={props.editName}
                onChange={(e) => props.setEditName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Category
              </span>
              <select
                className={field}
                value={props.editCategory}
                onChange={(e) => props.setEditCategory(e.target.value)}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Description
              </span>
              <textarea
                className={field}
                value={props.editDescription}
                onChange={(e) => props.setEditDescription(e.target.value)}
                rows={2}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Price per day
              </span>
              <input
                className={field}
                type="number"
                min={0}
                step="0.01"
                value={props.editPrice}
                onChange={(e) => props.setEditPrice(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">Deposit</span>
              <input
                className={field}
                type="number"
                min={0}
                step="0.01"
                value={props.editDeposit}
                onChange={(e) => props.setEditDeposit(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Stock quantity
              </span>
              <input
                className={field}
                type="number"
                min={0}
                step={1}
                value={props.editQuantity}
                onChange={(e) => props.setEditQuantity(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-slate-500">Image URL</span>
              <input
                className={field}
                value={props.editImageUrl}
                onChange={(e) => props.setEditImageUrl(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Or upload an image (JPEG, PNG, WebP, GIF, max 5 MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={props.editLoading || props.editImageUploading}
                className="text-xs text-slate-600"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) props.onEditImageFile(f);
                  e.target.value = "";
                }}
              />
              {props.editImageUploading ? (
                <span className="text-xs text-slate-500">Uploading…</span>
              ) : null}
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              onClick={props.onSaveEdit}
              disabled={props.editLoading || props.editImageUploading}
            >
              {props.editLoading ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              onClick={props.onDeleteProduct}
              disabled={props.editLoading}
            >
              Delete product
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              onClick={() => props.onSelectEdit(null)}
            >
              Cancel
            </button>
          </div>
          {props.editError ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {props.editError}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Add product</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">
              Product name
            </span>
            <input
              className={field}
              value={props.newProductName}
              onChange={(e) => props.setNewProductName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Category</span>
            <select
              className={field}
              value={props.newCategory}
              onChange={(e) => props.setNewCategory(e.target.value)}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-slate-500">
              Description
            </span>
            <textarea
              className={field}
              value={props.newDescription}
              onChange={(e) => props.setNewDescription(e.target.value)}
              rows={2}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">
              Price per day
            </span>
            <input
              className={field}
              type="number"
              min={0}
              step="0.01"
              value={props.newPricePerDay}
              onChange={(e) => props.setNewPricePerDay(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Deposit</span>
            <input
              className={field}
              type="number"
              min={0}
              step="0.01"
              value={props.newDeposit}
              onChange={(e) => props.setNewDeposit(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">
              Stock quantity
            </span>
            <input
              className={field}
              type="number"
              min={1}
              step={1}
              value={props.newQuantity}
              onChange={(e) => props.setNewQuantity(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Image URL</span>
            <input
              className={field}
              value={props.newImageUrl}
              onChange={(e) => props.setNewImageUrl(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-slate-500">
              Or upload an image (JPEG, PNG, WebP, GIF, max 5 MB)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={props.addLoading || props.newImageUploading}
              className="text-xs text-slate-600"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) props.onNewImageFile(f);
                e.target.value = "";
              }}
            />
            {props.newImageUploading ? (
              <span className="text-xs text-slate-500">Uploading…</span>
            ) : null}
          </label>
        </div>
        <button
          type="button"
          className="mt-4 h-11 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          onClick={props.onAddProduct}
          disabled={props.addLoading || props.newImageUploading}
        >
          {props.addLoading ? "Saving…" : "Add product"}
        </button>
        {props.addError ? (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {props.addError}
          </p>
        ) : null}
        {props.addSuccess ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {props.addSuccess}
          </p>
        ) : null}
      </section>
        </>
      ) : null}
    </div>
  );
};

export default MyStoreDashboardView;
