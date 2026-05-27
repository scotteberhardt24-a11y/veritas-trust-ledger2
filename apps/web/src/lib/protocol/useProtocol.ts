import { useMemo } from "react";
import { BrowserProvider } from "ethers";
import { getContract } from "./contracts";

export function useProtocol() {
  const provider = useMemo(() => {
    if (typeof window === "undefined") return null;

    if (!(window as any).ethereum) return null;

    return new BrowserProvider((window as any).ethereum);
  }, []);

  async function getSigner() {
    if (!provider) throw new Error("No wallet");

    await provider.send("eth_requestAccounts", []);
    return await provider.getSigner();
  }

  async function identityContract() {
    const signer = await getSigner();
    return getContract("identity", signer);
  }

  async function escrowContract() {
    const signer = await getSigner();
    return getContract("escrow", signer);
  }

  async function reputationContract() {
    const signer = await getSigner();
    return getContract("reputation", signer);
  }

  return {
    provider,
    getSigner,
    identityContract,
    escrowContract,
    reputationContract
  };
}
