// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AlpacaItems is ERC1155, Ownable {
    uint256 public constant CRYSTAL_BALL = 1;
    uint256 public constant TRADING_TERMINAL = 2;
    uint256 public constant KNOWLEDGE_CAPSULE = 101;

    constructor() ERC1155("ipfs://bafybeifx7yeb55v6pvjo2f4i2x3h3d3s4xi3y3z4x5q6w7r8s9t0/items/{id}.json") Ownable(msg.sender) {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}