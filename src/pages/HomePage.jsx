import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CardBtn = ({ label, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full text-left bg-white/20 hover:bg-white/25 border border-white/25 rounded-xl px-4 py-3 text-white backdrop-blur-md transition"
  >
    {label}
  </motion.button>
);

export default function HomePages() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* background (like your screenshot) */}
      <div className="absolute inset-0 bg-[url('/src/assets/background.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6"
      >
        <h1 className="text-center text-white font-semibold text-lg sm:text-xl">
          Welcome to K-Order
        </h1>

        <div className="mt-5 grid gap-3">
          <CardBtn label="Create Order" onClick={() => nav("/order")} />
          <CardBtn label="View Your Order" onClick={() => nav("/view-order")} />
          <CardBtn label="Payment Statements" onClick={() => nav("/payments")} />
          <CardBtn label="Help" onClick={() => nav("/help")} />
          <CardBtn label="About Us" onClick={() => nav("/about")} />
          <CardBtn label="Profile" onClick={() => nav("/profile")} />
        </div>
      </motion.div>
    </div>
  );
}
