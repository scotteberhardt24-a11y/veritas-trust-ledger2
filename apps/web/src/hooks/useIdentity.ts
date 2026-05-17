"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";
import { resolveIPFS } from "@/lib/ipfs";

const client = createPublicClient({
  chain: localhost,
  transport: http("http://127.0.0.1:8545"),
});

export function useIdentity(tokenId: number) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const tokenURI = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ABI,
          functionName: "tokenURI",
          args: [BigInt(tokenId)],
        });

        const url = resolveIPFS(tokenURI as string);

        const metadata = await fetch(url).then((r) =>
          r.json()
        );

        const level = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ABI,
          functionName: "getVerificationLevel",
          args: [BigInt(tokenId)],
        });

        setData({
          metadata,
          level: Number(level),
        });
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [tokenId]);

  return data;
}