/**
 * Home / catalog: loads equipment and public stores, search, category chips, hero video.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import EquipmentGrid from "../components/EquipmentGrid";
import StoreResultCard from "../components/StoreResultCard";
import type { Equipment } from "../../../types";
import {
  getEquipmentList,
  getPublicStores,
  type StoreOut,
} from "../../../services/api";
import { CategoryChipIcon } from "../utils/categoryIcons";
import HeroPromoVideo from "../../../layout/HeroPromoVideo";

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`sk-${i}`}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="mb-4 aspect-[16/10] rounded-xl bg-slate-200" />
          <div className="mb-6 h-6 w-3/4 rounded bg-slate-200" />
          <div className="h-20 w-full rounded-xl bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

type SearchScope = "products" | "stores";

const EquipmentListContainer: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [storesList, setStoresList] = useState<StoreOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchScope, setSearchScope] = useState<SearchScope>("products");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [equipmentRes, storesRes] = await Promise.all([
          getEquipmentList(),
          getPublicStores(),
        ]);
        setEquipmentList(equipmentRes.items);
        setStoresList(storesRes.items);
      } catch (err) {
        console.error(err);
        setError("Failed to load catalog");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    equipmentList.forEach((e) => unique.add(e.category));
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [equipmentList]);

  const filteredEquipment = useMemo(() => {
    let list = equipmentList;
    if (activeCategory !== "All") {
      list = list.filter((e) => e.category === activeCategory);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.storeName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [equipmentList, activeCategory, search]);

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return storesList;
    return storesList.filter((s) => {
      const name = s.storeName.toLowerCase();
      const desc = (s.description || "").toLowerCase();
      const addr = (s.address || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || addr.includes(q);
    });
  }, [storesList, search]);

  const scopeBtn = (scope: SearchScope, label: string) => (
    <button
      key={scope}
      type="button"
      onClick={() => setSearchScope(scope)}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
        searchScope === scope
          ? "bg-white text-brand-700 shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-10 md:px-6">
        <HeroPromoVideo className="mb-8" />
        <CatalogSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-10 md:px-6">
        <HeroPromoVideo className="mb-8" />
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
      <section className="mb-10 md:mb-12">
        <div className="flex flex-col gap-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-brand-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                Premium catalog
              </span>
            </div>
            <h1 className="max-w-[22ch] text-pretty text-4xl leading-[1.08] tracking-[-0.04em] text-slate-800 sm:max-w-none md:text-5xl lg:text-[3.35rem] lg:leading-[1.05] lg:tracking-[-0.045em]">
              <span className="font-light text-slate-600">Equip Your Next </span>
              <span className="bg-gradient-to-r from-slate-900 via-brand-700 to-brand-600 bg-clip-text font-extrabold text-transparent">
                Adventure
              </span>
            </h1>
          </div>

          <HeroPromoVideo />

          <div className="flex w-full min-w-0 flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="flex shrink-0 rounded-2xl border border-slate-200 bg-slate-100/90 p-1"
                role="group"
                aria-label="Search scope"
              >
                {scopeBtn("products", "Products")}
                {scopeBtn("stores", "Stores")}
              </div>
              <div className="group relative min-w-0 flex-grow">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-600"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    searchScope === "products"
                      ? "Search products, categories, or stores…"
                      : "Search stores by name, description, or address…"
                  }
                  autoComplete="off"
                  className="h-14 w-full rounded-2xl border-none bg-slate-100/90 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  aria-label={
                    searchScope === "products"
                      ? "Search products"
                      : "Search stores"
                  }
                />
              </div>
            </div>

            {searchScope === "products" ? (
              <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto px-1 no-scrollbar lg:px-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 text-sm font-bold transition-all ${
                      activeCategory === cat
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CategoryChipIcon category={cat} />
                    {cat}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="w-full min-w-0">
        {searchScope === "products" ? (
          filteredEquipment.length === 0 ? (
            <p className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-500">
              No items match your search or category. Try clearing filters.
            </p>
          ) : (
            <EquipmentGrid equipmentList={filteredEquipment} />
          )
        ) : filteredStores.length === 0 ? (
          <p className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-500">
            No stores match your search. Try another name or clear the search box.
          </p>
        ) : (
          <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((s) => (
              <StoreResultCard key={s.id} store={s} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default EquipmentListContainer;
