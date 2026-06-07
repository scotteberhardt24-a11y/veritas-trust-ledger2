"use client";

import { ShieldCheck, Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed left-[280px] right-0 top-0 z-40 border-b 
border-yellow-500/10 bg-[#081120]/80 backdrop-blur-xl">
      <div className="flex h-24 items-center justify-between px-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-widest 
text-white">
            VERITAS
          </h1>

          <p className="text-xs uppercase tracking-[0.3em] 
text-yellow-400">
            Secure Trust Infrastructure
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 rounded-2xl border 
border-white/10 bg-white/5 px-5 py-3">
            <Search className="h-4 w-4 text-yellow-400" />

            <input
              placeholder="Search..."
              className="bg-transparent outline-none"
            />
          </div>

          <button className="glass-card rounded-2xl p-4 
hover:border-yellow-400/20">
            <Bell className="text-yellow-400" />
          </button>

          <div className="glass-card flex items-center gap-4 rounded-2xl 
px-5 py-3">
            <div className="flex h-12 w-12 items-center justify-center 
rounded-full bg-gradient-to-br from-yellow-400 to-red-600">
              <ShieldCheck className="text-white" />
            </div>

            <div>
              <p className="font-bold text-white">
                Veritas Admin
              </p>

              <p className="text-sm text-white/50">
                Trusted Identity
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
