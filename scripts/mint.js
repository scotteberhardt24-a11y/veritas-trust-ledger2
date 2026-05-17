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

  const contractAddress =
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

  const contract = new ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  const tx = await contract.mint(
    await signer.getAddress(),
    "https://example.com/metadata/1.json"
  );

  await tx.wait();

  console.log("NFT minted");

  console.log(
    "Owner:",
    await contract.ownerOf(0)
  );

  console.log(
    "Token URI:",
    await contract.tokenURI(0)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});