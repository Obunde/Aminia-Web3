// scripts/deployAminia.ts
import { createWalletClient, http, createPublicClient } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import * as dotenv from "dotenv";
dotenv.config();

import {
  abi,
  bytecode,
} from "../artifacts/contracts/AminiaSupplyChain.sol/AminiaSupplyChain.json";

async function main() {
  // (Use the first private key printed by `npx hardhat node`)
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

  // Wallet (for sending txs)
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  // Public client (just for reading/waiting)
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  console.log("Deploying AminiaSupplyChain...");
  console.log("Using account:", account.address);

  // Deploy contract
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
  });

  // Wait for transaction to be mined
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("✅ Contract deployed at:", receipt.contractAddress);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
