/**
 * Owner dashboard: edit store, list/add/edit/delete products, image upload.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyStoreDashboardView from "../components/MyStoreDashboardView";
import { apiErrorMessage, normalizeCategory } from "../utils/myStoreUtils";
import {
  createProduct,
  deleteProduct,
  getCurrentUser,
  getMyProducts,
  getMyStores,
  getMyStoreBookings,
  getMyStoreStats,
  isLoggedIn,
  type BookingOut,
  type FulfillmentStatus,
  type ProductOut,
  type StoreOut,
  type StoreStatsOut,
  updateBookingFulfillment,
  reportBookingDamage,
  clearBookingDamageReport,
  updateMyStore,
  updateProduct,
  uploadProductImage,
} from "../../../services/api";

const MyStoreDashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<
    "loading" | "forbidden" | "no-store" | "has-store"
  >("loading");
  const [store, setStore] = useState<StoreOut | null>(null);
  const [products, setProducts] = useState<ProductOut[]>([]);

  const [storeEditing, setStoreEditing] = useState(false);
  const [editStoreName, setEditStoreName] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editStoreDescription, setEditStoreDescription] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editOpeningHours, setEditOpeningHours] = useState("");
  const [storeSaveLoading, setStoreSaveLoading] = useState(false);
  const [storeSaveError, setStoreSaveError] = useState("");

  const [newProductName, setNewProductName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newPricePerDay, setNewPricePerDay] = useState("");
  const [newDeposit, setNewDeposit] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [newImageUploading, setNewImageUploading] = useState(false);

  const [editing, setEditing] = useState<ProductOut | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editPrice, setEditPrice] = useState("");
  const [editDeposit, setEditDeposit] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editImageUploading, setEditImageUploading] = useState(false);

  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "stats">(
    "catalog"
  );
  const [storeBookings, setStoreBookings] = useState<BookingOut[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [fulfillmentUpdatingId, setFulfillmentUpdatingId] = useState<
    number | null
  >(null);

  const [damageModalBooking, setDamageModalBooking] =
    useState<BookingOut | null>(null);
  const [damageNotesDraft, setDamageNotesDraft] = useState("");
  const [damageModalSaving, setDamageModalSaving] = useState(false);
  const [damageModalError, setDamageModalError] = useState("");

  const [statsYear, setStatsYear] = useState(() => new Date().getFullYear());
  const [statsMonth, setStatsMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [stats, setStats] = useState<StoreStatsOut | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const loadProducts = useCallback(async () => {
    const data = await getMyProducts();
    setProducts(data.items);
  }, []);

  const syncStoreFormFromStore = useCallback((s: StoreOut) => {
    setEditStoreName(s.storeName);
    setEditLogoUrl(s.logoUrl ?? "");
    setEditStoreDescription(s.description ?? "");
    setEditAddress(s.address ?? "");
    setEditOpeningHours(s.openingHours ?? "");
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await getMyStoreBookings();
      setStoreBookings(data.items);
    } catch (e: unknown) {
      setOrdersError(apiErrorMessage(e, "Could not load orders."));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const data = await getMyStoreStats({
        year: statsYear,
        month: statsMonth,
      });
      setStats(data);
    } catch (e: unknown) {
      setStatsError(apiErrorMessage(e, "Could not load statistics."));
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [statsYear, statsMonth]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    void loadOrders();
  }, [activeTab, loadOrders]);

  useEffect(() => {
    if (activeTab !== "stats") return;
    void loadStats();
  }, [activeTab, loadStats]);

  useEffect(() => {
    if (activeTab !== "orders") {
      setDamageModalBooking(null);
      setDamageNotesDraft("");
      setDamageModalError("");
    }
  }, [activeTab]);

  const bootstrap = useCallback(async () => {
    const storesRes = await getMyStores();
    const first = storesRes.items[0] ?? null;
    setStore(first);
    if (!first) {
      setMode("no-store");
      return;
    }
    setMode("has-store");
    syncStoreFormFromStore(first);
    await loadProducts();
  }, [loadProducts, syncStoreFormFromStore]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isLoggedIn()) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        localStorage.setItem("auth_role", me.role);
        window.dispatchEvent(new Event("auth:changed"));
        if (me.role === "customer") {
          navigate("/", { replace: true });
          return;
        }
        if (me.role !== "business_owner") {
          setMode("forbidden");
          return;
        }
        await bootstrap();
        if (cancelled) return;
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, bootstrap]);

  useEffect(() => {
    if (mode === "no-store") {
      navigate("/my-store/setup", { replace: true });
    }
  }, [mode, navigate]);

  const startEdit = (p: ProductOut | null) => {
    setEditError("");
    setEditing(p);
    if (!p) return;
    setEditName(p.productName);
    setEditDescription(p.description ?? "");
    setEditCategory(normalizeCategory(p.category));
    setEditPrice(String(p.pricePerDay));
    setEditDeposit(String(p.depositAmount));
    setEditQuantity(String(p.totalQuantity));
    setEditImageUrl(p.imageUrl ?? "");
  };

  const handleStartEditStore = () => {
    if (!store) return;
    setStoreSaveError("");
    syncStoreFormFromStore(store);
    setStoreEditing(true);
  };

  const handleCancelEditStore = () => {
    if (store) syncStoreFormFromStore(store);
    setStoreSaveError("");
    setStoreEditing(false);
  };

  const handleSaveStoreDetails = async () => {
    if (!store) return;
    setStoreSaveError("");
    const name = editStoreName.trim();
    if (!name) {
      setStoreSaveError("Please enter a store name.");
      return;
    }
    setStoreSaveLoading(true);
    try {
      const updated = await updateMyStore({
        storeName: name,
        description: editStoreDescription.trim() || undefined,
        address: editAddress.trim() || undefined,
        openingHours: editOpeningHours.trim() || undefined,
        logoUrl: editLogoUrl.trim() || undefined,
      });
      setStore(updated);
      syncStoreFormFromStore(updated);
      setStoreEditing(false);
    } catch (e: unknown) {
      setStoreSaveError(apiErrorMessage(e, "Could not save store details."));
    } finally {
      setStoreSaveLoading(false);
    }
  };

  const handleNewImageFile = async (file: File) => {
    setAddError("");
    setNewImageUploading(true);
    try {
      const { url } = await uploadProductImage(file);
      setNewImageUrl(url);
    } catch (e: unknown) {
      setAddError(
        apiErrorMessage(e, "Could not upload the image. Check type and size.")
      );
    } finally {
      setNewImageUploading(false);
    }
  };

  const handleEditImageFile = async (file: File) => {
    setEditError("");
    setEditImageUploading(true);
    try {
      const { url } = await uploadProductImage(file);
      setEditImageUrl(url);
    } catch (e: unknown) {
      setEditError(
        apiErrorMessage(e, "Could not upload the image. Check type and size.")
      );
    } finally {
      setEditImageUploading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!store) return;
    setAddError("");
    setAddSuccess("");
    const name = newProductName.trim();
    if (!name) {
      setAddError("Please enter a product name.");
      return;
    }
    const ppd = Number(newPricePerDay);
    const dep = Number(newDeposit);
    const qty = Number(newQuantity);
    if (!Number.isFinite(ppd) || ppd < 0) {
      setAddError("Invalid price per day.");
      return;
    }
    if (!Number.isFinite(dep) || dep < 0) {
      setAddError("Invalid deposit.");
      return;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      setAddError("Quantity must be a whole number of at least 1.");
      return;
    }

    setAddLoading(true);
    try {
      await createProduct({
        storeId: store.id,
        productName: name,
        description: newDescription.trim() || undefined,
        category: newCategory,
        pricePerDay: ppd,
        depositAmount: dep,
        totalQuantity: qty,
        imageUrl: newImageUrl.trim() || undefined,
      });
      setAddSuccess("Product added.");
      setNewProductName("");
      setNewDescription("");
      setNewCategory("general");
      setNewPricePerDay("");
      setNewDeposit("");
      setNewQuantity("1");
      setNewImageUrl("");
      await loadProducts();
    } catch (e: unknown) {
      setAddError(apiErrorMessage(e, "Could not add the product."));
    } finally {
      setAddLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setEditError("");
    const name = editName.trim();
    if (!name) {
      setEditError("Please enter a product name.");
      return;
    }
    const ppd = Number(editPrice);
    const dep = Number(editDeposit);
    const qty = Number(editQuantity);
    if (!Number.isFinite(ppd) || ppd < 0) {
      setEditError("Invalid price per day.");
      return;
    }
    if (!Number.isFinite(dep) || dep < 0) {
      setEditError("Invalid deposit.");
      return;
    }
    if (!Number.isInteger(qty) || qty < 0) {
      setEditError("Stock must be a non-negative whole number.");
      return;
    }

    setEditLoading(true);
    try {
      await updateProduct(editing.id, {
        productName: name,
        description: editDescription.trim() || undefined,
        category: editCategory,
        pricePerDay: ppd,
        depositAmount: dep,
        totalQuantity: qty,
        imageUrl: editImageUrl.trim() || undefined,
      });
      await loadProducts();
      setEditing(null);
    } catch (e: unknown) {
      setEditError(apiErrorMessage(e, "Could not save changes."));
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDamageReport = (b: BookingOut) => {
    setDamageModalError("");
    setDamageNotesDraft(b.damageNotes ?? "");
    setDamageModalBooking(b);
  };

  const handleCloseDamageModal = () => {
    setDamageModalBooking(null);
    setDamageNotesDraft("");
    setDamageModalError("");
  };

  const handleSubmitDamageReport = async () => {
    if (!damageModalBooking) return;
    const text = damageNotesDraft.trim();
    if (!text) {
      setDamageModalError("Please describe the damage.");
      return;
    }
    setDamageModalSaving(true);
    setDamageModalError("");
    try {
      await reportBookingDamage(damageModalBooking.id, text);
      await loadOrders();
      handleCloseDamageModal();
    } catch (e: unknown) {
      setDamageModalError(
        apiErrorMessage(e, "Could not save the damage report.")
      );
    } finally {
      setDamageModalSaving(false);
    }
  };

  const handleClearDamageReport = async () => {
    if (!damageModalBooking) return;
    if (
      !window.confirm(
        "Remove this damage report from the booking? You can file a new report later if needed."
      )
    ) {
      return;
    }
    setDamageModalSaving(true);
    setDamageModalError("");
    try {
      await clearBookingDamageReport(damageModalBooking.id);
      await loadOrders();
      handleCloseDamageModal();
    } catch (e: unknown) {
      setDamageModalError(
        apiErrorMessage(e, "Could not remove the damage report.")
      );
    } finally {
      setDamageModalSaving(false);
    }
  };

  const handleChangeFulfillment = async (
    bookingId: number,
    fulfillmentStatus: FulfillmentStatus
  ) => {
    setFulfillmentUpdatingId(bookingId);
    setOrdersError("");
    try {
      await updateBookingFulfillment(bookingId, fulfillmentStatus);
      await loadOrders();
    } catch (e: unknown) {
      setOrdersError(apiErrorMessage(e, "Could not update status."));
    } finally {
      setFulfillmentUpdatingId(null);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editing) return;
    if (
      !window.confirm(
        `Delete "${editing.productName}"? This is not allowed if the product appears on any booking.`
      )
    ) {
      return;
    }
    setEditError("");
    setEditLoading(true);
    try {
      await deleteProduct(editing.id);
      await loadProducts();
      setEditing(null);
    } catch (e: unknown) {
      setEditError(apiErrorMessage(e, "Could not delete the product."));
    } finally {
      setEditLoading(false);
    }
  };

  if (mode === "loading" || mode === "no-store") {
    return (
      <div className="py-20 text-center text-sm font-medium text-slate-500">
        Loading…
      </div>
    );
  }

  if (mode === "forbidden") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-slate-900">My store</h1>
          <p className="mt-2 text-sm text-slate-600">
            This page is only available to registered business owners.
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="py-20 text-center text-sm font-medium text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <MyStoreDashboardView
      activeTab={activeTab}
      onTabChange={setActiveTab}
      storeBookings={storeBookings}
      ordersLoading={ordersLoading}
      ordersError={ordersError}
      fulfillmentUpdatingId={fulfillmentUpdatingId}
      onChangeFulfillment={handleChangeFulfillment}
      damageModalBooking={damageModalBooking}
      damageNotesDraft={damageNotesDraft}
      setDamageNotesDraft={setDamageNotesDraft}
      damageModalSaving={damageModalSaving}
      damageModalError={damageModalError}
      onOpenDamageReport={handleOpenDamageReport}
      onCloseDamageModal={handleCloseDamageModal}
      onSubmitDamageReport={handleSubmitDamageReport}
      onClearDamageReport={handleClearDamageReport}
      statsYear={statsYear}
      statsMonth={statsMonth}
      onStatsYearChange={setStatsYear}
      onStatsMonthChange={setStatsMonth}
      stats={stats}
      statsLoading={statsLoading}
      statsError={statsError}
      store={store}
      storeEditing={storeEditing}
      onStartEditStore={handleStartEditStore}
      onCancelEditStore={handleCancelEditStore}
      onSaveStoreDetails={handleSaveStoreDetails}
      editStoreName={editStoreName}
      setEditStoreName={setEditStoreName}
      editLogoUrl={editLogoUrl}
      setEditLogoUrl={setEditLogoUrl}
      editStoreDescription={editStoreDescription}
      setEditStoreDescription={setEditStoreDescription}
      editAddress={editAddress}
      setEditAddress={setEditAddress}
      editOpeningHours={editOpeningHours}
      setEditOpeningHours={setEditOpeningHours}
      storeSaveLoading={storeSaveLoading}
      storeSaveError={storeSaveError}
      products={products}
      newProductName={newProductName}
      setNewProductName={setNewProductName}
      newDescription={newDescription}
      setNewDescription={setNewDescription}
      newCategory={newCategory}
      setNewCategory={setNewCategory}
      newPricePerDay={newPricePerDay}
      setNewPricePerDay={setNewPricePerDay}
      newDeposit={newDeposit}
      setNewDeposit={setNewDeposit}
      newQuantity={newQuantity}
      setNewQuantity={setNewQuantity}
      newImageUrl={newImageUrl}
      setNewImageUrl={setNewImageUrl}
      onAddProduct={handleAddProduct}
      addLoading={addLoading}
      addError={addError}
      addSuccess={addSuccess}
      newImageUploading={newImageUploading}
      onNewImageFile={handleNewImageFile}
      editing={editing}
      onSelectEdit={startEdit}
      editName={editName}
      setEditName={setEditName}
      editDescription={editDescription}
      setEditDescription={setEditDescription}
      editCategory={editCategory}
      setEditCategory={setEditCategory}
      editPrice={editPrice}
      setEditPrice={setEditPrice}
      editDeposit={editDeposit}
      setEditDeposit={setEditDeposit}
      editQuantity={editQuantity}
      setEditQuantity={setEditQuantity}
      editImageUrl={editImageUrl}
      setEditImageUrl={setEditImageUrl}
      onSaveEdit={handleSaveEdit}
      onDeleteProduct={handleDeleteProduct}
      editLoading={editLoading}
      editError={editError}
      editImageUploading={editImageUploading}
      onEditImageFile={handleEditImageFile}
    />
  );
};

export default MyStoreDashboardContainer;
