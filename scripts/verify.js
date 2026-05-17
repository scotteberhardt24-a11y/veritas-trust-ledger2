import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const artifact =
    await hre.artifacts.readArtifact(
      "VeritasIdentityNFT"
    );

  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );

  const signer =
    await provider.getSigner();

  const contract =
    new ethers.Contract(
      "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
      artifact.abi,
      signer
    );

  const tx =
    await contract.setVerificationLevel(
      0,
      2
    );

  await tx.wait();

  const level =
    await contract.getVerificationLevel(
      0
    );

  console.log(
    "Verification Level:",
    level.toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});