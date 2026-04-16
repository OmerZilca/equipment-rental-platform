/**
 * Wish list route: requires sign-in; loads `/api/wishlist` and supports remove.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WishlistView from "../components/WishlistView";
import {
  getWishlist,
  isLoggedIn,
  removeFromWishlist,
} from "../../../services/api";
import type { Equipment } from "../../../types";

const WishlistContainer: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      setItems(data.items ?? []);
    } catch {
      setError("Failed to load your wish list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }
    void fetchData();
  }, [navigate, fetchData]);

  const handleRemove = async (equipmentId: number) => {
    setRemovingId(equipmentId);
    try {
      await removeFromWishlist(equipmentId);
      setItems((prev) => prev.filter((e) => e.id !== equipmentId));
    } catch {
      alert("Could not remove that item. Check your connection and try again.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-medium text-slate-500">
        Loading your wish list…
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-bold text-brand-600"
          onClick={() => void fetchData()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex text-sm font-bold text-slate-500 no-underline hover:text-brand-600"
      >
        ← Back to catalog
      </Link>
      <WishlistView
        items={items}
        removingId={removingId}
        onRemove={handleRemove}
      />
    </div>
  );
};

export default WishlistContainer;
