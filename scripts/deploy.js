import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const artifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/VeritasIdentityNFT.sol/VeritasIdentityNFT.json",
      "utf8"
    )
  );

  const provider =
    new ethers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );

  const signer = await provider.getSigner();

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  const contract = await factory.deploy();

  await contract.waitForDeployment();

  console.log(
    "Deployed to:",
    await contract.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});