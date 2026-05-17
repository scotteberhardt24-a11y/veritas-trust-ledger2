import { ethers } from "ethers";
import { createWSServer } from "./ws.js";

// --------------------------
// CONFIG
// --------------------------
const RPC_URL = "http://127.0.0.1:8545";
const ESCROW_ADDRESS = "PASTE_ESCROW_CONTRACT_ADDRESS";

// Minimal ABI (ONLY events)
const ABI = [
  "event JobCreated(uint256 indexed jobId, address indexed client, address indexed worker)",
  "event JobFunded(uint256 indexed jobId, uint256 amount)",
  "event JobCompleted(uint256 indexed jobId)",
  "event PaymentReleased(uint256 indexed jobId, address worker)",
  "event JobDisputed(uint256 indexed jobId)",
];

// --------------------------
// START LISTENER
// --------------------------
export async function startChainListener(wsBroadcast) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const contract = new ethers.Contract(
    ESCROW_ADDRESS,
    ABI,
    provider
  );

  console.log("🔗 Blockchain listener active...");

  // --------------------------
  // JOB CREATED
  // --------------------------
  contract.on("JobCreated", (jobId, client, worker) => {
    wsBroadcast("JOB_CREATED", {
      jobId: jobId.toString(),
      client,
      worker,
    });
  });

  // --------------------------
  // JOB FUNDED
  // --------------------------
  contract.on("JobFunded", (jobId, amount) => {
    wsBroadcast("JOB_FUNDED", {
      jobId: jobId.toString(),
      amount: amount.toString(),
    });
  });

  // --------------------------
  // JOB COMPLETED
  // --------------------------
  contract.on("JobCompleted", (jobId) => {
    wsBroadcast("JOB_COMPLETED", {
      jobId: jobId.toString(),
    });
  });

  // --------------------------
  // PAYMENT RELEASED
  // --------------------------
  contract.on("PaymentReleased", (jobId, worker) => {
    wsBroadcast("PAYMENT_RELEASED", {
      jobId: jobId.toString(),
      worker,
    });
  });

  // --------------------------
  // DISPUTES
  // --------------------------
  contract.on("JobDisputed", (jobId) => {
    wsBroadcast("JOB_DISPUTED", {
      jobId: jobId.toString(),
    });
  });
}