"use client";

import { useState } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function IdentityPage() {
  const [tokenId, setTokenId] = useState(0);

  const data = useIdentity(tokenId);

  const levelMap: any = {
    0: "NONE",
    1: "BASIC",
    2: "KYC",
    3: "BUSINESS",
    4: "ESCROW TRUSTED",
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <div className="flex-1 p-10">
          <h1 className="text-5xl font-bold">
            Identity Profile
          </h1>

          <input
            type="number"
            value={tokenId}
            onChange={(e) =>
              setTokenId(Number(e.target.value))
            }
            className="mt-6 p-3 bg-white/5 border border-white/10 rounded-xl"
            placeholder="Enter Token ID"
          />

          {!data ? (
            <p className="mt-6 text-zinc-400">
              Loading identity...
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-10">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h2 className="text-2xl font-bold">
                  {data.metadata.name}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {data.metadata.description}
                </p>

                <div className="mt-6">
                  <p className="text-zinc-400">
                    Verification Level
                  </p>

                  <p className="text-3xl font-bold text-cyan-400">
                    {levelMap[data.level]}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h2 className="text-xl font-bold">
                  Attributes
                </h2>

                <div className="mt-4 space-y-3">
                  {data.metadata.attributes?.map(
                    (attr: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b border-white/10 pb-2"
                      >
                        <span className="text-zinc-400">
                          {attr.trait_type}
                        </span>
                        <span>
                          {attr.value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}