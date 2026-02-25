import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/auth";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

function toInputDateValue(date) {
  const d = new Date(date);
  const tzOff = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOff).toISOString().slice(0, 10);
}

function sameLocalDate(isoOrDate, yyyyMmDd) {
  if (!yyyyMmDd) return true;
  const d = new Date(isoOrDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === yyyyMmDd;
}

function inRange(isoOrDate, from, to) {
  if (!from && !to) return true;
  const t = new Date(isoOrDate).getTime();
  const start = from ? new Date(from + "T00:00:00").getTime() : -Infinity;
  const end = to ? new Date(to + "T23:59:59").getTime() : Infinity;
  return t >= start && t <= end;
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl border shadow-xl overflow-hidden">
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

export default function StaffPaymentsPage() {
  // ✅ user list
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  // ✅ statement
  const [statement, setStatement] = useState(null);
  const [err, setErr] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(false);

  // ✅ add payment
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Offline received");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [adding, setAdding] = useState(false);

  // ✅ filters
  const [dateOnly, setDateOnly] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ edit/delete
  const [editOpen, setEditOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 16));
  const [savingEdit, setSavingEdit] = useState(false);

  // 1) Load users once
  useEffect(() => {
    (async () => {
      try {
        setLoadingUsers(true);
        setErr("");

        // ✅ Change this to your users endpoint if different
        // Expected: returns array of users in data.data
        const res = await api.get("/users");
        const all = res?.data?.data || [];

        // Keep only USER role (if your API supports ?role=USER, use it)
        const onlyUsers = all.filter((u) => (u?.role || "") === "USER");

        setUsers(onlyUsers);

        // auto-select first user
        if (onlyUsers.length > 0) setSelectedUserId(String(onlyUsers[0]._id));
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load users list");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // 2) Load statement when selected user changes
  useEffect(() => {
    if (!selectedUserId) return;
    loadStatement(selectedUserId);
    // reset filters
    setDateOnly("");
    setFromDate("");
    setToDate("");
  }, [selectedUserId]);

  const loadStatement = async (uid) => {
    setErr("");
    setStatement(null);
    try {
      setLoadingStatement(true);
      const res = await api.get(`/payments/user/${uid}`);
      setStatement(res?.data?.data || null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load statement");
    } finally {
      setLoadingStatement(false);
    }
  };

  const entries = useMemo(() => {
    const list = (statement?.entries || []).slice();
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [statement]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => sameLocalDate(e.date, dateOnly))
      .filter((e) => inRange(e.date, fromDate, toDate));
  }, [entries, dateOnly, fromDate, toDate]);

  const totalPaid = useMemo(() => {
    const backend = statement?.totalPaid;
    if (typeof backend === "number") return backend;
    return entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [statement, entries]);

  const totalDue = useMemo(() => {
    const backend = statement?.totalDue ?? statement?.totalPayable ?? 0;
    return Number(backend) || 0;
  }, [statement]);

  const pending = useMemo(() => {
    const p = totalDue - totalPaid;
    return p > 0 ? p : 0;
  }, [totalDue, totalPaid]);

  const addPayment = async () => {
    setErr("");
    const amt = Number(amount);
    if (!amt || amt <= 0) return setErr("Enter valid amount");

    try {
      setAdding(true);
      await api.post("/payments/entry", {
        userId: selectedUserId,
        amount: amt,
        note: note || "Offline received",
        date: paidAt ? new Date(paidAt).toISOString() : new Date().toISOString(),
      });

      setAmount("");
      setNote("Offline received");
      setPaidAt(new Date().toISOString().slice(0, 16));
      await loadStatement(selectedUserId);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add payment");
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
    if (!amt || amt <= 0) return setErr("Enter valid amount");

    try {
      setSavingEdit(true);

      // ✅ change route if yours differs
      await api.patch(`/payments/entry/${activeEntry._id}`, {
        amount: amt,
        note: editNote,
        date: editDate ? new Date(editDate).toISOString() : activeEntry.date,
      });

      setEditOpen(false);
      await loadStatement(selectedUserId);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update entry");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteEntry = async (entryId) => {
    if (!entryId) return;
    const ok = window.confirm("Delete this payment entry?");
    if (!ok) return;

    try {
      // ✅ change route if yours differs
      await api.delete(`/payments/entry/${entryId}`);
      await loadStatement(selectedUserId);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete entry");
    }
  };

  const selectedUser = useMemo(() => {
    return users.find((u) => String(u._id) === String(selectedUserId));
  }, [users, selectedUserId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Payments Statement</h1>
        <p className="text-sm text-gray-500">Select a user and manage payments (paid / pending)</p>
      </div>

      {err ? (
        <div className="p-3 rounded-xl border bg-red-50 text-red-700 text-sm">{err}</div>
      ) : null}

      {/* User Selector (no search input) */}
      <div className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">User</p>
          <p className="text-xs text-gray-500">
            {loadingUsers ? "Loading users..." : "Select user to view statement"}
          </p>
        </div>

        <div className="w-full sm:w-[420px]">
          <select
            className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loadingUsers || users.length === 0}
          >
            {users.length === 0 ? (
              <option value="">No users found</option>
            ) : (
              users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.customerName} ({u.customerNumber}) — {u.email}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Summary + Add */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border rounded-2xl p-4">
            <p className="font-semibold">Summary</p>

            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium text-gray-800">{selectedUser?.customerName || "-"}</p>
              <p className="text-xs">{selectedUser?.email || ""}</p>
              <p className="text-xs">Customer No: {selectedUser?.customerNumber || "-"}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="rounded-2xl border p-3">
                <p className="text-xs text-gray-500">Total Payable</p>
                <p className="text-lg font-semibold">₹{totalDue}</p>
              </div>

              <div className="rounded-2xl border p-3">
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-lg font-semibold">₹{totalPaid}</p>
              </div>

              <div className="rounded-2xl border p-3">
                <p className="text-xs text-gray-500">Pending</p>
                <p className={cx("text-lg font-semibold", pending > 0 ? "text-rose-600" : "text-emerald-600")}>
                  ₹{pending}
                </p>
              </div>
            </div>

            <button
              onClick={() => loadStatement(selectedUserId)}
              className={cx(
                "mt-4 w-full rounded-xl py-2 text-sm text-white",
                loadingStatement ? "bg-gray-400" : "bg-black hover:bg-gray-900"
              )}
              disabled={loadingStatement || !selectedUserId}
            >
              {loadingStatement ? "Refreshing..." : "Refresh Statement"}
            </button>
          </div>

          <div className="bg-white border rounded-2xl p-4 space-y-3">
            <p className="font-semibold">Add Payment</p>

            <input
              className="border rounded-xl px-3 py-2 text-sm w-full"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
            />

            <input
              className="border rounded-xl px-3 py-2 text-sm w-full"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div>
              <label className="text-xs text-gray-600 font-medium">Paid At</label>
              <input
                type="datetime-local"
                className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </div>

            <button
              onClick={addPayment}
              disabled={adding || !selectedUserId}
              className={cx(
                "w-full rounded-xl py-2 text-sm text-white",
                adding ? "bg-gray-400" : "bg-black hover:bg-gray-900"
              )}
            >
              {adding ? "Adding..." : "Add Entry"}
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Entries</p>
              <span className="text-xs px-2 py-1 rounded-xl bg-gray-100 border">
                Showing {filteredEntries.length} / {entries.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Single Date</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={dateOnly}
                  onChange={(e) => setDateOnly(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium">From</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium">To</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm"
                onClick={() => setDateOnly(toInputDateValue(new Date()))}
              >
                Today
              </button>
              <button
                className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm"
                onClick={() => {
                  setDateOnly("");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 text-sm font-semibold">Payment Entries</div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-600">
                  <tr className="border-b">
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Note</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((e) => (
                    <tr key={e._id} className="border-b last:border-b-0">
                      <td className="p-3 font-medium">₹{e.amount}</td>
                      <td className="p-3 text-gray-600">
                        {new Date(e.date).toLocaleString("en-GB")}
                      </td>
                      <td className="p-3 text-gray-600">{e.note || "-"}</td>
                      <td className="p-3">
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
                      </td>
                    </tr>
                  ))}

                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td className="p-6 text-gray-500" colSpan={4}>
                        No entries found for selected filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter Total */}
          <div className="bg-white border rounded-2xl p-4">
            <p className="text-sm font-semibold">Filtered Total</p>
            <p className="text-2xl font-semibold mt-1">
              ₹{filteredEntries.reduce((s, x) => s + (Number(x.amount) || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total amount received in selected date/day range.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
