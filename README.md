# 🦙 Alpaca Trading Pal

> **Your Intelligent NFT Trading Companion on 0G Chain**

Alpaca Trading Pal is a revolutionary DeFi application that combines NFTs, AI, and decentralized trading into a gamified experience. Each Alpaca is a unique, evolvable AI trading companion that learns, grows, and trades on your behalf.

[![Built on 0G Chain](https://img.shields.io/badge/Built%20on-0G%20Chain-blue)](https://0g.ai)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-brightgreen)](https://soliditylang.org/)

## 🌟 Features

### 🥚 **Mint & Hatch**
- Create unique Alpaca NFTs with randomized traits
- Each Alpaca has distinct personality: risk appetite, learning speed, preferred markets
- Powered by 0G Chain's high-performance EVM

### 🧠 **AI-Powered Intelligence**
- **0G Compute Network Integration**: Leverage Llama-3.3-70B and DeepSeek-R1-70B models
- **TEE Verification**: Trusted execution environment ensures AI integrity
- **Personalized Strategies**: AI adapts to each Alpaca's unique characteristics

### 📚 **Knowledge Feeding**
- **0G Storage**: Decentralized storage for trading knowledge and strategies
- **Continuous Learning**: Feed your Alpaca articles, strategies, and market insights
- **Skill Tree Progression**: Visual representation of learned capabilities

### 📈 **Automated Trading**
- **Binance Integration**: Execute real trades through Binance testnet/mainnet
- **Risk Management**: Built-in stop-loss, take-profit, and position sizing
- **Performance Tracking**: Complete P&L and trade history on-chain

### 💎 **NFT Marketplace**
- Trade high-performing Alpacas with proven track records
- Performance-based valuation system
- Leaderboards and social features

## 🚀 Quick Start

### Prerequisites

```bash
node >= 16.0.0
npm >= 8.0.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/alpaca-trading-pal.git
cd alpaca-trading-pal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file with the following variables:

```env
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# Wallet Configuration  
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id

# Contract Addresses (Deployed)
NEXT_PUBLIC_ALPACA_NFT_ADDRESS=0x2451c1c2D71eBec5f63e935670c4bb0Ce19381f5

# 0G Network Configuration
NEXT_PUBLIC_0G_RPC_URL=https://rpc.ankr.com/0g_galileo_testnet_evm
NEXT_PUBLIC_0G_CHAIN_ID=16601

# Trading APIs (Optional)
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

# 0G Services
NEXT_PUBLIC_0G_COMPUTE_KEY=your_0g_compute_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Alpaca Trading Pal!

### Smart Contract Status

✅ **Contract Deployed**! Alpaca NFT Contract Address: `0x2451c1c2D71eBec5f63e935670c4bb0Ce19381f5`

If you need to redeploy or deploy to other networks:

```bash
# Compile contracts
npx hardhat compile

# Deploy to 0G Galileo Testnet
npm run deploy
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Web3**: Web3Auth, Web3.js, MetaMask & WalletConnect Adapters
- **Blockchain**: 0G Chain (Galileo Testnet)
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin v5
- **AI**: 0G Compute Network (Llama-3.3-70B, DeepSeek-R1-70B)
- **Storage**: 0G Storage Network
- **Trading**: Binance API Integration
- **State Management**: Zustand

### 0G Chain Integration

#### **0G Storage**
```typescript
// Store AI models and trading knowledge
await zgStorage.uploadKnowledge({
  type: "knowledge",
  content: tradingStrategy,
  tokenId: alpacaId
});
```

#### **0G Compute Network**
```typescript
// Generate AI trading strategies
const strategy = await zgCompute.generateTradingStrategy(
  prompt,
  alpacaContext
);
```

#### **High Performance**
- **2,500+ TPS**: Fast transaction processing
- **Sub-second Finality**: Near-instant confirmations
- **Low Fees**: Fraction of Ethereum mainnet costs

## 🎮 User Experience

### 1. Mint Your Alpaca
```
Visit /mint → Connect Wallet → Name Your Alpaca → Pay 0.01 OG → Receive NFT
```

### 2. Feed Knowledge
```
Go to Alpaca Profile → Add Trading Strategies → Store on 0G Storage → Alpaca Learns
```

### 3. Start Trading
```
Enable Auto-Trading → AI Generates Strategies → Execute on Binance → Track Performance
```

### 4. Grow & Trade
```
Alpaca Gains Experience → Performance Improves → List on Marketplace → Profit!
```

## 🔧 API Reference

### Compute API
```bash
POST /api/compute
{
  "action": "generateStrategy",
  "prompt": "Generate a conservative crypto trading strategy",
  "alpacaContext": { "riskAppetite": 0, "experience": 100 }
}
```

### Storage API
```bash
POST /api/storage
{
  "action": "uploadKnowledge",
  "tokenId": "123",
  "data": { "type": "strategy", "content": "..." }
}
```

### Trading API
```bash
POST /api/trading
{
  "action": "executeTradeSignal",
  "alpacaId": "123",
  "signal": { "action": "BUY", "symbol": "BTCUSDT", "quantity": 0.001 }
}
```

## 🌐 0G Chain Network Details

### Galileo Testnet
- **Chain ID**: 16601 (0x40D9)
- **RPC URL**: https://rpc.ankr.com/0g_galileo_testnet_evm
- **Alternative RPC**: https://evmrpc-testnet.0g.ai
- **Explorer**: https://chainscan-galileo.0g.ai
- **Faucet**: https://faucet.0g.ai

### Contract Addresses

#### Main Contract (Deployed)
```
AlpacaNFT: 0x2451c1c2D71eBec5f63e935670c4bb0Ce19381f5
```
> 🎯 **Contract Ready**: Alpaca NFT smart contract has been successfully deployed to 0G Galileo Testnet and is ready for minting and trading operations.

#### 0G Network Services
```
0G Storage Flow: 0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628
0G DA Entrance: 0xE75A073dA5bb7b0eC622170Fd268f35E675a957B
```

## 🎯 Smart Contract Features

```solidity
// Mint Alpaca with random traits
function mintAlpaca(string memory _name) public payable

// Feed knowledge and gain experience
function feedKnowledge(uint256 tokenId, string memory knowledge) public

// Record trading performance
function recordTrade(uint256 tokenId, int256 pnl, bool isWin) public

// Get Alpaca details
function getAlpaca(uint256 tokenId) public view returns (AlpacaTraits memory)
```

## 🔐 Security Features

- **TEE Verification**: 0G Compute Network provides trusted AI execution
- **Decentralized Storage**: Knowledge and models stored on 0G Storage
- **Smart Contract Security**: OpenZeppelin v5 battle-tested contracts
- **Multi-Wallet Support**: Web3Auth with social login + direct wallet connection
- **Comprehensive Logging**: Detailed error tracking and debugging capabilities

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance & Analytics

- **Real-time Market Data**: Binance API integration
- **AI Strategy Generation**: 0G Compute Network powered
- **Performance Tracking**: Complete P&L analysis
- **Social Features**: Leaderboards and Alpaca rankings

## 🗺️ Roadmap

- [x] **MVP**: Core Alpaca NFT and trading functionality
- [x] **0G Integration**: Storage, Compute, and Chain integration
- [x] **AI Features**: Strategy generation and learning
- [ ] **Advanced Trading**: Options, futures, DeFi protocols
- [ ] **Mobile App**: React Native application
- [ ] **DAO Governance**: Community-driven development

## 🛠️ Troubleshooting

### Common Issues

#### Wallet Connection Errors
1. **Check Console**: Open browser DevTools → Console for detailed logs
2. **Environment Variables**: Ensure all required env vars are set
3. **Network Configuration**: Verify 0G Chain is properly configured in your wallet
4. **Web3Auth Setup**: Confirm Web3Auth client ID is valid

#### RPC Issues
- **Primary RPC**: `https://rpc.ankr.com/0g_galileo_testnet_evm`
- **Backup RPC**: `https://evmrpc-testnet.0g.ai`
- Both RPCs are currently operational and tested

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **0G Labs**: For the revolutionary modular AI blockchain
- **Web3Auth**: For seamless multi-wallet authentication
- **OpenZeppelin**: For secure smart contract standards
- **Binance**: For comprehensive trading APIs
- **Next.js Team**: For the amazing React framework


<div align="center">

**Built with ❤️ on 0G Chain**

*Revolutionizing DeFi through AI-Powered Trading Companions*

</div>