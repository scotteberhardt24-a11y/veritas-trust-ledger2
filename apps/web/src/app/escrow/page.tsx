"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ESCROW_ADDRESS, abi } from "@/lib/escrow";
import { createWalletClient, http } from "viem";
import { localhost } from "viem/chains";

export default function EscrowPage() {
  const [jobId, setJobId] = useState(0);
  const [worker, setWorker] = useState("");
  const [amount, setAmount] = useState(0);

  const walletClient = createWalletClient({
    chain: localhost,
    transport: http("http://127.0.0.1:8545"),
  });

  // -----------------------
  // CREATE JOB
  // -----------------------
  async function createJob() {
    await walletClient.writeContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "createJob",
      args: [worker as `0x${string}`],
    });
  }

  // -----------------------
  // FUND JOB
  // -----------------------
  async function fundJob() {
    await walletClient.writeContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "fundJob",
      args: [BigInt(jobId), BigInt(amount)],
    });
  }

  // -----------------------
  // START WORK
  // -----------------------
  async function startWork() {
    await walletClient.writeContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "startWork",
      args: [BigInt(jobId)],
    });
  }

  // -----------------------
  // COMPLETE JOB
  // -----------------------
  async function completeJob() {
    await walletClient.writeContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "completeJob",
      args: [BigInt(jobId)],
    });
  }

  // -----------------------
  // RELEASE PAYMENT
  // -----------------------
  async function releasePayment() {
    await walletClient.writeContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "releasePayment",
      args: [BigInt(jobId)],
    });
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <div className="flex-1 p-10">
          <h1 className="text-5xl font-bold">
            Escrow Control Center
          </h1>

          <p className="text-zinc-400 mt-4">
            Manage job funding, execution, and payouts.
          </p>

          {/* JOB CREATION */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <input
              placeholder="Worker address"
              value={worker}
              onChange={(e) =>
                setWorker(e.target.value)
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <button
              onClick={createJob}
              className="bg-cyan-500 text-black font-bold rounded-xl"
            >
              Create Job
            </button>
          </div>

          {/* FUNDING */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Job ID"
              value={jobId}
              onChange={(e) =>
                setJobId(Number(e.target.value))
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) =>
                setAmount(Number(e.target.value))
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <button
              onClick={fundJob}
              className="bg-green-500 text-black font-bold rounded-xl"
            >
              Fund Job
            </button>
          </div>

          {/* ACTIONS */}
          <div className="mt-10 grid grid-cols-4 gap-4">
            <button
              onClick={startWork}
              className="bg-yellow-500 text-black font-bold rounded-xl p-3"
            >
              Start Work
            </button>

            <button
              onClick={completeJob}
              className="bg-blue-500 text-black font-bold rounded-xl p-3"
            >
              Complete
            </button>

            <button
              onClick={releasePayment}
              className="bg-purple-500 text-white font-bold rounded-xl p-3"
            >
              Release Payment
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}