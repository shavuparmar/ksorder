import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

function toInputDateValue(date) {
  // returns YYYY-MM-DD in local timezone
  const d = new Date(date);
  const tzOff = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOff).toISOString().slice(0, 10);
}

function isSameLocalDate(orderDate, selectedYYYYMMDD) {
  if (!selectedYYYYMMDD) return true; // no filter
  const d = new Date(orderDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const local = `${y}-${m}-${day}`;
  return local === selectedYYYYMMDD;
}

export default function ViewOrderPage() {
  const nav = useNavigate();

  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected date in YYYY-MM-DD (from <input type="date" />)
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/my");
        setOrders(res?.data?.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => isSameLocalDate(o.createdAt, selectedDate));
  }, [orders, selectedDate]);

  // Optional: sort newest first
  const sortedFilteredOrders = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredOrders]);

  const totalAmount = useMemo(() => {
    return sortedFilteredOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  }, [sortedFilteredOrders]);

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
            onClick={() => nav(-1)}
          >
            ← Back
          </button>
          <h1 className="font-semibold text-gray-800">View Your Orders</h1>
          <button
            className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
            onClick={() => nav("/order")}
          >
            + New Order
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 bg-white border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              className="w-full sm:w-72 border rounded-xl px-3 py-2 text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Select a date to show orders only from that day.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
              onClick={() => setSelectedDate(toInputDateValue(new Date()))}
            >
              Today
            </button>
            <button
              className="text-sm px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
              onClick={() => setSelectedDate("")}
              disabled={!selectedDate}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-semibold">{sortedFilteredOrders.length}</span>{" "}
            order(s)
            {selectedDate ? (
              <>
                {" "}for{" "}
                <span className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString("en-GB")}
                </span>
              </>
            ) : (
              <>
                {" "}from{" "}
                <span className="font-semibold">all dates</span>
              </>
            )}
          </div>

          <div className="text-sm text-gray-700">
            Total Amount:{" "}
            <span className="font-semibold">₹{totalAmount}</span>
          </div>
        </div>

        {err ? (
          <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        {/* Orders List */}
        <div className="mt-4 bg-white border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">
            {selectedDate ? "Orders on Selected Date" : "Recent Orders"}
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">Loading...</div>
          ) : (
            <div className="divide-y">
              {sortedFilteredOrders.map((o) => (
                <div key={o._id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {o.orderNo}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-lg bg-gray-100">
                      {o.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(o.createdAt).toLocaleString("en-GB")}
                  </p>

                  <div className="mt-2 text-sm text-gray-700">
                    Total:{" "}
                    <span className="font-semibold">₹{o.grandTotal}</span>
                  </div>

                  <div className="mt-2 grid gap-1">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        {it.name} × {it.qty} = ₹{(it.price || 0) * (it.qty || 0)}
                      </div>
                    ))}
                  </div>

                  {/* Optional: Edit button (if you want update order) */}
                  <div className="mt-3 flex gap-2">
                    <button
                      className="text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
                      onClick={() => nav(`/order?orderId=${o._id}`)}
                    >
                      Edit Order
                    </button>
                  </div>
                </div>
              ))}

              {sortedFilteredOrders.length === 0 && (
                <div className="p-6 text-gray-500">
                  {selectedDate
                    ? "No orders found for this date."
                    : "No orders found."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
