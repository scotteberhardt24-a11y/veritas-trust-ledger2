import hre from "hardhat";

const CONTRACT =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const artifact =
    await hre.artifacts.readArtifact(
      "VeritasIdentityNFT"
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

  await contract.mintIdentity(
    await signer.getAddress(),
    "https://example.com/1.json"
  );

  console.log(
    "Minted successfully"
  );
}

main().catch(console.error);