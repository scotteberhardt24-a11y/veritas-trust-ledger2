"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 
bg-[#081120]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center 
justify-between px-6">
        
        {/* LEFT */}
        <Link
          href="/"
          className="flex items-center gap-4 transition hover:opacity-90"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full 
border border-yellow-500/40 bg-white/5 
shadow-[0_0_30px_rgba(255,215,0,0.25)]">
            <Image
              src="/veritas-shield.png"
              alt="Veritas"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span
              className="
                bg-gradient-to-r
                from-yellow-300
                via-yellow-500
                to-yellow-200
                bg-clip-text
                text-3xl
                font-black
                italic
                tracking-[0.35em]
                text-transparent
              "
              style={{
                fontFamily: "cursive",
              }}
            >
              VERITAS
            </span>

            <span className="text-xs uppercase tracking-[0.35em] 
text-slate-400">
              Trust Ledger Network
            </span>
          </div>
        </Link>

        {/* CENTER */}
        <nav className="hidden items-center gap-10 md:flex">
          {[
            "Marketplace",
            "Escrow",
            "Trust",
            "Security",
            "Disputes",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="
                text-sm
                font-medium
                tracking-wide
                text-slate-300
                transition
                hover:text-yellow-400
              "
            >
              {item}
            </a>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <button
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-200
              backdrop-blur-xl
              transition
              hover:border-yellow-500/40
              hover:bg-white/10
            "
          >
            Sign In
          </button>

          <button
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-red-600
              via-red-500
              to-yellow-500
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-[0_0_35px_rgba(255,0,0,0.35)]
              transition
              hover:scale-[1.02]
            "
          >
            <ShieldCheck className="h-4 w-4" />
            Join Veritas
          </button>
        </div>
      </div>
    </header>
  );
}
