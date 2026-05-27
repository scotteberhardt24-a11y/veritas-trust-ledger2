import hre from "hardhat";

const CONTRACT =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
  const artifact =
    await hre.artifacts.readArtifact(
      "VeritasReputation"
    );

  const { ethers } = await import("ethers");

  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );

  const signer =
    await provider.getSigner();

  const contract =
    new ethers.Contract(
      CONTRACT,
      artifact.abi,
      signer
    );

  await contract.addReputation(
    await signer.getAddress(),
    50
  );

  const score =
    await contract.getReputation(
      await signer.getAddress()
    );

  console.log(
    "Reputation:",
    score.toString()
  );
}

main().catch(console.error);