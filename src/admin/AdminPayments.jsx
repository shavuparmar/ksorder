import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/auth";
import { motion } from "framer-motion";

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function AdminPayments() {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSug, setLoadingSug] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState("");

  const pending = useMemo(() => {
    const totalOrders = Number(summary?.totalOrderAmount || 0);
    const received = Number(summary?.totalReceived || 0);
    return Math.max(0, totalOrders - received);
  }, [summary]);

  const loadSuggestions = useMemo(
    () =>
      debounce(async (value) => {
        setErr("");
        const val = value.trim();
        if (!val) {
          setSuggestions([]);
          return;
        }

        try {
          setLoadingSug(true);
          const res = await api.get(`/users/search?q=${encodeURIComponent(val)}`);
          // expected: [{_id, customerName, customerNumber, email, hasOrders, pendingAmount}]
          setSuggestions(res?.data?.data || []);
        } catch (e) {
          setSuggestions([]);
          setErr(e?.response?.data?.message || "Failed to search users");
        } finally {
          setLoadingSug(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    loadSuggestions(q);
  }, [q, loadSuggestions]);

  const chooseUser = async (u) => {
    setSelectedUser(u);
    setSuggestions([]);
    setQ(`${u.customerNumber} • ${u.customerName}`);

    await loadSummary(u._id);
  };

  const loadSummary = async (userId) => {
    setErr("");
    setLoadingSummary(true);
    setSummary(null);

    try {
      const res = await api.get(`/payments/user/${userId}/summary`);
      // expected:
      // {
      //   user: {_id, customerName, customerNumber, email},
      //   totalOrderAmount,
      //   totalReceived,
      //   lastOrderAt,
      //   entries: [{_id, amount, date, note, createdBy}]
      // }
      setSummary(res?.data?.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load payment summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const addPayment = async () => {
    setErr("");
    if (!selectedUser?._id) return setErr("Select a user first");
    const amt = Number(amount);
    if (!amt || amt <= 0) return setErr("Enter a valid amount");

    try {
      setSaving(true);
      await api.post("/payments/entry", {
        userId: selectedUser._id,
        amount: amt,
        note: note?.trim() || "",
      });

      setAmount("");
      setNote("");
      await loadSummary(selectedUser._id);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">
          Search user by Customer Number / Email, add offline payment, track pending.
        </p>
      </div>

      {err ? (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      {/* Search */}
      <div className="bg-white border rounded-2xl p-4">
        <label className="text-sm font-medium text-gray-700">
          Search User (Customer No / Email / Name)
        </label>

        <div className="mt-2 relative">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSelectedUser(null);
              setSummary(null);
            }}
            placeholder="e.g. 6352244221 or admin@korder.com"
            className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* Suggestions */}
          {q.trim() && (loadingSug || suggestions.length > 0) ? (
            <div className="absolute z-20 mt-2 w-full bg-white border rounded-2xl overflow-hidden shadow-sm">
              {loadingSug ? (
                <div className="p-3 text-sm text-gray-500">Searching...</div>
              ) : (
                <div className="max-h-72 overflow-auto divide-y">
                  {suggestions.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => chooseUser(u)}
                      className="w-full text-left px-3 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {u.customerName} <span className="text-gray-400 font-normal">({u.customerNumber})</span>
                          </p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>

                        {/* Suggestions: show pending if backend provides */}
                        {typeof u.pendingAmount === "number" ? (
                          <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                            Pending ₹{u.pendingAmount}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}

                  {suggestions.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No users found</div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Tip: Users with orders can appear as suggestions (backend can prioritize pending users).
        </p>
      </div>

      {/* Summary + Add Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Payment Summary</p>
              {loadingSummary ? (
                <span className="text-xs text-gray-500">Loading...</span>
              ) : null}
            </div>

            {!summary && !loadingSummary ? (
              <div className="mt-4 text-sm text-gray-500">
                Select a user to see order totals, received amount, pending.
              </div>
            ) : null}

            {summary ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-semibold">₹ {summary.totalOrderAmount || 0}</p>
                </div>
                <div className="border rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Total Received</p>
                  <p className="text-lg font-semibold">₹ {summary.totalReceived || 0}</p>
                </div>
                <div className="border rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-semibold">₹ {pending}</p>
                </div>
              </div>
            ) : null}

            {summary?.user ? (
              <div className="mt-4 text-xs text-gray-500">
                User: <span className="font-medium text-gray-800">{summary.user.customerName}</span> •{" "}
                {summary.user.customerNumber} • {summary.user.email}
              </div>
            ) : null}
          </div>

          {/* Entries */}
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Payment Entries</p>
              <p className="text-xs text-gray-500">Offline entries</p>
            </div>

            <div className="divide-y">
              {(summary?.entries || []).slice().reverse().map((e) => (
                <div key={e._id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">₹ {e.amount}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(e.date || e.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {e.note ? <p className="text-xs text-gray-500 mt-1">{e.note}</p> : null}
                </div>
              ))}

              {summary && (summary?.entries || []).length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No payment entries yet.</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: Add payment */}
        <div className="space-y-4">
          <div className="bg-white border rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-900">Add Payment</p>
            <p className="text-xs text-gray-500 mt-1">
              Add offline received amount for the selected user.
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                placeholder="Amount (₹)"
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={saving || !selectedUser}
                onClick={addPayment}
                className="w-full bg-black text-white rounded-xl py-2.5 font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Entry"}
              </motion.button>

              {summary ? (
                <div className="text-xs text-gray-500">
                  Current Pending: <span className="font-semibold text-gray-800">₹ {pending}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Quick hint card */}
          <div className="bg-gray-900 text-white rounded-2xl p-4">
            <p className="text-sm font-semibold">Suggestion logic</p>
            <p className="text-xs text-white/70 mt-1">
              In backend, make <code className="text-white">/users/search</code> return users with orders first and
              include pendingAmount so admin sees “Pending ₹…” in the dropdown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
