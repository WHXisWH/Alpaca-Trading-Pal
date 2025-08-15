// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IAlpacaNFT is IERC721 {
    struct AlpacaTraits {
        string name;
        uint8 riskAppetite;
        uint8 learningSpeed;
        uint8 preferredMarket;
        uint256 level;
        uint256 experience;
        string modelURI;
        string performanceURI;
        uint256 totalTrades;
        int256 totalPnL;
        uint256 wins;
        uint256 birthTime;
    }

    event AlpacaMinted(uint256 tokenId, address owner, string name);
    event AlpacaLevelUp(uint256 tokenId, uint256 newLevel);
    event KnowledgeAdded(uint256 tokenId, string knowledge);
    event ModelUpdated(uint256 tokenId, string newModelURI);
    event TradeRecorded(uint256 tokenId, int256 pnl);

    function mintAlpaca(string memory _name) external payable;
    function feedKnowledge(uint256 tokenId, string memory knowledge) external;
    function updateModelURI(uint256 tokenId, string memory newModelURI) external;
    function recordTrade(uint256 tokenId, int256 pnl, bool isWin) external;
    function getAlpaca(uint256 tokenId) external view returns (AlpacaTraits memory);
    function getKnowledge(uint256 tokenId) external view returns (string[] memory);
}