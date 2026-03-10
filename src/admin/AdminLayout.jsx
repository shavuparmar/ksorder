import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { authAPI } from "../api/auth";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [me, setMe] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.me();
        const user = res?.data?.data;

        if (!user || user.role !== "ADMIN") {
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
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem("accessToken");
    nav("/login", { replace: true });
  };

  

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        <AdminTopbar onOpenSidebar={() => setSidebarOpen(true)} user={me} />

        <main className="p-4 lg:p-6">
          <Outlet context={{ me }} />
        </main>
      </div>
    </div>
  );
}
