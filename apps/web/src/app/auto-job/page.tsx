"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createAutoJob } from "@/lib/jobOrchestrator";

export default function AutoJobPage() {
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState(50);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);

    try {
      const res = await createAutoJob({
        title,
        requiredSkills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        budget,
      });

      setResult(res);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <div className="flex-1 p-10">
          <h1 className="text-5xl font-bold">
            AI Auto-Matching Engine
          </h1>

          <p className="text-zinc-400 mt-4">
            Create a job — Veritas automatically selects a worker and opens escrow.
          </p>

          {/* INPUT */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <input
              placeholder="Job title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <input
              placeholder="Skills (comma separated)"
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <input
              type="number"
              value={budget}
              onChange={(e) =>
                setBudget(Number(e.target.value))
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />
          </div>

          {/* ACTION */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-6 bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl"
          >
            {loading ? "Creating..." : "Create Auto Job"}
          </button>

          {/* RESULT */}
          {result && (
            <div className="mt-10 bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h2 className="text-2xl font-bold">
                Auto Match Result
              </h2>

              <p className="text-zinc-400 mt-2">
                Worker: {result.worker.name}
              </p>

              <p className="text-cyan-400 font-bold mt-2">
                Match Score: {result.matchScore}
              </p>

              <p className="text-zinc-400 mt-2">
                Transaction: {result.txHash?.hash || "pending"}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}