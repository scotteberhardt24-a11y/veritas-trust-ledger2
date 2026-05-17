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
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    artifact.abi,
    signer
  );

  console.log(
    "Connected to:",
    await contract.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});