import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authAPI } from "../api/auth";

export default function ProtectedRouted({ children, allowRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.me();
        setMe(res?.data?.data || null);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  // 🚨 NOT LOGGED IN → ALWAYS LOGIN PAGE
  if (!me) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚨 LOGGED IN BUT WRONG ROLE
  if (allowRoles.length > 0 && !allowRoles.includes(me.role)) {
    // redirect to correct dashboard based on role
    if (me.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (me.role === "STAFF") return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />; // USER home
  }

  return children;
}
