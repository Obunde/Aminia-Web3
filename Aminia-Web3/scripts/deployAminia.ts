import {
  createWalletClient,
  createPublicClient,
  formatEther,
  http,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();

import artifact from "../artifacts/contracts/AminiaSupplyChain.sol/AminiaSupplyChain.json";
const { abi, bytecode } = artifact;

if (!abi || !bytecode) {
  throw new Error(
    "ABI or bytecode not found in AminiaSupplyChain.json artifact."
  );
}

const { PRIVATE_KEY } = process.env;

async function main() {
  if (!PRIVATE_KEY) {
    throw new Error("⚠️ PRIVATE_KEY environment variable is missing.");
  }
  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
  });

  console.log(`📡 Deploying on ${celoAlfajores.name} `);
  console.log("👤 Deployer:", account.address);

  //check Celo balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(
    "💰 Balance:",
    formatEther(balance),
    celoAlfajores.nativeCurrency.symbol
  );

  if (balance < parseEther("0.05")) {
    throw new Error("⚠️ Not enough CELO to deploy. Need at least 0.05 CELO");
  }

  console.log("\n🎁 Deploying AminiaSupplyChain...");

  // Deploy contract using viem's walletClient

  const walletClient = createWalletClient({
    account,
    chain: celoAlfajores,
    transport: http(),
  });

  console.log("\n🚀 Deploying AminiaSupplyChain...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
  });

  // Wait for tx to be mined
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress!;

  console.log("✅ Contract deployed at:", contractAddress);
  console.log("🎉 Deployment Complete");
}

main().catch((err) => {
  console.error("🚨 Deployment failed:", err);
  process.exit(1);
});
