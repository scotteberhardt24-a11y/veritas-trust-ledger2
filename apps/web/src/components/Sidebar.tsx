"use client";

import Link from "next/link";
import { ShieldCheck, LayoutDashboard, Wallet, Briefcase } from 
"lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] border-r 
border-yellow-500/10 bg-[#081120]/90 backdrop-blur-xl">
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="gold-glow flex h-16 w-16 items-center 
justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-red-600">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <div>
            <h1 className="text-4xl font-black italic tracking-widest 
text-white">
              VERITAS
            </h1>

            <p className="text-xs uppercase tracking-[0.3em] 
text-yellow-400">
              TRUST LEDGER
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-3 px-5">
        <Link href="/" className="glass-card rounded-2xl px-5 py-4 
hover:border-yellow-400/20">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-yellow-400" />
            Dashboard
          </div>
        </Link>

        <Link href="/escrow" className="glass-card rounded-2xl px-5 py-4 
hover:border-yellow-400/20">
          <div className="flex items-center gap-3">
            <Wallet className="text-yellow-400" />
            Escrow
          </div>
        </Link>

        <Link href="/jobs" className="glass-card rounded-2xl px-5 py-4 
hover:border-yellow-400/20">
          <div className="flex items-center gap-3">
            <Briefcase className="text-yellow-400" />
            Jobs
          </div>
        </Link>
      </nav>
    </aside>
  );
}
