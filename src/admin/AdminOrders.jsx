import React, { useEffect, useState } from "react";
import { api } from "../api/auth";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/orders");
      setOrders(res?.data?.data || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-gray-500">Admin/Staff can view all orders.</p>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b font-semibold">All Orders</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Order No</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="p-3">{o.orderNo}</td>
                  <td className="p-3">{o.userId?.customerName || "-"}</td>
                  <td className="p-3">₹{o.grandTotal}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-gray-500">No orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
