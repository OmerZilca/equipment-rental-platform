/**
 * First-time store creation for logged-in business owners without a store yet.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyStoreSetupView from "../components/MyStoreSetupView";
import { apiErrorMessage } from "../utils/myStoreUtils";
import {
  createStore,
  getCurrentUser,
  getMyStores,
  isLoggedIn,
} from "../../../services/api";

const MyStoreSetupContainer: React.FC = () => {
  const navigate = useNavigate();
  const [gate, setGate] = useState<"loading" | "forbidden" | "ready">(
    "loading"
  );

  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const redirectIfHasStore = useCallback(async () => {
    const storesRes = await getMyStores();
    if ((storesRes.items[0] ?? null) !== null) {
      navigate("/my-store", { replace: true });
      return true;
    }
    return false;
  }, [navigate]);

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
          setGate("forbidden");
          return;
        }
        if (await redirectIfHasStore()) return;
        if (!cancelled) setGate("ready");
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, redirectIfHasStore]);

  const handleCreateStore = async () => {
    setCreateError("");
    const name = storeName.trim();
    if (!name) {
      setCreateError("Please enter a store name.");
      return;
    }
    setCreateLoading(true);
    try {
      await createStore({
        storeName: name,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        openingHours: openingHours.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
      });
      navigate("/my-store", { replace: true });
    } catch (e: unknown) {
      setCreateError(
        apiErrorMessage(
          e,
          "Could not create a store. You may already have a store on this account."
        )
      );
    } finally {
      setCreateLoading(false);
    }
  };

  if (gate === "loading") {
    return (
      <div className="py-20 text-center text-sm font-medium text-slate-500">
        Loading…
      </div>
    );
  }

  if (gate === "forbidden") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-slate-900">Open your store</h1>
          <p className="mt-2 text-sm text-slate-600">
            This page is only available to registered business owners.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MyStoreSetupView
      storeName={storeName}
      setStoreName={setStoreName}
      logoUrl={logoUrl}
      setLogoUrl={setLogoUrl}
      description={description}
      setDescription={setDescription}
      address={address}
      setAddress={setAddress}
      openingHours={openingHours}
      setOpeningHours={setOpeningHours}
      onCreateStore={handleCreateStore}
      createLoading={createLoading}
      createError={createError}
    />
  );
};

export default MyStoreSetupContainer;
