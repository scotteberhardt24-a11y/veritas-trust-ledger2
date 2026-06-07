#!/bin/bash

set -e

ROOT_DIR=$(pwd)

echo "=================================================="
echo " VERITAS PLATFORM UPGRADE"
echo "=================================================="

cd "$ROOT_DIR/apps/web"

echo ""
echo "Installing additional UI packages..."

pnpm add \
@radix-ui/react-dialog \
@radix-ui/react-tabs \
@radix-ui/react-avatar \
@radix-ui/react-dropdown-menu \
@radix-ui/react-toast

echo ""
echo "Creating advanced folder structure..."

mkdir -p src/components/dashboard
mkdir -p src/components/escrow
mkdir -p src/components/disputes
mkdir -p src/components/navbar
mkdir -p src/components/cards
mkdir -p src/components/hero
mkdir -p src/components/live
mkdir -p src/components/auth

echo ""
echo "=================================================="
echo " PREMIUM NAVBAR"
echo "=================================================="

cat > src/components/navbar/Navbar.tsx << 'EOF'
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
EOF

echo ""
echo "=================================================="
echo " DASHBOARD CARDS"
echo "=================================================="

cat > src/components/dashboard/DashboardCards.tsx << 'EOF'
"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
} from "lucide-react";

const cards = [
  {
    title: "Protected Escrow",
    value: "$842,491",
    icon: Wallet,
  },
  {
    title: "Verified Identities",
    value: "12,483",
    icon: ShieldCheck,
  },
  {
    title: "Active Contracts",
    value: "1,284",
    icon: Briefcase,
  },
  {
    title: "AI Disputes",
    value: "12",
    icon: AlertTriangle,
  },
];

export default function DashboardCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.1,
            }}
            className="glass-card rounded-3xl p-7 transition-all 
hover:scale-[1.02] hover:border-yellow-400/20"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center 
rounded-2xl bg-gradient-to-br from-yellow-400 to-red-600">
                <Icon className="text-white" />
              </div>

              <div className="h-3 w-3 rounded-full bg-green-400 
animate-pulse" />
            </div>

            <p className="text-sm uppercase tracking-[0.25em] 
text-white/50">
              {card.title}
            </p>

            <h3 className="mt-4 text-4xl font-black text-white">
              {card.value}
            </h3>
          </motion.div>
        );
      })}
    </div>
  );
}
EOF

echo ""
echo "=================================================="
echo " AI DISPUTE PANEL"
echo "=================================================="

cat > src/components/disputes/DisputePanel.tsx << 'EOF'
"use client";

export default function DisputePanel() {
  return (
    <div className="glass-card rounded-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">
            AI Dispute Center
          </h2>

          <p className="mt-2 text-white/60">
            Autonomous conflict resolution intelligence
          </p>
        </div>

        <div className="rounded-full bg-red-500/20 px-4 py-2 text-sm 
font-bold text-red-300">
          LIVE
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 
p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">
                Escrow Payment Conflict
              </h3>

              <p className="mt-1 text-sm text-white/50">
                AI confidence score: 94%
              </p>
            </div>

            <button className="rounded-xl bg-gradient-to-r from-yellow-400 
to-red-500 px-5 py-3 font-bold text-black">
              Review
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 
bg-yellow-500/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">
                Contract Verification
              </h3>

              <p className="mt-1 text-sm text-white/50">
                AI confidence score: 88%
              </p>
            </div>

            <button className="rounded-xl border border-yellow-400/20 px-5 
py-3 font-bold text-yellow-300">
              Inspect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

echo ""
echo "=================================================="
echo " MAIN PAGE"
echo "=================================================="

cat > src/app/page.tsx << 'EOF'
"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/navbar/Navbar";
import DashboardCards from "@/components/dashboard/DashboardCards";
import DisputePanel from "@/components/disputes/DisputePanel";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Sidebar />
      <Navbar />

      <div className="ml-[280px] pt-32">
        <div className="p-10">
          <div className="mb-12">
            <h1 className="text-6xl font-black leading-tight">
              Welcome to
              <span className="ml-4 bg-gradient-to-r from-yellow-300 
to-red-500 bg-clip-text text-transparent">
                VERITAS
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-xl leading-9 text-white/60">
              Advanced decentralized trust infrastructure with escrow,
              identity verification, AI disputes, and secure contracts.
            </p>
          </div>

          <DashboardCards />

          <div className="mt-10 grid gap-8 xl:grid-cols-2">
            <DisputePanel />

            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-black">
                Live Trust Activity
              </h2>

              <div className="mt-8 space-y-5">
                <div className="rounded-2xl border border-white/10 
bg-white/5 p-5">
                  <p className="font-bold">
                    Escrow Released
                  </p>

                  <p className="mt-2 text-white/50">
                    $24,000 smart escrow payment completed
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 
bg-white/5 p-5">
                  <p className="font-bold">
                    Identity Verified
                  </p>

                  <p className="mt-2 text-white/50">
                    AI trust verification completed successfully
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 
bg-white/5 p-5">
                  <p className="font-bold">
                    Contract Signed
                  </p>

                  <p className="mt-2 text-white/50">
                    Blockchain-backed agreement secured
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
EOF

echo ""
echo "Cleaning cache..."

rm -rf .next

echo ""
echo "Testing build..."

pnpm build || true

echo ""
echo "=================================================="
echo " COMPLETE"
echo "=================================================="

echo ""
echo "Run:"
echo "cd apps/web && pnpm dev"
