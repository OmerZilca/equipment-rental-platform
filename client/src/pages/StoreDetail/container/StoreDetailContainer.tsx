/**
 * Public store page: store info plus that store's equipment (filtered from full list).
 */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import EquipmentGrid from "../../EquipmentList/components/EquipmentGrid";
import type { Equipment } from "../../../types";
import {
  getEquipmentList,
  getPublicStore,
  type StoreOut,
} from "../../../services/api";

const StoreDetailContainer: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const id = storeId ? Number.parseInt(storeId, 10) : NaN;

  const [store, setStore] = useState<StoreOut | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(id) || id < 1) {
      setError("Invalid store.");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const [storeData, equipData] = await Promise.all([
          getPublicStore(id),
          getEquipmentList(),
        ]);
        setStore(storeData);
        setEquipmentList(equipData.items);
      } catch {
        setError("Store not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [id]);

  const products = useMemo(
    () => equipmentList.filter((e) => e.storeId === id),
    [equipmentList, id]
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-16 text-center text-sm font-medium text-slate-500 md:px-6">
        Loading store…
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-brand-600"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to catalog
        </Link>
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error || "Store not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-brand-600"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to catalog
      </Link>

      <header className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
          Store
        </p>
        <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          {store.storeName}
        </h1>
        {store.description ? (
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-slate-600">
            {store.description}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 text-sm font-medium text-slate-600 sm:flex-row sm:flex-wrap sm:gap-6">
          {store.address ? (
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="shrink-0 text-brand-500" aria-hidden />
              {store.address}
            </span>
          ) : null}
          {store.openingHours ? (
            <span className="inline-flex items-center gap-2">
              <Clock size={16} className="shrink-0 text-brand-500" aria-hidden />
              {store.openingHours}
            </span>
          ) : null}
        </div>
      </header>

      <h2 className="mb-6 text-xl font-black text-slate-900">Equipment from this store</h2>
      {products.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          No equipment listed for this store yet.
        </p>
      ) : (
        <EquipmentGrid equipmentList={products} />
      )}
    </main>
  );
};

export default StoreDetailContainer;
