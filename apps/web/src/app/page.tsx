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
