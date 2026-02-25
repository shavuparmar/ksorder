import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, IndianRupee, LogOut, SwatchBook } from "lucide-react";

const links = [
  { to: "/staff", label: "Orders", icon: ClipboardList },
  { to: "/staff/payments", label: "Payments", icon: IndianRupee },
  { to: "/staff/stock-in", label: "stock", icon: SwatchBook },
];

export default function StaffSidebar({ open, onClose, onLogout }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={[
          "fixed z-50 lg:z-auto lg:static inset-y-0 left-0",
          "w-72 bg-white border-r border-gray-200",
          "transform transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b">
          <div>
            <p className="font-semibold">Korder</p>
            <p className="text-xs text-gray-500">Staff Panel</p>
          </div>
          <button className="lg:hidden text-sm px-3 py-1 rounded-lg border" onClick={onClose}>
            Close
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2 rounded-xl",
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <motion.span layoutId="staffDot" className="ml-auto w-2 h-2 rounded-full bg-white" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
