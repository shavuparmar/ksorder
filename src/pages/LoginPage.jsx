import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const isEmail = form.id.includes("@");
      const payload = isEmail
        ? { email: form.id, password: form.password }
        : { customerNumber: form.id, password: form.password };

      const res = await authAPI.login(payload);

      const accessToken = res?.data?.data?.accessToken;
      const user = res?.data?.data?.user;

      // optional for app usage
      if (accessToken) localStorage.setItem("accessToken", accessToken);

      // ✅ redirect by role
      if (user?.role === "ADMIN") nav("/admin", { replace: true });
      else if (user?.role === "STAFF") nav("/staff", { replace: true });
      else nav("/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/src/assets/background.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/40" />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-6 text-white"
      >
        <h1 className="text-center text-lg font-semibold">Login</h1>
        <p className="text-center text-xs text-white/70 mt-1">
          Email or Customer Number
        </p>

        {err ? (
          <div className="mt-4 text-sm bg-red-500/20 border border-red-500/40 rounded-xl p-2">
            {err}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          <input
            className="w-full bg-white/15 border border-white/25 rounded-xl px-3 py-2 outline-none placeholder:text-white/60"
            placeholder="Email or Customer Number"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />

          <input
            type="password"
            className="w-full bg-white/15 border border-white/25 rounded-xl px-3 py-2 outline-none placeholder:text-white/60"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            disabled={loading}
            className="w-full bg-white text-black rounded-xl py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-xs text-white/70 mt-4 text-center">
          Account is created by Admin only.
        </p>
      </motion.form>
    </div>
  );
}
