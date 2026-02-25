import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import StaffSidebar from "./components/StaffSidebar";
import StaffTopbar from "./components/StaffTopbar";

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.me();
        const user = res?.data?.data;

        if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
          nav("/login", { replace: true });
          return;
        }

        setMe(user);
      } catch {
        nav("/login", { replace: true });
      }
    })();
  }, [nav]);

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem("accessToken");
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StaffSidebar open={open} onClose={() => setOpen(false)} onLogout={logout} />
      <div className="flex-1 flex flex-col">
        <StaffTopbar user={me} onOpenSidebar={() => setOpen(true)} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
