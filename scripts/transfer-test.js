import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const artifact = await hre.artifacts.readArtifact(
    "VeritasIdentityNFT"
  );

  const provider = new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    "PASTE_NEW_ADDRESS",
    artifact.abi,
    signer
  );

  try {
    const tx = await contract.transferFrom(
      await signer.getAddress(),
      "0x000000000000000000000000000000000000dead",
      0
    );

    await tx.wait();
  } catch (err) {
    console.log(
      "Transfer blocked successfully"
    );

    console.log(err.shortMessage || err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});