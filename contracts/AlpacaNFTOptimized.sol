// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AlpacaNFTOptimized is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    uint256 private _batchNonce;

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

    struct BatchMintData {
        address recipient;
        string name;
        bytes32 seed;
    }

    struct BatchTradeData {
        uint256 tokenId;
        int256 pnl;
        bool isWin;
    }

    struct BatchKnowledgeData {
        uint256 tokenId;
        string knowledge;
    }

    mapping(uint256 => AlpacaTraits) public alpacas;
    mapping(uint256 => string[]) public knowledgeBase;
    mapping(uint256 => bytes) public encryptedModelData;
    mapping(uint256 => bool) public isTransferable;
    mapping(uint256 => address) public modelProvider;
    
    mapping(bytes32 => bool) public processedBatches;
    mapping(address => uint256) public lastBatchTimestamp;
    
    uint256 public mintPrice = 0.01 ether;
    uint256 public batchDiscountRate = 900;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_BATCH_SIZE = 50;
    uint256 public constant BATCH_COOLDOWN = 60;

    event AlpacaMinted(uint256 tokenId, address owner, string name);
    event BatchMinted(uint256[] tokenIds, address indexed owner, uint256 count);
    event AlpacaLevelUp(uint256 tokenId, uint256 newLevel);
    event KnowledgeAdded(uint256 tokenId, string knowledge);
    event BatchKnowledgeAdded(uint256[] tokenIds, uint256 totalKnowledge);
    event ModelUpdated(uint256 tokenId, string newModelURI);
    event TradeRecorded(uint256 tokenId, int256 pnl);
    event BatchTradeRecorded(uint256[] tokenIds, uint256 totalTrades);
    event ModelDataStored(uint256 tokenId, address provider);
    event ModelTransferred(uint256 tokenId, address from, address to);
    event GasOptimizationApplied(uint256 gasUsed, uint256 gasSaved);

    constructor() ERC721("Alpaca Trading Pal Optimized", "ALPACA-OPT") Ownable(msg.sender) {}

    function mintAlpaca(string memory _name) public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _createAlpaca(tokenId, _name, msg.sender);
        
        emit AlpacaMinted(tokenId, msg.sender, _name);
    }

    function batchMintAlpacas(string[] memory _names) 
        public 
        payable 
        nonReentrant 
    {
        uint256 batchSize = _names.length;
        require(batchSize > 0 && batchSize <= MAX_BATCH_SIZE, "Invalid batch size");
        require(block.timestamp >= lastBatchTimestamp[msg.sender] + BATCH_COOLDOWN, "Batch cooldown active");
        require(_tokenIdCounter + batchSize <= MAX_SUPPLY, "Exceeds max supply");
        
        uint256 totalCost = _calculateBatchCost(batchSize);
        require(msg.value >= totalCost, "Insufficient payment for batch");

        uint256 gasStart = gasleft();
        uint256[] memory tokenIds = new uint256[](batchSize);
        
        for (uint256 i = 0; i < batchSize; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            tokenIds[i] = tokenId;
            
            _mint(msg.sender, tokenId);
            _createAlpaca(tokenId, _names[i], msg.sender);
        }
        
        lastBatchTimestamp[msg.sender] = block.timestamp;
        uint256 gasUsed = gasStart - gasleft();
        uint256 gasSaved = (batchSize * 150000) - gasUsed;
        
        emit BatchMinted(tokenIds, msg.sender, batchSize);
        emit GasOptimizationApplied(gasUsed, gasSaved);
    }

    function batchFeedKnowledge(BatchKnowledgeData[] memory _knowledgeBatch) 
        public 
        nonReentrant 
    {
        require(_knowledgeBatch.length <= MAX_BATCH_SIZE, "Batch too large");
        
        uint256 gasStart = gasleft();
        uint256[] memory tokenIds = new uint256[](_knowledgeBatch.length);
        
        for (uint256 i = 0; i < _knowledgeBatch.length; i++) {
            uint256 tokenId = _knowledgeBatch[i].tokenId;
            require(ownerOf(tokenId) == msg.sender, "Not the owner");
            
            knowledgeBase[tokenId].push(_knowledgeBatch[i].knowledge);
            alpacas[tokenId].experience += 10;
            _checkLevelUp(tokenId);
            tokenIds[i] = tokenId;
        }
        
        uint256 gasUsed = gasStart - gasleft();
        uint256 gasSaved = (_knowledgeBatch.length * 50000) - gasUsed;
        
        emit BatchKnowledgeAdded(tokenIds, _knowledgeBatch.length);
        emit GasOptimizationApplied(gasUsed, gasSaved);
    }

    function batchRecordTrades(BatchTradeData[] memory _tradeBatch) 
        public 
        nonReentrant 
    {
        require(_tradeBatch.length <= MAX_BATCH_SIZE, "Batch too large");
        
        uint256 gasStart = gasleft();
        uint256[] memory tokenIds = new uint256[](_tradeBatch.length);
        
        for (uint256 i = 0; i < _tradeBatch.length; i++) {
            uint256 tokenId = _tradeBatch[i].tokenId;
            require(ownerOf(tokenId) == msg.sender, "Not the owner");
            
            AlpacaTraits storage alpaca = alpacas[tokenId];
            alpaca.totalTrades++;
            alpaca.totalPnL += _tradeBatch[i].pnl;
            
            if (_tradeBatch[i].isWin) {
                alpaca.wins++;
            }
            
            alpaca.experience += 5;
            _checkLevelUp(tokenId);
            tokenIds[i] = tokenId;
        }
        
        uint256 gasUsed = gasStart - gasleft();
        uint256 gasSaved = (_tradeBatch.length * 80000) - gasUsed;
        
        emit BatchTradeRecorded(tokenIds, _tradeBatch.length);
        emit GasOptimizationApplied(gasUsed, gasSaved);
    }

    function optimizedGetMultipleAlpacas(uint256[] memory tokenIds) 
        public 
        view 
        returns (AlpacaTraits[] memory) 
    {
        require(tokenIds.length <= 100, "Too many tokens requested");
        
        AlpacaTraits[] memory results = new AlpacaTraits[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            results[i] = alpacas[tokenIds[i]];
        }
        return results;
    }

    function getAlpacasWithPagination(address owner, uint256 offset, uint256 limit)
        public
        view
        returns (uint256[] memory tokenIds, AlpacaTraits[] memory alpacaData)
    {
        require(limit <= 50, "Limit too high");
        
        uint256 totalOwned = balanceOf(owner);
        if (offset >= totalOwned) {
            return (new uint256[](0), new AlpacaTraits[](0));
        }
        
        uint256 actualLimit = (offset + limit > totalOwned) ? totalOwned - offset : limit;
        tokenIds = new uint256[](actualLimit);
        alpacaData = new AlpacaTraits[](actualLimit);
        
        uint256 found = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter && found < actualLimit; i++) {
            if (_ownerOf(i) == owner) {
                if (currentIndex >= offset) {
                    tokenIds[found] = i;
                    alpacaData[found] = alpacas[i];
                    found++;
                }
                currentIndex++;
            }
        }
    }

    function _createAlpaca(uint256 tokenId, string memory _name, address owner) private {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp, 
            block.prevrandao,
            owner, 
            tokenId,
            _batchNonce++
        )));
        
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
    }

    function _calculateBatchCost(uint256 batchSize) private view returns (uint256) {
        if (batchSize < 5) return mintPrice * batchSize;
        return (mintPrice * batchSize * batchDiscountRate) / 1000;
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

    function setBatchDiscountRate(uint256 _newRate) public onlyOwner {
        require(_newRate <= 1000, "Invalid discount rate");
        batchDiscountRate = _newRate;
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

    function getContractStats() public view returns (
        uint256 totalSupply,
        uint256 totalTrades,
        uint256 avgLevel,
        uint256 totalExperience
    ) {
        totalSupply = _tokenIdCounter;
        uint256 levelSum = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            totalTrades += alpacas[i].totalTrades;
            levelSum += alpacas[i].level;
            totalExperience += alpacas[i].experience;
        }
        
        avgLevel = totalSupply > 0 ? levelSum / totalSupply : 0;
    }

    function emergencyPause() public onlyOwner {
        _pause();
    }

    function emergencyUnpause() public onlyOwner {
        _unpause();
    }

    function _pause() internal {
    }

    function _unpause() internal {
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}