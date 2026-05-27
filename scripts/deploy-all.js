import { ethers } from "ethers";
import hre from "hardhat";

const provider =
  new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

async function deployContract(
  name,
  args = []
) {
  console.log(
    `\nDeploying ${name}...`
  );

  const artifact =
    await hre.artifacts.readArtifact(
      name
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
    await factory.deploy(...args);

  await contract.waitForDeployment();

  const address =
    await contract.getAddress();

  console.log(
    `\n${name} deployed:`
  );

  console.log(address);

  return contract;
}

async function main() {
  console.log(
    "\n================================="
  );

  console.log(
    "VERITAS PROTOCOL DEPLOYMENT"
  );

  console.log(
    "================================="
  );

  // ---------------------------------
  // SIGNER
  // ---------------------------------

  const deployer =
    await provider.getSigner();

  const deployerAddress =
    await deployer.getAddress();

  // ---------------------------------
  // DEPLOY IDENTITY
  // ---------------------------------

  const identity =
    await deployContract(
      "VeritasIdentityNFT"
    );

  const identityAddress =
    await identity.getAddress();

  // ---------------------------------
  // DEPLOY REPUTATION
  // ---------------------------------

  const reputation =
    await deployContract(
      "VeritasReputation",
      [identityAddress]
    );

  const reputationAddress =
    await reputation.getAddress();

  // ---------------------------------
  // DEPLOY ATTESTATION
  // ---------------------------------

  const attestation =
    await deployContract(
      "VeritasAttestation",
      [identityAddress]
    );

  const attestationAddress =
    await attestation.getAddress();

  // ---------------------------------
  // DEPLOY REGISTRY
  // ---------------------------------

  const registry =
    await deployContract(
      "VeritasRegistry",
      [deployerAddress]
    );

  const registryAddress =
    await registry.getAddress();

  // ---------------------------------
  // DEPLOY MOCK USDC
  // ---------------------------------

  const mockUSDC =
    await deployContract(
      "MockUSDC"
    );

  const mockUSDCAddress =
    await mockUSDC.getAddress();

  // ---------------------------------
  // DEPLOY ESCROW
  // ---------------------------------

  const escrow =
    await deployContract(
      "VeritasEscrow",
      [
        mockUSDCAddress,
        deployerAddress,
        reputationAddress
      ]
    );

  const escrowAddress =
    await escrow.getAddress();

  // ---------------------------------
  // REGISTER CONTRACTS
  // ---------------------------------

  console.log(
    "\nRegistering contracts..."
  );

  await (
    await registry.setIdentityContract(
      identityAddress
    )
  ).wait();

  await (
    await registry.setReputationContract(
      reputationAddress
    )
  ).wait();

  await (
    await registry.setAttestationContract(
      attestationAddress
    )
  ).wait();

  await (
    await registry.setEscrowContract(
      escrowAddress
    )
  ).wait();

  // ---------------------------------
  // COMPLETE
  // ---------------------------------

  console.log(
    "\n================================="
  );

  console.log(
    "DEPLOYMENT COMPLETE"
  );

  console.log(
    "=================================\n"
  );

  console.log(
    "Identity:"
  );

  console.log(
    identityAddress
  );

  console.log(
    "\nReputation:"
  );

  console.log(
    reputationAddress
  );

  console.log(
    "\nAttestation:"
  );

  console.log(
    attestationAddress
  );

  console.log(
    "\nRegistry:"
  );

  console.log(
    registryAddress
  );

  console.log(
    "\nMockUSDC:"
  );

  console.log(
    mockUSDCAddress
  );

  console.log(
    "\nEscrow:"
  );

  console.log(
    escrowAddress
  );

  console.log(
    "\n================================="
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
