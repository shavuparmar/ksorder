import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { sidebarLinks, logoutLink } from "../sidebarLinks";

export default function AdminSidebar({ open, onClose, onLogout }) {
  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed z-50 lg:z-auto lg:static inset-y-0 left-0",
          "w-72 bg-white border-r border-gray-200",
          "transform transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              K
            </div>
            <div>
              <p className="font-semibold leading-4">K-order</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <button
            className="lg:hidden text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Links */}
        <nav className="p-3">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu
          </p>

          <div className="space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2 rounded-xl",
                      "transition",
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")
                  }
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>

                      {/* Minimal active indicator */}
                      {isActive && (
                        <motion.span
                          layoutId="activeDot"
                          className="ml-auto w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
            >
              <logoutLink.icon size={18} />
              <span className="text-sm font-medium">{logoutLink.label}</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Korder</p>
        </div>
      </aside>
    </>
  );
}
