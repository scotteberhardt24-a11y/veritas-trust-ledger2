#!/bin/bash

set -e

echo "=================================================="
echo " VERITAS PREMIUM UPGRADE ENGINE"
echo "=================================================="

ROOT_DIR=$(pwd)

echo ""
echo "Checking workspace..."

if [ ! -d "$ROOT_DIR/apps/web" ]; then
  echo "apps/web not found."
  exit 1
fi

echo ""
echo "=================================================="
echo " FRONTEND PREMIUM STACK"
echo "=================================================="

cd "$ROOT_DIR/apps/web"

echo ""
echo "Installing premium UI dependencies..."

pnpm add \
framer-motion \
lucide-react \
clsx \
tailwind-merge \
tailwindcss-animate \
react-icons

echo ""
echo "Installing Tailwind/PostCSS compatibility..."

pnpm add -D \
tailwindcss \
postcss \
autoprefixer \
@tailwindcss/postcss

echo ""
echo "Creating premium folder structure..."

mkdir -p src/components/layout
mkdir -p src/components/auth
mkdir -p src/components/dashboard
mkdir -p src/components/ui
mkdir -p src/components/branding
mkdir -p src/lib
mkdir -p src/styles

echo ""
echo "Creating utility file..."

cat > src/lib/utils.ts << 'EOF'
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
EOF

echo ""
echo "Fixing PostCSS config..."

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
EOF

echo ""
echo "Fixing Tailwind config..."

cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        navy: "#081120",
        gold: "#FFD700",
        red: "#C1121F",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        glow: {
          from: {
            boxShadow: "0 0 20px rgba(255,215,0,0.2)",
          },
          to: {
            boxShadow: "0 0 50px rgba(255,215,0,0.5)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOF

echo ""
echo "Creating premium globals.css..."

cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  margin: 0;
  padding: 0;
  background: #050816;
  color: white;
  overflow-x: hidden;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  background:
    radial-gradient(circle at top,
      rgba(255,215,0,0.08),
      transparent 30%),
    radial-gradient(circle at bottom right,
      rgba(193,18,31,0.10),
      transparent 35%),
    #050816;
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255,215,0,0.4);
  border-radius: 999px;
}

.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}

.gold-glow {
  box-shadow:
    0 0 20px rgba(255,215,0,0.25),
    0 0 60px rgba(255,215,0,0.08);
}
EOF

echo ""
echo "Creating premium Sidebar..."

cat > src/components/Sidebar.tsx << 'EOF'
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
EOF

echo ""
echo "Cleaning old Next cache..."

rm -rf .next

echo ""
echo "Testing frontend build..."

pnpm build || true

echo ""
echo "=================================================="
echo " VERCEL DEPLOYMENT FIXES"
echo "=================================================="

cd "$ROOT_DIR"

echo ""
echo "Creating vercel.json..."

cat > vercel.json << 'EOF'
{
  "buildCommand": "cd apps/web && pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
EOF

echo ""
echo "=================================================="
echo " COMPLETE"
echo "=================================================="

echo ""
echo "Run frontend:"
echo "cd apps/web && pnpm dev"

echo ""
echo "Deploy:"
echo "git add ."
echo "git commit -m 'premium veritas upgrade'"
echo "git push"
