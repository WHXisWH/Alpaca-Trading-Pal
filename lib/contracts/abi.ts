export const ALPACA_NFT_ABI = [
  {
    inputs: [{ name: "_name", type: "string" }],
    name: "mintAlpaca",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "knowledge", type: "string" }
    ],
    name: "feedKnowledge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newModelURI", type: "string" }
    ],
    name: "updateModelURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "pnl", type: "int256" },
      { name: "isWin", type: "bool" }
    ],
    name: "recordTrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getAlpaca",
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "riskAppetite", type: "uint8" },
          { name: "learningSpeed", type: "uint8" },
          { name: "preferredMarket", type: "uint8" },
          { name: "level", type: "uint256" },
          { name: "experience", type: "uint256" },
          { name: "modelURI", type: "string" },
          { name: "performanceURI", type: "string" },
          { name: "totalTrades", type: "uint256" },
          { name: "totalPnL", type: "int256" },
          { name: "wins", type: "uint256" },
          { name: "birthTime", type: "uint256" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getWinRate",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "getAllTokensByOwner",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newPerformanceURI", type: "string" }
    ],
    name: "updatePerformanceURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];