import { useEffect, useState } from "react";
import { api } from "../Api/auth";

export default function InvoiceModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/orders/${orderId}/invoice`);
      setOrder(res.data.data);
    })();
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <p className="font-semibold">Invoice / Bill</p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-3 py-1.5 rounded-xl border">Print</button>
            <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-black text-white">Close</button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="text-lg font-bold">Korder</p>
              <p className="text-xs text-gray-500">Offline Billing Statement</p>
            </div>
            <div className="text-right text-sm">
              <p><b>Order:</b> {order.orderNo}</p>
              <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
              <p><b>Status:</b> {order.status}</p>
            </div>
          </div>

          <div className="border rounded-xl p-3 text-sm">
            <p className="font-semibold mb-1">Customer</p>
            <p>{order.userId.customerName} ({order.userId.customerNumber})</p>
            <p className="text-gray-600">{order.userId.email}</p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold p-3">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 p-3 text-sm border-t">
                <div className="col-span-6">{it.name}</div>
                <div className="col-span-2 text-right">₹ {it.price}</div>
                <div className="col-span-2 text-right">{it.qty}</div>
                <div className="col-span-2 text-right">₹ {it.price * it.qty}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <div className="w-full sm:w-72 border rounded-xl p-3 text-sm space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><b>₹ {order.subtotal}</b></div>
              <div className="flex justify-between"><span>Grand Total</span><b>₹ {order.grandTotal}</b></div>
            </div>
          </div>

          {order.note ? <div className="text-xs text-gray-500">Note: {order.note}</div> : null}
        </div>
      </div>
    </div>
  );
}
