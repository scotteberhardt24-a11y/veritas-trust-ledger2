import { createWalletClient, http } from "viem";
import { localhost } from "viem/chains";
import { ESCROW_ADDRESS, abi } from "./escrow";

const walletClient = createWalletClient({
  chain: localhost,
  transport: http("http://127.0.0.1:8545"),
});

export async function flagWorker(worker: string) {
  console.log("Flagging worker:", worker);
}