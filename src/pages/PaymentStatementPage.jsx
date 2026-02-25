import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/auth";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

function Badge({ text, tone = "neutral" }) {
  const cls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "danger"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : tone === "warn"
      ? "bg-yellow-50 text-yellow-800 border-yellow-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return <span className={"text-xs px-2 py-1 rounded-xl border " + cls}>{text}</span>;
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

export default function PaymentStatementPage() {
  const nav = useNavigate();

  const [statement, setStatement] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Filters (entries)
  const [dateOnly, setDateOnly] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        setLoading(true);

        const [payRes, orderRes] = await Promise.all([
          api.get("/payments/my"),
          api.get("/orders/my"),
        ]);

        setStatement(payRes?.data?.data || null);
        setOrders(orderRes?.data?.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load payment statement");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPaid = useMemo(() => {
    const entries = statement?.entries || [];
    return entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [statement]);

  // ✅ total payable calculated from your orders
  const totalPayable = useMemo(() => {
    return (orders || []).reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
  }, [orders]);

  const pending = useMemo(() => {
    const p = totalPayable - totalPaid;
    return p > 0 ? p : 0;
  }, [totalPayable, totalPaid]);

  const overpaid = useMemo(() => {
    const x = totalPaid - totalPayable;
    return x > 0 ? x : 0;
  }, [totalPayable, totalPaid]);

  const statusBadge = useMemo(() => {
    if (totalPayable <= 0) return { text: "—", tone: "neutral" };
    if (totalPaid <= 0) return { text: "UNPAID", tone: "danger" };
    if (pending === 0) return { text: "PAID", tone: "success" };
    return { text: "PENDING", tone: "warn" };
  }, [totalPayable, totalPaid, pending]);

  const entriesSorted = useMemo(() => {
    const list = (statement?.entries || []).slice();
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [statement]);

  const filteredEntries = useMemo(() => {
    return entriesSorted
      .filter((e) => sameLocalDate(e.date, dateOnly))
      .filter((e) => inRange(e.date, fromDate, toDate));
  }, [entriesSorted, dateOnly, fromDate, toDate]);

  const filteredTotal = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [filteredEntries]);

  const paidToday = useMemo(() => {
    const today = toInputDateValue(new Date());
    return entriesSorted
      .filter((e) => sameLocalDate(e.date, today))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [entriesSorted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <div className="p-6 bg-white border rounded-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
            onClick={() => nav(-1)}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-gray-800">Payment Statement</h1>
            <Badge text={statusBadge.text} tone={statusBadge.tone} />
          </div>

          <button
            className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>

        {err ? (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-gray-500">Total Payable</p>
            <p className="text-2xl font-semibold">₹ {totalPayable}</p>
            <p className="text-xs text-gray-400 mt-1">Calculated from your orders</p>
          </div>

          <div className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-2xl font-semibold">₹ {totalPaid}</p>
            <p className="text-xs text-gray-400 mt-1">
              Paid Today: <span className="font-semibold text-gray-700">₹{paidToday}</span>
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-gray-500">{pending > 0 ? "Pending" : "Balance"}</p>
            <p className={cx("text-2xl font-semibold", pending > 0 ? "text-rose-600" : "text-emerald-600")}>
              ₹ {pending > 0 ? pending : 0}
            </p>
            {overpaid > 0 ? (
              <p className="text-xs text-gray-400 mt-1">
                Extra Paid: <span className="font-semibold">₹{overpaid}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Offline entries updated by staff/admin</p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Payment Entries</p>
            <span className="text-xs px-2 py-1 rounded-xl bg-gray-100 border">
              Showing {filteredEntries.length} / {entriesSorted.length}
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

            <div className="ml-auto text-sm">
              <span className="text-gray-500">Filtered Total: </span>
              <span className="font-semibold">₹{filteredTotal}</span>
            </div>
          </div>
        </div>

        {/* Entries list */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">Entries</div>

          <div className="divide-y">
            {filteredEntries.slice().map((e) => (
              <div key={e._id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">₹{e.amount}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(e.date).toLocaleString("en-GB")}
                  </span>
                </div>
                {e.note ? <p className="text-xs text-gray-500 mt-1">{e.note}</p> : null}
              </div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="p-6 text-gray-500">No payment entries found</div>
            )}
          </div>
        </div>

        {/* Orders summary (optional but useful) */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">
            Orders Summary
          </div>
          <div className="divide-y">
            {(orders || []).slice(0, 15).map((o) => (
              <div key={o._id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{o.orderNo}</p>
                  <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString("en-GB")}</p>
                </div>
                <div className="text-sm font-semibold">₹{o.grandTotal}</div>
              </div>
            ))}
            {(orders || []).length === 0 && (
              <div className="p-6 text-gray-500">No orders found</div>
            )}
            {(orders || []).length > 15 ? (
              <div className="p-3 text-xs text-gray-500 bg-gray-50 border-t">
                Showing latest 15 orders.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
