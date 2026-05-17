"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { matchWorkers } from "@/lib/matchingEngine";
import { workers } from "@/lib/workers";

export default function Marketplace() {
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState(50);

  const results = matchWorkers(
    {
      title: jobTitle,
      requiredSkills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budget,
    },
    workers
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <div className="flex-1 p-10">
          <h1 className="text-5xl font-bold">
            AI Workforce Engine
          </h1>

          <p className="text-zinc-400 mt-4">
            Enter a job and Veritas will instantly rank the best workers.
          </p>

          {/* JOB INPUT */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <input
              placeholder="Job title"
              value={jobTitle}
              onChange={(e) =>
                setJobTitle(e.target.value)
              }
              className="p-3 bg-white/5 border border-white/10 rounded-xl"
            />

            <input
              placeholder="Required skills (comma separated)"
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
              placeholder="Budget"
            />
          </div>

          {/* RESULTS */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {results.map((r) => (
              <div
                key={r.worker.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-6"
              >
                <h2 className="text-2xl font-bold">
                  {r.worker.name}
                </h2>

                <p className="text-zinc-400 mt-2">
                  Skills: {r.worker.skills.join(", ")}
                </p>

                <p className="mt-4 text-cyan-400 font-bold">
                  Match Score: {r.score}
                </p>

                <p className="text-zinc-400">
                  $ {r.worker.hourlyRate}/hr
                </p>

                <button className="mt-6 w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold">
                  Hire Worker
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}