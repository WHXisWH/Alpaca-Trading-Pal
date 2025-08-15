// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AlpacaNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

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

    mapping(uint256 => AlpacaTraits) public alpacas;
    mapping(uint256 => string[]) public knowledgeBase;
    mapping(uint256 => bytes) public encryptedModelData;
    mapping(uint256 => bool) public isTransferable;
    mapping(uint256 => address) public modelProvider;

    uint256 public mintPrice = 0.01 ether;
    uint256 public constant MAX_SUPPLY = 10000;

    event AlpacaMinted(uint256 tokenId, address owner, string name);
    event AlpacaLevelUp(uint256 tokenId, uint256 newLevel);
    event KnowledgeAdded(uint256 tokenId, string knowledge);
    event ModelUpdated(uint256 tokenId, string newModelURI);
    event TradeRecorded(uint256 tokenId, int256 pnl);
    event ModelDataStored(uint256 tokenId, address provider);
    event ModelTransferred(uint256 tokenId, address from, address to);

    constructor() ERC721("Alpaca Trading Pal", "ALPACA") Ownable(msg.sender) {}

    function mintAlpaca(string memory _name) public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);

        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenId)));
        
        alpacas[tokenId] = AlpacaTraits({
            name: _name,
            riskAppetite: uint8(seed % 3),
            learningSpeed: uint8((seed >> 8) % 3),
            preferredMarket: uint8((seed >> 16) % 3),
            level: 1,
            experience: 0,
            modelURI: "",
            performanceURI: "",
            totalTrades: 0,
            totalPnL: 0,
            wins: 0,
            birthTime: block.timestamp
        });

        emit AlpacaMinted(tokenId, msg.sender, _name);
    }

    function feedKnowledge(uint256 tokenId, string memory knowledge) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        knowledgeBase[tokenId].push(knowledge);
        
        alpacas[tokenId].experience += 10;
        _checkLevelUp(tokenId);
        
        emit KnowledgeAdded(tokenId, knowledge);
    }

    function storeAIModel(uint256 tokenId, bytes memory encryptedData, address provider) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        encryptedModelData[tokenId] = encryptedData;
        modelProvider[tokenId] = provider;
        isTransferable[tokenId] = true;
        emit ModelDataStored(tokenId, provider);
    }

    function transferWithModel(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(isTransferable[tokenId], "Model not transferable");
        
        address previousOwner = msg.sender;
        _transfer(msg.sender, to, tokenId);
        
        emit ModelTransferred(tokenId, previousOwner, to);
    }

    function updateModelURI(uint256 tokenId, string memory newModelURI) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        alpacas[tokenId].modelURI = newModelURI;
        emit ModelUpdated(tokenId, newModelURI);
    }

    function recordTrade(uint256 tokenId, int256 pnl, bool isWin) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        AlpacaTraits storage alpaca = alpacas[tokenId];
        alpaca.totalTrades++;
        alpaca.totalPnL += pnl;
        
        if (isWin) {
            alpaca.wins++;
        }
        
        alpaca.experience += 5;
        _checkLevelUp(tokenId);
        
        emit TradeRecorded(tokenId, pnl);
    }

    function _checkLevelUp(uint256 tokenId) private {
        AlpacaTraits storage alpaca = alpacas[tokenId];
        uint256 requiredExp = alpaca.level * 100;
        
        if (alpaca.experience >= requiredExp) {
            alpaca.level++;
            alpaca.experience -= requiredExp;
            emit AlpacaLevelUp(tokenId, alpaca.level);
        }
    }

    function getAlpaca(uint256 tokenId) public view returns (AlpacaTraits memory) {
        return alpacas[tokenId];
    }

    function getKnowledge(uint256 tokenId) public view returns (string[] memory) {
        return knowledgeBase[tokenId];
    }

    function getModelData(uint256 tokenId) public view returns (bytes memory, address) {
        require(ownerOf(tokenId) == msg.sender || modelProvider[tokenId] == msg.sender, "Unauthorized");
        return (encryptedModelData[tokenId], modelProvider[tokenId]);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function setMintPrice(uint256 _newPrice) public onlyOwner {
        mintPrice = _newPrice;
    }

    function getWinRate(uint256 tokenId) public view returns (uint256) {
        AlpacaTraits memory alpaca = alpacas[tokenId];
        if (alpaca.totalTrades == 0) return 0;
        return (alpaca.wins * 100) / alpaca.totalTrades;
    }

    function getAllTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory result = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }

    function updatePerformanceURI(uint256 tokenId, string memory newPerformanceURI) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        alpacas[tokenId].performanceURI = newPerformanceURI;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}