import { autoSelectWorker } from "./autoMatch";
import { createWalletClient, http } from "viem";
import { localhost } from "viem/chains";
import { ESCROW_ADDRESS, abi } from "./escrow";

export async function createAutoJob(job: {
  title: string;
  requiredSkills: string[];
  budget: number;
}) {
  // 1. Select best worker
  const match = autoSelectWorker(job);

  const worker = match.worker;

  const walletClient = createWalletClient({
    chain: localhost,
    transport: http("http://127.0.0.1:8545"),
  });

  // 2. Create escrow job
  const tx = await walletClient.writeContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi,
    functionName: "createJob",
    args: [worker.id as `0x${string}`],
  });

  return {
    worker,
    matchScore: match.score,
    txHash: tx,
  };
}