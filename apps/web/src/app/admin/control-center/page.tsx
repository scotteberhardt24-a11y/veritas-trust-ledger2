"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  calculateRisk,
  trustScore,
  Worker,
  Job,
} from "@/lib/adminMetrics";
import { flagWorker } from "@/lib/adminActions";

export default function AdminControlCenter() {
  const [selectedWorker, setSelectedWorker] =
    useState<Worker | null>(null);

  // -----------------------------
  // MOCK DATA (replace with API later)
  // -----------------------------
  const workers: Worker[] = useMemo(
    () => [
      {
        id: "0x1",
        name: "Alice",
        completedJobs: 12,
        disputes: 0,
        rating: 4.9,
        earnings: 12000,
      },
      {
        id: "0x2",
        name: "Bob",
        completedJobs: 2,
        disputes: 3,
        rating: 3.1,
        earnings: 800,
      },
      {
        id: "0x3",
        name: "Charlie",
        completedJobs: 7,
        disputes: 1,
        rating: 4.2,
        earnings: 5000,
      },
    ],
    []
  );

  const jobs: Job[] = useMemo(
    () => [
      {
        id: 1,
        worker: "Alice",
        client: "Client A",
        amount: 500,
        status: "active",
      },
      {
        id: 2,
        worker: "Bob",
        client: "Client B",
        amount: 120,
        status: "disputed",
      },
    ],
    []
  );

  // -----------------------------
  // METRICS
  // -----------------------------
  const systemStats = useMemo(() => {
    return {
      totalWorkers: workers.length,
      avgTrust: Math.round(
        workers.reduce(
          (acc, w) => acc + trustScore(w),
          0
        ) / workers.length
      ),
      avgRisk: Math.round(
        workers.reduce(
          (acc, w) => acc + calculateRisk(w),
          0
        ) / workers.length
      ),
      activeJobs: jobs.filter(
        (j) => j.status === "active"
      ).length,
      disputedJobs: jobs.filter(
        (j) => j.status === "disputed"
      ).length,
    };
  }, [workers, jobs]);

  // -----------------------------
  // ACTIONS
  // -----------------------------
  async function handleFlag(worker: Worker) {
    await flagWorker(worker.id);
    alert(`Worker flagged: ${worker.name}`);
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        {/* MAIN */}
        <div className="flex-1 p-10 space-y-10">
          {/* HEADER */}
          <div>
            <h1 className="text-5xl font-bold">
              Admin Control Center
            </h1>

            <p className="text-zinc-400 mt-3">
              Live platform intelligence and trust enforcement system.
            </p>
          </div>

          {/* SYSTEM METRICS */}
          <div className="grid grid-cols-5 gap-4">
            <MetricCard
              label="Workers"
              value={systemStats.totalWorkers}
            />
            <MetricCard
              label="Avg Trust"
              value={systemStats.avgTrust}
            />
            <MetricCard
              label="Avg Risk"
              value={systemStats.avgRisk}
            />
            <MetricCard
              label="Active Jobs"
              value={systemStats.activeJobs}
            />
            <MetricCard
              label="Disputes"
              value={systemStats.disputedJobs}
            />
          </div>

          {/* WORKER TABLE */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Worker Intelligence Table
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-zinc-400">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Trust Score</th>
                    <th className="p-2">Risk</th>
                    <th className="p-2">Jobs</th>
                    <th className="p-2">Rating</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {workers.map((w) => (
                    <tr
                      key={w.id}
                      className="border-t border-white/10"
                    >
                      <td className="p-2 font-semibold">
                        {w.name}
                      </td>

                      <td className="p-2 text-cyan-400">
                        {trustScore(w)}
                      </td>

                      <td className="p-2 text-red-400">
                        {calculateRisk(w)}
                      </td>

                      <td className="p-2">
                        {w.completedJobs}
                      </td>

                      <td className="p-2">
                        {w.rating}
                      </td>

                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedWorker(w)
                          }
                          className="px-3 py-1 rounded-lg bg-white/10"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() =>
                            handleFlag(w)
                          }
                          className="px-3 py-1 rounded-lg bg-red-500 text-black"
                        >
                          Flag
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* JOB MONITOR */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Live Job Monitor
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/10"
                >
                  <p className="text-lg font-bold">
                    Job #{j.id}
                  </p>

                  <p className="text-zinc-400">
                    Worker: {j.worker}
                  </p>

                  <p className="text-zinc-400">
                    Client: {j.client}
                  </p>

                  <p className="text-zinc-400">
                    Amount: ${j.amount}
                  </p>

                  <p
                    className={
                      j.status === "disputed"
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    Status: {j.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* INSPECT PANEL */}
          {selectedWorker && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h2 className="text-2xl font-bold">
                Worker Inspector
              </h2>

              <p className="text-zinc-400 mt-2">
                {selectedWorker.name}
              </p>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <Info label="Trust Score" value={trustScore(selectedWorker)} />
                <Info label="Risk Score" value={calculateRisk(selectedWorker)} />
                <Info label="Earnings" value={`$${selectedWorker.earnings}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// -----------------------------
// UI HELPERS
// -----------------------------
function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-zinc-400 text-sm">
        {label}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
      <p className="text-zinc-400 text-sm">
        {label}
      </p>

      <p className="text-xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}