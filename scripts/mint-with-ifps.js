import { ethers } from "ethers";
import hre from "hardhat";
import dotenv from "dotenv";
import { buildMetadata } from "./build-metadata.js";
import { uploadJSONToIPFS } from "./ipfs.js";

dotenv.config();

async function main() {
  const artifact = await hre.artifacts.readArtifact(
    "VeritasIdentityNFT"
  );

  const provider = new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    "PASTE_YOUR_CONTRACT_ADDRESS",
    artifact.abi,
    signer
  );

  // -----------------------------
  // STEP 1: Build metadata
  // -----------------------------
  const metadataFile = buildMetadata({
    name: "Scott Identity",
    wallet: await signer.getAddress(),
    verificationLevel: "BASIC",
    trustScore: 85,
    role: "Worker",
    imageCID: "", // optional
  });

  // -----------------------------
  // STEP 2: Upload metadata to IPFS
  // -----------------------------
  const metadataURI = await uploadJSONToIPFS(
    JSON.parse(
      await import("fs").then((fs) =>
        fs.readFileSync(metadataFile)
      )
    )
  );

  console.log("Metadata URI:", metadataURI);

  // -----------------------------
  // STEP 3: Mint NFT with IPFS URI
  // -----------------------------
  const tx = await contract.mint(
    await signer.getAddress(),
    metadataURI
  );

  await tx.wait();

  console.log("Identity minted successfully");
}

main().catch((err) => {
  console.error(err);
});