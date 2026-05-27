import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // -----------------------------
  // LOAD ARTIFACT
  // -----------------------------
  const artifact =
    await hre.artifacts.readArtifact(
      "VeritasIdentityNFT"
    );

  // -----------------------------
  // CONNECT PROVIDER
  // -----------------------------
  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );

  // -----------------------------
  // GET SIGNER
  // -----------------------------
  const signer =
    await provider.getSigner();

  console.log(
    "Using wallet:",
    await signer.getAddress()
  );

  // -----------------------------
  // DEPLOYED CONTRACT ADDRESS
  // -----------------------------
  const contractAddress =
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

  // -----------------------------
  // CONNECT CONTRACT
  // -----------------------------
  const identity =
    new ethers.Contract(
      contractAddress,
      artifact.abi,
      signer
    );

  // -----------------------------
  // MINT IDENTITY
  // -----------------------------
  console.log(
    "Minting identity..."
  );

  const tx =
    await identity.mintIdentity(
      await signer.getAddress(),
      "https://example.com/metadata/1.json"
    );

  await tx.wait();

  console.log(
    "Mint transaction confirmed"
  );

  // -----------------------------
  // VERIFY TOKEN
  // -----------------------------
  const tokenId =
    await identity.ownerToTokenId(
      await signer.getAddress()
    );

  console.log(
    "Minted tokenId:",
    tokenId.toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});