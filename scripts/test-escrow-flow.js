import { ethers } from "ethers";
import hre from "hardhat";

const provider =
  new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

async function main() {
  console.log(
    "\n========================="
  );

  console.log(
    "VERITAS ESCROW TEST"
  );

  console.log(
    "=========================\n"
  );

  // -----------------------------------
  // ETHERS V6 SIGNERS
  // -----------------------------------

  const client =
    await provider.getSigner(0);

  const worker =
    await provider.getSigner(1);

  // -----------------------------------
  // CONTRACT ARTIFACTS
  // -----------------------------------

  const escrowArtifact =
    await hre.artifacts.readArtifact(
      "VeritasEscrow"
    );

  const usdcArtifact =
    await hre.artifacts.readArtifact(
      "MockUSDC"
    );

  // -----------------------------------
  // DEPLOYED ADDRESSES
  // -----------------------------------

  const ESCROW_ADDRESS =
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

  const USDC_ADDRESS =
    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  // -----------------------------------
  // CONTRACT INSTANCES
  // -----------------------------------

  const escrow =
    new ethers.Contract(
      ESCROW_ADDRESS,
      escrowArtifact.abi,
      client
    );

  const usdc =
    new ethers.Contract(
      USDC_ADDRESS,
      usdcArtifact.abi,
      client
    );

  // -----------------------------------
  // DISPLAY ACCOUNTS
  // -----------------------------------

  console.log(
    "Client:",
    await client.getAddress()
  );

  console.log(
    "Worker:",
    await worker.getAddress()
  );

  // -----------------------------------
  // MINT TEST USDC
  // -----------------------------------

  console.log(
    "\nMinting USDC..."
  );

  await (
    await usdc.mint(
      await client.getAddress(),
      ethers.parseUnits(
        "1000",
        6
      )
    )
  ).wait();

  // -----------------------------------
  // APPROVE ESCROW
  // -----------------------------------

  console.log(
    "Approving escrow..."
  );

  await (
    await usdc.approve(
      ESCROW_ADDRESS,
      ethers.parseUnits(
        "500",
        6
      )
    )
  ).wait();

  // -----------------------------------
  // CREATE JOB
  // -----------------------------------

  console.log(
    "Creating job..."
  );

  const createTx =
    await escrow.createJob(
      await worker.getAddress(),
      ethers.parseUnits(
        "500",
        6
      ),
      "ipfs://job-metadata"
    );

  await createTx.wait();

  const jobId = 1;

  console.log(
    "Job ID:",
    jobId
  );

  // -----------------------------------
  // FUND JOB
  // -----------------------------------

  console.log(
    "Funding job..."
  );

  await (
    await escrow.fundJob(jobId)
  ).wait();

  // -----------------------------------
  // ACCEPT JOB
  // -----------------------------------

  console.log(
    "Worker accepting..."
  );

  await (
    await escrow
      .connect(worker)
      .acceptJob(jobId)
  ).wait();

  // -----------------------------------
  // SUBMIT WORK
  // -----------------------------------

  console.log(
    "Submitting work..."
  );

  await (
    await escrow
      .connect(worker)
      .submitWork(jobId)
  ).wait();

  // -----------------------------------
  // COMPLETE JOB
  // -----------------------------------

  console.log(
    "Completing job..."
  );

  await (
    await escrow.completeJob(jobId)
  ).wait();

  // -----------------------------------
  // CHECK WORKER BALANCE
  // -----------------------------------

  const workerBalance =
    await usdc.balanceOf(
      await worker.getAddress()
    );

  console.log(
    "\nWorker Balance:"
  );

  console.log(
    ethers.formatUnits(
      workerBalance,
      6
    ),
    "USDC"
  );

  // -----------------------------------
  // CHECK TREASURY BALANCE
  // -----------------------------------

  const treasury =
    await escrow.treasury();

  const treasuryBalance =
    await usdc.balanceOf(
      treasury
    );

  console.log(
    "\nTreasury Balance:"
  );

  console.log(
    ethers.formatUnits(
      treasuryBalance,
      6
    ),
    "USDC"
  );

  console.log(
    "\n========================="
  );

  console.log(
    "ESCROW FLOW SUCCESS"
  );

  console.log(
    "=========================\n"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
