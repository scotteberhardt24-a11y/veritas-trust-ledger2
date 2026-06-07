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
