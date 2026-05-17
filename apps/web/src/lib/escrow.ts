import { createPublicClient, createWalletClient, http } from "viem";
import { localhost } from "viem/chains";
import { parseAbi } from "viem";

export const ESCROW_ADDRESS =
  "PASTE_ESCROW_CONTRACT_ADDRESS";

export const abi = parseAbi([
  "function createJob(address worker) returns (uint256)",
  "function fundJob(uint256 jobId, uint256 amount)",
  "function startWork(uint256 jobId)",
  "function completeJob(uint256 jobId)",
  "function releasePayment(uint256 jobId)",
  "function disputeJob(uint256 jobId)",
  "function resolveDispute(uint256 jobId, bool payWorker)",
  "function getJob(uint256 jobId) view returns (tuple(address client,address worker,uint256 amount,uint256 platformFee,uint8 status,bool exists))",
]);

export const publicClient = createPublicClient({
  chain: localhost,
  transport: http("http://127.0.0.1:8545"),
});