import { ethers } from "ethers";
import { createWSServer } from "./ws.js";
import { updateTrustScore } from "./trustEngine.js";

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
    await updateTrustScore(worker, "JOB_CREATED");
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
    const job = await db.query(
  `
  SELECT worker
  FROM jobs
  WHERE chain_job_id = $1
`,
  [jobId.toString()]
);

if (job.rows[0]) {
  await updateTrustScore(
    job.rows[0].worker,
    "JOB_COMPLETED"
  );
}
    await updateTrustScore(worker, "JOB_COMPLETED");
    wsBroadcast("JOB_COMPLETED", {
      jobId: jobId.toString(),
    });
  });

  // --------------------------
  // PAYMENT RELEASED
  // --------------------------
  contract.on("PaymentReleased", (jobId, worker) => {
    await updateTrustScore(
  worker,
  "PAYMENT_RELEASED"
);
    wsBroadcast("PAYMENT_RELEASED", {
      jobId: jobId.toString(),
      worker,
    });
  });

  // --------------------------
  // DISPUTES
  // --------------------------
    contract.on("JobDisputed", (jobId) => {const job = await db.query(
  `
  SELECT worker
  FROM jobs
  WHERE chain_job_id = $1
`,
  [jobId.toString()]
);

if (job.rows[0]) {
  await updateTrustScore(
    job.rows[0].worker,
    "JOB_DISPUTED"
  );
}
    await updateTrustScore(worker, "JOB_DISPUTED");
    wsBroadcast("JOB_DISPUTED", {
      jobId: jobId.toString(),
    });
  });
}