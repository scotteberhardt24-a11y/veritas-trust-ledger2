"use client";

import { useState } from "react";
import { publicClient, ESCROW_ADDRESS, abi } from "@/lib/escrow";

export function useEscrow() {
  const [loading, setLoading] = useState(false);

  async function getJob(jobId: number) {
    return await publicClient.readContract({
      address: ESCROW_ADDRESS as `0x${string}`,
      abi,
      functionName: "getJob",
      args: [BigInt(jobId)],
    });
  }

  return {
    loading,
    getJob,
  };
}