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
