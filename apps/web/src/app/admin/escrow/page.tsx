"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ESCROW_ADDRESS, abi } from "@/lib/escrow";
import { createWalletClient, http } from "viem";
import { localhost } from "viem/chains";

export default function AdminEscrow() {
  const [jobId, setJobId] = useState(0);
  const [payWorker, setPayWorker] = useState(true);

  const walletClient = createWalletClient({
    chain: localhost,
    transport: http("http://127.0.0.1:8545"),
  });

  async function resolveDispute() {
    await walletClient.writeContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "resolveDispute",
      args: [BigInt(jobId), payWorker],
    });
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <div className="flex-1 p-10">
          <h1 className="text-5xl font-bold">
            Arbitration Center
          </h1>

          <p className="text-zinc-400 mt-4">
            Resolve disputes and enforce trust.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <input
              type="number"
              value={jobId}
              onChange={(e) =>
                setJobId(Number(e.target.value))
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <select
              value={payWorker ? "yes" : "no"}
              onChange={(e) =>
                setPayWorker(e.target.value === "yes")
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            >
              <option value="yes">Pay Worker</option>
              <option value="no">Refund Client</option>
            </select>

            <button
              onClick={resolveDispute}
              className="bg-red-500 text-black font-bold rounded-xl"
            >
              Resolve Dispute
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}