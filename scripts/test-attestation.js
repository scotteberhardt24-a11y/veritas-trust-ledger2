import hre from "hardhat";

const CONTRACT =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const artifact =
    await hre.artifacts.readArtifact(
      "VeritasAttestation"
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

  await contract.createAttestation(
    await signer.getAddress(),
    "KYC VERIFIED"
  );

  console.log(
    "Attestation created"
  );
}

main().catch(console.error);