// test/AminiaSupplyChain.viem.test.ts

import { describe, it, beforeEach, expect } from "vitest";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
} from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import {
  abi,
  bytecode,
} from "../artifacts/contracts/AminiaSupplyChain.sol/AminiaSupplyChain.json";

describe("AminiaSupplyChain (with viem)", () => {
  let publicClient: any;
  let seller: any, transporter: any, warehouseManager: any, buyer: any, other: any;
  let walletSeller: any;
  let contractAddress: `0x${string}`;

  beforeEach(async () => {
    // These are automatically-funded private keys when you use Hardhat local node.
    // Replace the keys below with the keys printed by "npx hardhat node".
    seller           = privateKeyToAccount("0x59c6995e998f97a5a0044976f201dfe4c6f294b03f5937510b1cb7e298b38a06");
    transporter      = privateKeyToAccount("0x8b3a350cf5c34c9194ca54ab7eb588d789784e26a7e64bafde009c6de1b16dd7");
    warehouseManager = privateKeyToAccount("0x5af65be94b462a3a32902b8bd6776539470b64965d60b4658e6747890137f411");
    buyer            = privateKeyToAccount("0x2a871d079bb85e0b82f59a9a70506e651d76e2f135f168cf08d79cd66c08c7ff");
    other            = privateKeyToAccount("0x4b20993bc481177ec7e8f571cecae8a9e22c02dbf13c4fe4e173168f706005fa");

    walletSeller = createWalletClient({
      account: seller,
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    publicClient = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    // Deploy contract
    const txHash = await walletSeller.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    contractAddress = receipt.contractAddress!;
  });

  it("should complete full lifecycle", async () => {
    // releaseProduct
    await walletSeller.writeContract({
      abi,
      address: contractAddress,
      functionName: "releaseProduct",
      args: [
        "Banana crate #1",
        transporter.address,
        warehouseManager.address,
        buyer.address,
      ],
    });

    let product = await publicClient.readContract({
      abi,
      address: contractAddress,
      functionName: "products",
      args: [0],
    });
    expect(product.status).toEqual(0);

    // confirmPickup (from transporter)
    const walletTransporter = createWalletClient({
      account: transporter,
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    await walletTransporter.writeContract({
        abi,
        address: contractAddress,
        functionName: "confirmPickup",
        args: [0],
        account: null
    });

    product = await publicClient.readContract({
      abi,
      address: contractAddress,
      functionName: "products",
      args: [0],
    });
    expect(product.status).toEqual(1);

    // confirmStorage (warehouse)
    const walletWarehouse = createWalletClient({
      account: warehouseManager,
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    await walletWarehouse.writeContract({
        abi,
        address: contractAddress,
        functionName: "confirmStorage",
        args: [0, "Warehouse A"],
        account: null
    });

    product = await publicClient.readContract({
      abi,
      address: contractAddress,
      functionName: "products",
      args: [0],
    });
    expect(product.status).toEqual(2);
    expect(product.warehouseLocation).toEqual("Warehouse A");

    // confirmDelivery (buyer)
    const walletBuyer = createWalletClient({
      account: buyer,
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    await walletBuyer.writeContract({
        abi,
        address: contractAddress,
        functionName: "confirmDelivery",
        args: [0],
        account: null
    });

    product = await publicClient.readContract({
      abi,
      address: contractAddress,
      functionName: "products",
      args: [0],
    });
    expect(product.status).toEqual(3);
  });

  it("should revert if unauthorized user tries a transition", async () => {
    await walletSeller.writeContract({
      abi,
      address: contractAddress,
      functionName: "releaseProduct",
      args: [
        "Banana crate #2",
        transporter.address,
        warehouseManager.address,
        buyer.address,
      ],
    });

    // unauthorized user tries to pick up
    const walletOther = createWalletClient({
      account: other,
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    await expect(
      walletOther.writeContract({
          abi,
          address: contractAddress,
          functionName: "confirmPickup",
          args: [0],
          account: null
      })
    ).rejects.toThrow("Not authorized");
  });
});
