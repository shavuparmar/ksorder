import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/auth";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

function Badge({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-xl bg-gray-100 text-gray-700 border border-gray-200">
      {children}
    </span>
  );
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <p className="font-semibold">{title}</p>
            <button onClick={onClose} className="px-3 py-1 rounded-xl border hover:bg-gray-50">
              ✕
            </button>
          </div>
          <div className="p-4">{children}</div>
          {footer ? <div className="p-4 border-t bg-gray-50">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  // view order modal
  const [viewOpen, setViewOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // payments modal
  const [payOpen, setPayOpen] = useState(false);
  const [statement, setStatement] = useState(null);
  const [payErr, setPayErr] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // add payment
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Offline received");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [adding, setAdding] = useState(false);

  // edit payment
  const [editOpen, setEditOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 16));
  const [savingEdit, setSavingEdit] = useState(false);

  const loadOrders = async () => {
    setErr("");
    try {
      setLoading(true);
      const res = await api.get("/orders"); // STAFF endpoint
      setOrders(res?.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (orders || [])
      .filter((o) => (status === "ALL" ? true : o.status === status))
      .filter((o) => {
        if (!query) return true;
        const orderNo = String(o.orderNo || "").toLowerCase();
        const customerName = String(o.userId?.customerName || "").toLowerCase();
        const email = String(o.userId?.email || "").toLowerCase();
        const customerNo = String(o.userId?.customerNumber || "").toLowerCase();
        return (
          orderNo.includes(query) ||
          customerName.includes(query) ||
          email.includes(query) ||
          customerNo.includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, q, status]);

  const openView = (order) => {
    setActiveOrder(order);
    setViewOpen(true);
  };

  const openPayments = async (order) => {
    setActiveOrder(order);
    setPayErr("");
    setStatement(null);
    setPayOpen(true);

    // reset add form
    setAmount(String(order?.grandTotal || ""));
    setNote("Offline received");
    setPaidAt(new Date().toISOString().slice(0, 16));

    // load statement by userId from order (no /users endpoint needed)
    const uid = order?.userId?._id;
    if (!uid) return setPayErr("User ID not found in order");

    try {
      setPayLoading(true);
      const res = await api.get(`/payments/user/${uid}`);
      setStatement(res?.data?.data || null);
    } catch (e) {
      setPayErr(e?.response?.data?.message || "Failed to load statement");
    } finally {
      setPayLoading(false);
    }
  };

  const totalPaid = useMemo(() => {
    const list = statement?.entries || [];
    return list.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  }, [statement]);

  const totalDue = useMemo(() => {
    // if backend provides totalDue use it; else use this order total as payable
    const backend = statement?.totalDue ?? statement?.totalPayable;
    if (typeof backend === "number") return backend;

    // fallback: order total payable
    return Number(activeOrder?.grandTotal || 0);
  }, [statement, activeOrder]);

  const pending = useMemo(() => {
    const p = Number(totalDue || 0) - Number(totalPaid || 0);
    return p > 0 ? p : 0;
  }, [totalDue, totalPaid]);

  const refreshStatement = async () => {
    const uid = activeOrder?.userId?._id;
    if (!uid) return;
    try {
      setPayLoading(true);
      const res = await api.get(`/payments/user/${uid}`);
      setStatement(res?.data?.data || null);
    } catch (e) {
      setPayErr(e?.response?.data?.message || "Failed to refresh statement");
    } finally {
      setPayLoading(false);
    }
  };

  const addPayment = async () => {
    setPayErr("");
    const uid = activeOrder?.userId?._id;
    if (!uid) return setPayErr("User ID not found");

    const amt = Number(amount);
    if (!amt || amt <= 0) return setPayErr("Enter valid amount");

    try {
      setAdding(true);
      await api.post("/payments/entry", {
        userId: uid,
        amount: amt,
        note: note || "Offline received",
        date: paidAt ? new Date(paidAt).toISOString() : new Date().toISOString(),
      });

      setAmount("");
      setNote("Offline received");
      setPaidAt(new Date().toISOString().slice(0, 16));
      await refreshStatement();
    } catch (e) {
      setPayErr(e?.response?.data?.message || "Failed to add payment");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (entry) => {
    setActiveEntry(entry);
    setEditAmount(String(entry.amount ?? ""));
    setEditNote(entry.note ?? "");
    setEditDate(new Date(entry.date).toISOString().slice(0, 16));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!activeEntry?._id) return;
    const amt = Number(editAmount);
    if (!amt || amt <= 0) return setPayErr("Enter valid amount");

    try {
      setSavingEdit(true);
      await api.patch(`/payments/entry/${activeEntry._id}`, {
        amount: amt,
        note: editNote,
        date: editDate ? new Date(editDate).toISOString() : activeEntry.date,
      });

      setEditOpen(false);
      await refreshStatement();
    } catch (e) {
      setPayErr(e?.response?.data?.message || "Failed to update entry (missing PATCH route?)");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteEntry = async (entryId) => {
    if (!entryId) return;
    const ok = window.confirm("Delete this payment entry?");
    if (!ok) return;

    try {
      await api.delete(`/payments/entry/${entryId}`);
      await refreshStatement();
    } catch (e) {
      setPayErr(e?.response?.data?.message || "Failed to delete entry (missing DELETE route?)");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-500">View orders and manage payments inside this page</p>
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm"
        >
          Refresh
        </button>
      </div>

      {err ? <div className="p-3 rounded-xl border bg-red-50 text-red-700 text-sm">{err}</div> : null}

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          className="w-full sm:w-80 border rounded-xl px-3 py-2 text-sm"
          placeholder="Search order / user / email / customer no..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex gap-2 items-center">
          <select
            className="border rounded-xl px-3 py-2 text-sm bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <Badge>{filtered.length} orders</Badge>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b font-semibold">All Orders</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-gray-500" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : null}

              {!loading &&
                filtered.map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="p-3 font-medium">{o.orderNo}</td>
                    <td className="p-3">
                      <div className="leading-tight">
                        <p className="font-medium">{o.userId?.customerName || "-"}</p>
                        <p className="text-xs text-gray-500">{o.userId?.email || ""}</p>
                        <p className="text-xs text-gray-500">No: {o.userId?.customerNumber || "-"}</p>
                      </div>
                    </td>
                    <td className="p-3">₹{o.grandTotal}</td>
                    <td className="p-3">
                      <Badge>{o.status}</Badge>
                    </td>
                    <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openView(o)}
                          className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openPayments(o)}
                          className="px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-900 text-xs"
                        >
                          Payments
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 ? (
                <tr>
                  <td className="p-6 text-gray-500" colSpan={6}>
                    No orders
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* View order modal */}
      <Modal
        open={viewOpen}
        title={`Order Details — ${activeOrder?.orderNo || ""}`}
        onClose={() => setViewOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setViewOpen(false)} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm">
              Close
            </button>
            <button
              onClick={() => {
                setViewOpen(false);
                openPayments(activeOrder);
              }}
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900 text-sm"
            >
              Payments
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border p-3">
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-semibold">{activeOrder?.userId?.customerName || "-"}</p>
              <p className="text-xs text-gray-500">{activeOrder?.userId?.email || ""}</p>
              <p className="text-xs text-gray-500">Customer No: {activeOrder?.userId?.customerNumber || "-"}</p>
            </div>

            <div className="rounded-2xl border p-3">
              <p className="text-xs text-gray-500">Order</p>
              <p className="font-semibold">{activeOrder?.orderNo}</p>
              <p className="text-xs text-gray-500">{new Date(activeOrder?.createdAt).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Status: {activeOrder?.status}</p>
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 text-sm font-semibold">Items</div>
            <div className="divide-y">
              {(activeOrder?.items || []).map((it, idx) => (
                <div key={idx} className="px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-gray-500">
                      ₹{it.price} × {it.qty}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">₹{(it.price || 0) * (it.qty || 0)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Grand Total</p>
            <p className="text-lg font-semibold">₹{activeOrder?.grandTotal}</p>
          </div>
        </div>
      </Modal>

      {/* Payments modal */}
      <Modal
        open={payOpen}
        title={`Payments — ${activeOrder?.orderNo || ""}`}
        onClose={() => setPayOpen(false)}
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className={cx("text-sm", payErr ? "text-rose-700" : "text-gray-500")}>
              {payErr || "Manage payments for this user"}
            </p>
            <button
              onClick={refreshStatement}
              className={cx(
                "px-4 py-2 rounded-xl text-sm text-white",
                payLoading ? "bg-gray-400" : "bg-black hover:bg-gray-900"
              )}
              disabled={payLoading}
            >
              {payLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border p-3">
              <p className="text-xs text-gray-500">Payable</p>
              <p className="font-semibold">₹{totalDue}</p>
            </div>
            <div className="rounded-2xl border p-3">
              <p className="text-xs text-gray-500">Paid</p>
              <p className="font-semibold">₹{totalPaid}</p>
            </div>
            <div className="rounded-2xl border p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className={cx("font-semibold", pending > 0 ? "text-rose-600" : "text-emerald-600")}>
                ₹{pending}
              </p>
            </div>
          </div>

          {/* add payment */}
          <div className="rounded-2xl border p-3 space-y-3">
            <p className="text-sm font-semibold">Add Payment</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Amount</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min="1"
                  placeholder="Amount"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium">Paid At</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600 font-medium">Note</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <button
              onClick={addPayment}
              disabled={adding}
              className={cx(
                "w-full rounded-xl py-2 text-sm text-white",
                adding ? "bg-gray-400" : "bg-black hover:bg-gray-900"
              )}
            >
              {adding ? "Adding..." : "Add Entry"}
            </button>
          </div>

          {/* entries list */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 text-sm font-semibold">Entries</div>

            {payLoading ? (
              <div className="p-4 text-gray-500">Loading statement...</div>
            ) : (
              <div className="divide-y">
                {(statement?.entries || []).slice().reverse().map((e) => (
                  <div key={e._id} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">₹{e.amount}</p>
                        <p className="text-xs text-gray-500">{new Date(e.date).toLocaleString("en-GB")}</p>
                        {e.note ? <p className="text-xs text-gray-500 mt-1">{e.note}</p> : null}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEntry(e._id)}
                          className="px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(statement?.entries || []).length === 0 ? (
                  <div className="p-4 text-gray-500">No entries</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit payment modal */}
      <Modal
        open={editOpen}
        title="Edit Payment Entry"
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={savingEdit}
              className={cx(
                "px-4 py-2 rounded-xl text-sm text-white",
                savingEdit ? "bg-gray-400" : "bg-black hover:bg-gray-900"
              )}
            >
              {savingEdit ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 font-medium">Amount</label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Note</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Date</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
