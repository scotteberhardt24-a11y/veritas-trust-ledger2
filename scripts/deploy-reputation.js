import hre from "hardhat";

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

  const factory =
    new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      signer
    );

  const contract =
    await factory.deploy();

  await contract.waitForDeployment();

  console.log(
    "Reputation deployed to:",
    await contract.getAddress()
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});