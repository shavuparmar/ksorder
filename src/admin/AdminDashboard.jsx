import React, { useEffect, useState } from "react";
import { api } from "../api/auth";

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub ? <p className="text-xs text-gray-400 mt-2">{sub}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // If you don’t have /reports yet, this will fail — that’s okay.
    // You can later create /api/v1/reports/dashboard in backend.
    (async () => {
      try {
        const res = await api.get("/reports/dashboard");
        setStats(res?.data?.data);
      } catch {
        setStats({
          ordersToday: "-",
          monthlyOrders: "-",
          yearlyOrders: "-",
          totalPending: "-",
          totalReceived: "-",
        });
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-gray-500">
          Quick summary of orders and payments.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Orders Today" value={stats?.ordersToday ?? "-"} />
        <StatCard title="Monthly Orders" value={stats?.monthlyOrders ?? "-"} />
        <StatCard title="Yearly Orders" value={stats?.yearlyOrders ?? "-"} />
        <StatCard title="Total Received" value={stats?.totalReceived ?? "-"} />
        <StatCard title="Total Pending" value={stats?.totalPending ?? "-"} />
      </div>

      <div className="bg-white border rounded-2xl p-4">
        <h2 className="font-semibold">Admin Actions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use sidebar to manage Users, Products, Orders, Payments, and Settings.
        </p>
      </div>
    </div>
  );
}
