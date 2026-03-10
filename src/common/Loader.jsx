import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* soft background glow */}
      <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl"></div>

      {/* center loader */}
      <div className="relative flex items-center justify-center">
        {/* rotating ring */}
        <div className="absolute w-36 h-36 rounded-full border-4 border-dashed border-cyan-400/40 animate-spin"></div>

        {/* big K */}
        <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg z-10">
          <span className="text-5xl font-extrabold text-cyan-400">K</span>
        </div>
      </div>

      {/* brand text */}
      <h1 className="mt-8 text-2xl font-bold tracking-wide">K-order</h1>
      {/* <p className="mt-1 text-sm text-slate-400 tracking-[0.2em] uppercase">
        Private Software
      </p> */}

      {/* loading text */}
      <div className="mt-6 flex items-center gap-1 text-slate-300 text-sm font-medium">
        <span>Loading</span>
        <span className="animate-bounce [animation-delay:0s]">.</span>
        <span className="animate-bounce [animation-delay:0.15s]">.</span>
        <span className="animate-bounce [animation-delay:0.3s]">.</span>
      </div>

      {/* progress bar */}
      <div className="mt-5 w-56 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-cyan-400 rounded-full animate-[loadingBar_1.8s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
            width: 40%;
          }
          50% {
            transform: translateX(60%);
            width: 55%;
          }
          100% {
            transform: translateX(180%);
            width: 40%;
          }
        }
      `}</style>
    </div>
  );
}