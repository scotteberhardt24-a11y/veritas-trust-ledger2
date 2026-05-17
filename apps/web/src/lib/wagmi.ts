import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, localhost } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Veritas Trust Ledger",
  projectId: "veritas-local-dev",
  chains: [localhost, sepolia, mainnet],
  ssr: false,
});