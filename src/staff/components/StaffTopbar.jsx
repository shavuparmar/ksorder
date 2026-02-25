import React from "react";
import { Menu } from "lucide-react";

export default function StaffTopbar({ user, onOpenSidebar }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onOpenSidebar} className="lg:hidden p-2 rounded-lg border hover:bg-gray-50">
          <Menu size={18} />
        </button>
        <div>
          <p className="font-semibold leading-4">Staff Panel</p>
          <p className="text-xs text-gray-500">Orders & Payments</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.firstName || "Staff"}</p>
          <p className="text-xs text-gray-500">{user?.role || "STAFF"}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
          {(user?.firstName?.[0] || "S").toUpperCase()}
        </div>
      </div>
    </header>
  );
}
