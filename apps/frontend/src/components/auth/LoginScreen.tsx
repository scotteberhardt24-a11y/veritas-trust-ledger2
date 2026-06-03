"use client";

import Image from "next/image";

export default function LoginScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center 
overflow-hidden bg-[#050816] px-6">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute left-[-120px] top-[-120px] h-[420px] 
w-[420px] rounded-full bg-blue-700/30 blur-[140px]" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[420px] 
w-[420px] rounded-full bg-red-700/20 blur-[140px]" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] 
-translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 
blur-[120px]" />

      {/* CARD */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-[32px]
          border
          border-white/10
          bg-white/5
          p-10
          shadow-[0_0_60px_rgba(0,0,0,0.65)]
          backdrop-blur-3xl
        "
      >
        
        {/* LOGO */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-5 h-28 w-28 overflow-hidden 
rounded-full border border-yellow-500/40 
shadow-[0_0_40px_rgba(255,215,0,0.25)]">
            <Image
              src="/veritas-shield.png"
              alt="Veritas"
              fill
              className="object-cover"
            />
          </div>

          <h1
            className="
              bg-gradient-to-r
              from-yellow-300
              via-yellow-500
              to-yellow-200
              bg-clip-text
              text-5xl
              font-black
              italic
              tracking-[0.25em]
              text-transparent
            "
            style={{
              fontFamily: "cursive",
            }}
          >
            VERITAS
          </h1>

          <p className="mt-3 text-center text-sm text-slate-400">
            Secure Identity • Trust • Escrow • Reputation
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#0B1324]
                px-5
                py-4
                text-white
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-yellow-500/50
                focus:ring-2
                focus:ring-yellow-500/20
              "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#0B1324]
                px-5
                py-4
                text-white
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-yellow-500/50
                focus:ring-2
                focus:ring-yellow-500/20
              "
            />
          </div>

          <button
            className="
              mt-4
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-red-600
              via-red-500
              to-yellow-500
              py-4
              text-sm
              font-bold
              uppercase
              tracking-[0.2em]
              text-white
              shadow-[0_0_40px_rgba(255,0,0,0.35)]
              transition
              hover:scale-[1.01]
            "
          >
            Access Veritas
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center">
          <button className="text-sm text-slate-400 transition 
hover:text-yellow-400">
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
