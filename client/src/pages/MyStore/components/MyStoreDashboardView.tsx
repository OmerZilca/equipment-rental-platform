/**
 * Owner UI: store profile editor, product table, and "add product" form.
 */
import React from "react";
import type { ProductOut, StoreOut } from "../../../services/api";
import { PRODUCT_CATEGORIES } from "../constants";

const field =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type Props = {
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-900">
        My store
      </h1>

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
    </div>
  );
};

export default MyStoreDashboardView;
