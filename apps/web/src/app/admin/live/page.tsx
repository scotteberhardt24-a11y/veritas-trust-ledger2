"use client";

import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRealtime } from "@/hooks/useRealtime";

export default function LiveAdminPage() {
  const { events } = useRealtime();

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <div className="flex-1 p-10">
          <h1 className="text-5xl font-bold">
            Live Intelligence Feed
          </h1>

          <p className="text-zinc-400 mt-3">
            Real-time system activity stream
          </p>

          <div className="mt-10 space-y-4">
            {events.map((e, i) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl"
              >
                <p className="text-cyan-400 font-bold">
                  {e.type}
                </p>

                <pre className="text-zinc-300 text-sm mt-2">
                  {JSON.stringify(e.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}