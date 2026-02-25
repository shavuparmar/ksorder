import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/auth";

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    unitsPerCaret: "1",
    isActive: true,
  });

  // edit modal
  const [editing, setEditing] = useState(null); // product object
  const [edit, setEdit] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    unitsPerCaret: "1",
    isActive: true,
  });

  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    const res = await api.get("/products");
    setProducts(res?.data?.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(s) ||
        (p.category || "").toLowerCase().includes(s) ||
        (p.sku || "").toLowerCase().includes(s)
    );
  }, [products, q]);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.name.trim()) return setErr("Name is required");
    if (form.price === "") return setErr("Price is required");

    const payload = {
      name: form.name.trim(),
      price: num(form.price),
      stock: num(form.stock),
      category: form.category.trim(),
      unitsPerCaret: Math.max(1, num(form.unitsPerCaret, 1)),
      isActive: !!form.isActive,
    };

    if (!Number.isFinite(payload.price) || payload.price < 0) return setErr("Price must be >= 0");
    if (!Number.isFinite(payload.stock) || payload.stock < 0) return setErr("Stock must be >= 0");

    try {
      await api.post("/products", payload);
      setOk("Product added ✅");
      setForm({
        name: "",
        price: "",
        stock: "",
        category: "",
        unitsPerCaret: "1",
        isActive: true,
      });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create product");
    }
  };

  const openEdit = (p) => {
    setErr("");
    setOk("");
    setEditing(p);
    setEdit({
      name: p.name || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? ""),
      category: p.category || "",
      unitsPerCaret: String(p.unitsPerCaret ?? 1),
      isActive: !!p.isActive,
    });
  };

  const saveEdit = async () => {
    if (!editing?._id) return;

    setErr("");
    setOk("");

    if (!edit.name.trim()) return setErr("Name is required");
    if (edit.price === "") return setErr("Price is required");

    const payload = {
      name: edit.name.trim(),
      price: num(edit.price),
      stock: num(edit.stock),
      category: edit.category.trim(),
      unitsPerCaret: Math.max(1, num(edit.unitsPerCaret, 1)),
      isActive: !!edit.isActive,
    };

    if (!Number.isFinite(payload.price) || payload.price < 0) return setErr("Price must be >= 0");
    if (!Number.isFinite(payload.stock) || payload.stock < 0) return setErr("Stock must be >= 0");

    try {
      await api.patch(`/products/${editing._id}`, payload);
      setOk("Product updated ✅");
      setEditing(null);
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update product");
    }
  };

  const toggleActive = async (p) => {
    setErr("");
    setOk("");
    try {
      await api.patch(`/products/${p._id}`, { isActive: !p.isActive });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to toggle");
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-60 bg-white rounded-xl" />
        <div className="h-40 bg-white rounded-2xl" />
        <div className="h-72 bg-white rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Products</h1>
        <p className="text-sm text-gray-500">
          Admin manages products (price + units per caret).
        </p>
      </div>

      {(err || ok) && (
        <div className={`rounded-2xl p-3 text-sm ${err ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
          {err || ok}
        </div>
      )}

      {/* Create */}
      <form onSubmit={create} className="bg-white border rounded-2xl p-4 grid md:grid-cols-6 gap-3">
        <input
          className="border rounded-xl px-3 py-2 md:col-span-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Price (per unit)"
          inputMode="decimal"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Stock (units)"
          inputMode="decimal"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Units per caret (24/48)"
          inputMode="numeric"
          value={form.unitsPerCaret}
          onChange={(e) => setForm({ ...form, unitsPerCaret: e.target.value })}
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <label className="md:col-span-6 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

        <button className="md:col-span-6 bg-black text-white rounded-xl py-2 font-semibold">
          Add Product
        </button>
      </form>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <input
          className="border rounded-xl px-3 py-2 w-full max-w-md"
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={load}
          className="border rounded-xl px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b font-semibold">All Products</div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Price/unit</th>
                <th className="text-left p-3">Units/Caret</th>
                <th className="text-left p-3">Stock (units)</th>
                <th className="text-left p-3">Active</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.category || "-"}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.unitsPerCaret ?? 1}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.isActive ? "Yes" : "No"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="border rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(p)}
                      className="border rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
                    >
                      {p.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-gray-500">
                    No products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Edit Product</h2>
                <p className="text-xs text-gray-500">Update price and units/caret for correct staff calculation.</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-sm text-gray-600 hover:text-black">
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Name</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Category</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={edit.category}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Price (per unit)</label>
                <input
                  inputMode="decimal"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={edit.price}
                  onChange={(e) => setEdit({ ...edit, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Stock (units)</label>
                <input
                  inputMode="decimal"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={edit.stock}
                  onChange={(e) => setEdit({ ...edit, stock: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Units per caret</label>
                <input
                  inputMode="numeric"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={edit.unitsPerCaret}
                  onChange={(e) => setEdit({ ...edit, unitsPerCaret: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={edit.isActive}
                    onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 bg-black text-white rounded-xl py-2 font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(null)}
                className="border rounded-xl px-4 py-2 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Example: Amul Gold 500ml → price=35 and units/caret=24.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
