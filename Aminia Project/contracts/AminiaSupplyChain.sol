// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AminiaSupplyChain {
    enum Status { Created, PickedUp, Stored, Delivered }

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

    mapping(uint256 => Product) public products;
    uint256 public productCounter;

    event ProductReleased(uint256 productId, address indexed seller, string description);
    event PickedUpByTransporter(uint256 productId, address indexed transporter);
    event ConfirmedByWarehouse(uint256 productId, address indexed warehouseManager, string location);
    event ConfirmedByBuyer(uint256 productId, address indexed buyer);

    modifier onlyParticipant(uint256 _productId) {
        Product memory p = products[_productId];
        require(
            msg.sender == p.seller ||
            msg.sender == p.transporter ||
            msg.sender == p.warehouseManager ||
            msg.sender == p.buyer,
            "Not authorized"
        );
        _;
    }

    function releaseProduct(
        string memory _description,
        address _transporter,
        address _warehouseManager,
        address _buyer
    ) external {
        uint256 newId = productCounter++;
        products[newId] = Product({
            id: newId,
            description: _description,
            seller: msg.sender,
            transporter: _transporter,
            warehouseManager: _warehouseManager,
            buyer: _buyer,
            status: Status.Created,
            timestamp: block.timestamp,
             warehouseLocation: ""
        });

        emit ProductReleased(newId, msg.sender, _description);
    }

    function confirmPickup(uint256 _productId) external onlyParticipant(_productId) {
        Product storage p = products[_productId];
        require(msg.sender == p.transporter, "Only transporter can confirm");
        require(p.status == Status.Created, "Invalid status");
        p.status = Status.PickedUp;
        p.timestamp = block.timestamp;

        emit PickedUpByTransporter(_productId, msg.sender);
    }

    function confirmStorage(uint256 _productId, string calldata _location) external onlyParticipant(_productId) {
    Product storage p = products[_productId];
    require(msg.sender == p.warehouseManager, "Only warehouse manager can confirm");
    require(p.status == Status.PickedUp, "Product not yet picked up");

    p.status = Status.Stored;
    p.timestamp = block.timestamp;
    p.warehouseLocation = _location;

    emit ConfirmedByWarehouse(_productId, msg.sender, _location);
}

    function confirmDelivery(uint256 _productId) external onlyParticipant(_productId) {
        Product storage p = products[_productId];
        require(msg.sender == p.buyer, "Only buyer can confirm");
        require(p.status == Status.Stored, "Product not yet stored");
        p.status = Status.Delivered;
        p.timestamp = block.timestamp;

        emit ConfirmedByBuyer(_productId, msg.sender);
    }

    // Getter for product details is already provided by the public `products` mapping
// The contract allows for the management of a supply chain process involving a seller, transporter, warehouse manager, and buyer.
// It includes functions to release a product, confirm pickup, storage, and delivery, with appropriate access control.
}