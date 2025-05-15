# Aminia
# AminiaSupplyChain 🛠️📦

Aminia is a simple and transparent blockchain-based supply chain tracking system built with Solidity. It allows key stakeholders — seller, transporter, warehouse manager, and buyer — to interact with and track the journey of a product from release to delivery.

## ✨ Features

- **Product Lifecycle Tracking**: From creation to delivery.
- **Role-Based Confirmations**:
  - Sellers release products.
  - Transporters confirm pickup.
  - Warehouse managers confirm storage (with location).
  - Buyers confirm delivery.
- **Immutable Logs** via Ethereum events.

---

## 📦 Product Lifecycle Stages

The product goes through the following `enum Status`:
```solidity
enum Status { Created, PickedUp, Stored, Delivered }
🧱 Smart Contract Structure
struct Product
solidity
Copy
Edit
struct Product {
    uint256 id;
    string description;
    address seller;
    address transporter;
    address warehouseManager;
    address buyer;
    Status status;
    uint256 timestamp;
    string warehouseLocation;
}
Each product stores key metadata and ownership/stakeholder information, including the warehouse location once stored.

🔐 Access Control
A modifier restricts function access to participants involved in a product's lifecycle:

solidity
Copy
Edit
modifier onlyParticipant(uint256 _productId);
🚀 Core Functions
releaseProduct()
solidity
Copy
Edit
function releaseProduct(
    string memory _description,
    address _transporter,
    address _warehouseManager,
    address _buyer
) external;
Initiated by the seller to release a new product into the system.

confirmPickup()
solidity
Copy
Edit
function confirmPickup(uint256 _productId) external;
Executed by the transporter to confirm the product has been picked up.

confirmStorage()
solidity
Copy
Edit
function confirmStorage(uint256 _productId, string calldata _location) external;
Executed by the warehouse manager to confirm storage and add the warehouse's physical location.

confirmDelivery()
solidity
Copy
Edit
function confirmDelivery(uint256 _productId) external;
Executed by the buyer to confirm receipt of the product.

📡 Events
ProductReleased(uint256 productId, address seller, string description)

PickedUpByTransporter(uint256 productId, address transporter)

ConfirmedByWarehouse(uint256 productId, address warehouseManager, string location)

ConfirmedByBuyer(uint256 productId, address buyer)