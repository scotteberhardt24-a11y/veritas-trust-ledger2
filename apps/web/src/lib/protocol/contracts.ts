import { ethers } from "ethers";

import IdentityABI from "../../../../abi/VeritasIdentityNFT.json";
import ReputationABI from "../../../../abi/VeritasReputation.json";
import AttestationABI from "../../../../abi/VeritasAttestation.json";
import RegistryABI from "../../../../abi/VeritasRegistry.json";
import EscrowABI from "../../../../abi/VeritasEscrow.json";
import MockUSDCABI from "../../../../abi/MockUSDC.json";

export const CONTRACTS = {
  identity: {
    address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    abi: IdentityABI
  },

  reputation: {
    address: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
    abi: ReputationABI
  },

  attestation: {
    address: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    abi: AttestationABI
  },

  registry: {
    address: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    abi: RegistryABI
  },

  escrow: {
    address: "0x9A676e781A523b5d0C0e43731313A708CB607508",
    abi: EscrowABI
  },

  usdc: {
    address: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    abi: MockUSDCABI
  }
};

export function getContract(
  name: keyof typeof CONTRACTS,
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  const c = CONTRACTS[name];

  return new ethers.Contract(
    c.address,
    c.abi,
    signerOrProvider
  );
}
