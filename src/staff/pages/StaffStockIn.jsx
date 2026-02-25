import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/v1",
  withCredentials: true,
});

const iso = (d = new Date()) => new Date(d).toISOString().slice(0, 10);

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function StaffStockInEntry() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState("");

  // ✅ Selected list (no duplicates)
  const [lines, setLines] = useState([]); // [{ product, carets, note }]
  const [day, setDay] = useState(iso());
  const [globalNote, setGlobalNote] = useState("");

  // ✅ Today history (small list)
  const [todayItems, setTodayItems] = useState([]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 100);
    return products
      .filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
      )
      .slice(0, 100);
  }, [products, productQuery]);

  // totals preview
  const totals = useMemo(() => {
    return lines.reduce(
      (acc, ln) => {
        const carets = Number(ln.carets || 0);
        const upc = Number(ln.product?.unitsPerCaret || 1);
        const price = Number(ln.product?.price || 0);
        const units = carets * upc;
        const amt = units * price;
        acc.carets += carets;
        acc.units += units;
        acc.amount += amt;
        return acc;
      },
      { carets: 0, units: 0, amount: 0 }
    );
  }, [lines]);

  async function loadProducts() {
    // ✅ correct for baseURL ending with /api/v1
    const res = await api.get("/products");
    const list = res?.data?.data || [];
    setProducts(Array.isArray(list) ? list : []);
  }

  async function loadToday() {
    // optional endpoint (create later if not exist)
    // We’ll try: GET /stock-in?day=YYYY-MM-DD
    try {
      const res = await api.get(`/stock-in?day=${encodeURIComponent(day)}`);
      const list = res?.data?.data || res?.data?.items || [];
      setTodayItems(Array.isArray(list) ? list : []);
    } catch {
      // if not implemented yet, ignore
      setTodayItems([]);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        await loadProducts();
        await loadToday();
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload today items if date changes
  useEffect(() => {
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  function addProduct(p) {
    setOk("");
    setErr("");

    // ✅ no duplicates
    if (lines.some((x) => x.product?._id === p._id)) {
      setErr("This product is already added in the list.");
      return;
    }

    setLines((prev) => [...prev, { product: p, carets: "", note: "" }]);
    setProductQuery("");
  }

  function removeLine(productId) {
    setLines((prev) => prev.filter((x) => x.product?._id !== productId));
  }

  function updateLine(productId, patch) {
    setLines((prev) =>
      prev.map((x) => (x.product?._id === productId ? { ...x, ...patch } : x))
    );
  }

  async function saveAll() {
    setErr("");
    setOk("");

    if (lines.length === 0) return setErr("Add at least one product.");

    // validate
    for (const ln of lines) {
      const n = Number(ln.carets || 0);
      if (!Number.isFinite(n) || n <= 0) {
        return setErr(`Enter carets > 0 for: ${ln.product?.name || "product"}`);
      }
    }

    try {
      setSaving(true);

      // ✅ Preferred: bulk endpoint (recommended)
      // POST /stock-in/bulk
      // body: { date, note, items: [{productId, carets, note}] }
      const payload = {
        date: day,
        note: globalNote.trim(),
        items: lines.map((ln) => ({
          productId: ln.product._id,
          carets: Number(ln.carets),
          note: (ln.note || "").trim(),
        })),
      };

      try {
        await api.post("/stock-in/bulk", payload); // ✅ if you implement bulk
      } catch (bulkErr) {
        // ✅ Fallback: if bulk not available, save one-by-one
        // (works with your current single-entry backend)
        for (const it of payload.items) {
          await api.post("/stock-in", { ...it, date: payload.date });
        }
      }

      setOk("Saved ✅");
      setLines([]);
      setGlobalNote("");
      await loadToday();
    } catch (e) {
      // Most common: 401 auth or wrong route
      setErr(
        e?.response?.data?.message ||
          `Failed to save entry (status ${e?.response?.status || "?"})`
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 w-72 bg-white rounded-xl" />
          <div className="h-72 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Staff Stock In Entry
            </h1>
            <p className="text-sm text-slate-600">
              Add multiple products once. Same product won’t repeat. Save creates history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700">Date</label>
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        {(err || ok) && (
          <div
            className={`rounded-2xl p-3 text-sm ${
              err ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {err || ok}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: Product picker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h2 className="font-semibold text-slate-900">Add Products</h2>

            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search name / SKU…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            />

            <div className="max-h-80 overflow-auto rounded-2xl border border-slate-200">
              {filteredProducts.length === 0 ? (
                <div className="p-3 text-sm text-slate-500">No products found</div>
              ) : (
                filteredProducts.map((p) => {
                  const already = lines.some((x) => x.product?._id === p._id);
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => addProduct(p)}
                      disabled={already}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 disabled:opacity-50 ${
                        already ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500">
                            SKU: {p.sku || "-"} • ₹{money(p.price)} / unit •{" "}
                            {p.unitsPerCaret || 1} units/caret
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {already ? "Added" : "Add"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Entry list (no duplicates) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Entry List</h2>
              <div className="text-xs text-slate-500">
                Items: <b>{lines.length}</b>
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Add products from the left list.
              </div>
            ) : (
              <div className="space-y-2">
                {lines.map((ln) => {
                  const p = ln.product;
                  const carets = Number(ln.carets || 0);
                  const upc = Number(p?.unitsPerCaret || 1);
                  const price = Number(p?.price || 0);
                  const units = carets * upc;
                  const amount = units * price;

                  return (
                    <div key={p._id} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500">
                            {upc} units/caret • ₹{money(price)} / unit
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(p._id)}
                          className="text-xs font-semibold text-rose-700 hover:text-rose-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-slate-600">Carets</label>
                          <input
                            value={ln.carets}
                            onChange={(e) => updateLine(p._id, { carets: e.target.value })}
                            placeholder="e.g. 14"
                            inputMode="decimal"
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">Units</div>
                          <div className="text-sm font-semibold text-slate-900">{money(units)}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">Amount</div>
                          <div className="text-sm font-semibold text-slate-900">₹{money(amount)}</div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label className="text-xs text-slate-600">Note (optional)</label>
                        <input
                          value={ln.note}
                          onChange={(e) => updateLine(p._id, { note: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="note for this product…"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 flex flex-wrap gap-3 justify-between">
              <span>Carets: <b>{money(totals.carets)}</b></span>
              <span>Units: <b>{money(totals.units)}</b></span>
              <span>Amount: <b>₹{money(totals.amount)}</b></span>
            </div>

            <div>
              <label className="text-xs text-slate-600">Common note (optional)</label>
              <input
                value={globalNote}
                onChange={(e) => setGlobalNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="note for this entry batch…"
              />
            </div>

            <button
              onClick={saveAll}
              disabled={saving || lines.length === 0}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

        {/* TODAY HISTORY (small) */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Today Saved Entries</h2>
              <p className="text-xs text-slate-500">Date: {day}</p>
            </div>
            <button
              onClick={loadToday}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Time</th>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-right px-4 py-3 font-semibold">Carets</th>
                  <th className="text-right px-4 py-3 font-semibold">Units</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {todayItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No entries (or history endpoint not added yet).
                    </td>
                  </tr>
                ) : (
                  todayItems.map((it) => (
                    <tr key={it._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-600">
                        {it.createdAt
                          ? new Date(it.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {it.productId?.name || it.product?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">{money(it.carets)}</td>
                      <td className="px-4 py-3 text-right">{money(it.totalUnits)}</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{money(it.totalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
