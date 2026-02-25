import  { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { motion } from "framer-motion";

export default function OrderPages() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const isEdit = Boolean(orderId);

  const [products, setProducts] = useState([]);
  const [qtyMap, setQtyMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Load products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        setProducts(res?.data?.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Edit mode: load order
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        const order = res?.data?.data;

        const map = {};
        (order?.items || []).forEach((i) => {
          map[i.productId] = i.qty;
        });

        setQtyMap(map);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load order");
      }
    })();
  }, [isEdit, orderId]);

  const items = useMemo(() => {
    return Object.entries(qtyMap)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([productId, qty]) => ({ productId, qty: Number(qty) }));
  }, [qtyMap]);

  const total = useMemo(() => {
    return items.reduce((sum, i) => {
      const p = products.find((x) => x._id === i.productId);
      return sum + (p?.price || 0) * i.qty;
    }, 0);
  }, [items, products]);

  const saveOrder = async () => {
    setErr("");
    if (items.length === 0) return setErr("Select at least 1 product");

    try {
      setSaving(true);

      if (isEdit) {
        await api.patch(`/orders/${orderId}`, { items });
      } else {
        await api.post("/orders", { items });
      }

      nav("/view-order", { replace: true });
    } catch (e) {
      console.log("ORDER ERROR:", e?.response?.data || e);
      setErr(e?.response?.data?.message || "Order failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            className="text-sm px-3 py-2 rounded-xl border bg-white"
            onClick={() => nav(-1)}
          >
            ← Back
          </button>

          <h1 className="font-semibold">
            {isEdit ? "Edit Order" : "Place Order"}
          </h1>

          <div className="font-semibold">₹ {total}</div>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl border bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        )}

        <div className="mt-4 bg-white border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold text-sm">
            Products
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">Loading...</div>
          ) : (
            <div className="divide-y">
              {products.map((p) => (
                <div key={p._id} className="px-4 py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">₹{p.price}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-20 border rounded-xl px-3 py-2"
                    value={qtyMap[p._id] ?? 0}
                    onChange={(e) =>
                      setQtyMap((m) => ({ ...m, [p._id]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          onClick={saveOrder}
          className="mt-4 w-full bg-black text-white py-3 rounded-xl"
        >
          {saving ? "Saving..." : isEdit ? "Update Order" : "Place Order"}
        </motion.button>
      </div>
    </div>
  );
}
