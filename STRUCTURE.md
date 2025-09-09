# 🏗️ Alpaca Trading Pal - Project Structure

This document provides a comprehensive overview of the project architecture, file organization, and component relationships.

## 📂 Directory Structure

```
alpaca-trading-pal/
├── 📱 app/                          # Next.js 14 App Router
│   ├── 🌐 api/                      # API Routes
│   │   ├── compute/route.ts         # 0G Compute Network API
│   │   ├── storage/route.ts         # 0G Storage API
│   │   └── trading/route.ts         # Trading & Binance API
│   ├── 🦙 alpaca/[id]/page.tsx      # Individual Alpaca Profile
│   ├── 🏆 leaderboard/page.tsx      # Alpaca Rankings
│   ├── 🛒 market/page.tsx           # NFT Marketplace
│   ├── 🥚 mint/page.tsx             # Mint New Alpacas
│   ├── globals.css                  # Global Styles
│   ├── layout.tsx                   # Root Layout with Web3 Provider
│   └── page.tsx                     # Landing Page
│
├── 🧩 components/                   # React Components
│   ├── 🦙 alpaca/                   # Alpaca-specific Components
│   │   ├── AchievementsPanel.tsx    # Achievement Display & Progress
│   │   ├── AlpacaCard.tsx           # Alpaca Display Card (Evolution Stages)
│   │   ├── InventoryPanel.tsx       # Equipment & Items Management
│   │   ├── KnowledgeFeed.tsx        # Knowledge Input Interface
│   │   ├── PerformanceChart.tsx     # Trading Performance Visualization
│   │   ├── QuestsPanel.tsx          # Daily Quests Interface
│   │   ├── StatsPanel.tsx           # Statistics Display
│   │   └── TradingPanel.tsx         # Trading Controls
│   ├── 🎨 layout/                   # Layout Components
│   │   ├── AlpacaBackground.tsx     # Animated Background
│   │   ├── Footer.tsx               # Site Footer
│   │   └── Nav.tsx                  # Navigation with Wallet Connect
│   ├── 🏆 leaderboard/              # Leaderboard Components
│   │   ├── AlpacaRank.tsx           # Individual Ranking Item
│   │   └── LeaderboardTable.tsx     # Rankings Table
│   ├── 🛒 market/                   # Marketplace Components
│   │   ├── AlpacaListing.tsx        # NFT Listing Card
│   │   ├── FilterPanel.tsx          # Search & Filter Controls
│   │   └── MarketGrid.tsx           # Grid Layout for Listings
│   ├── 🥚 mint/                     # Minting Components
│   │   ├── AlpacaPreview.tsx        # Preview of Alpaca to be minted
│   │   ├── MintCard.tsx             # Minting Interface
│   │   └── TraitSelector.tsx        # Trait Selection (Read-only)
│   └── 🔧 ui/                       # Reusable UI Components
│       ├── AlpacaCardSkeleton.tsx   # Loading Skeleton for Alpaca Card
│       ├── Button.tsx               # Styled Button Component
│       ├── Card.tsx                 # Card Container
│       ├── ErrorBoundary.tsx        # React Error Boundary Component
│       ├── Input.tsx                # Form Input
│       ├── Modal.tsx                # Modal Dialog
│       ├── QuestsPanelSkeleton.tsx  # Loading Skeleton for Quests
│       ├── Skeleton.tsx             # Base Skeleton Component
│       └── Toast.tsx                # Notification Toast
│
├── 📜 contracts/                    # Smart Contracts
│   ├── AlpacaNFTOptimized.sol      # v0.5 Living Alpaca Contract (Evolution & Equipment)
│   ├── AlpacaItems.sol             # ERC1155 Equipment & Items Contract
│   ├── AlpacaNFT.sol               # Legacy NFT Contract
│   ├── 🚀 deploy/                   # Deployment Scripts
│   │   └── 01-deploy-alpaca.ts      # Alpaca NFT Deployment
│   └── 📋 interfaces/               # Contract Interfaces
│       └── IAlpacaNFT.sol           # NFT Interface Definition
│
├── 🎣 hooks/                        # React Hooks
│   ├── useAlpaca.ts                # Alpaca Data Management (with Mood Calculation)
│   ├── useAutoTrading.ts           # Automated Trading Logic
│   ├── useContract.ts              # Smart Contract Interactions (Equipment Functions)
│   ├── useItems.ts                 # ERC1155 Items Management
│   ├── useKnowledge.ts             # Knowledge Management
│   ├── useQuests.ts                # Daily Quests & Achievement System
│   ├── useStorage.ts               # 0G Storage Operations
│   └── useTrading.ts               # Trading Logic
│
├── 📚 lib/                          # Core Libraries
│   ├── 🔗 0g/                       # 0G Chain Integration
│   │   ├── chain.ts                 # Chain Configuration
│   │   ├── chain-manager.ts         # v0.3.0 High-Performance Chain Manager
│   │   ├── compute.ts               # 0G Compute Network Client
│   │   ├── da.ts                    # Data Availability Layer
│   │   ├── gas-optimizer.ts         # v0.3.0 AI-Driven Gas Optimization
│   │   ├── storage.ts               # 0G Storage Client
│   │   ├── storage-server.ts        # v0.3.0 Real SDK Integration
│   │   ├── transaction-pool.ts      # v0.3.0 High-Performance Transaction Pool
│   │   └── precompiles/             # v0.3.0 Precompiled Contracts
│   │       ├── da-signers.ts        # DASigners Integration
│   │       └── wrapped-og.ts        # WrappedOG Integration
│   ├── 📋 contracts/                # Contract Utilities
│   │   ├── abi.ts                   # Contract ABIs
│   │   └── addresses.ts             # Contract Addresses
│   ├── 📈 trading/                  # Trading Integration
│   │   ├── binance.ts               # Binance API Client
│   │   └── strategies.ts            # Trading Strategies
│   └── 🛠️ utils/                    # Utility Functions
│       ├── constants.ts             # App Constants
│       └── format.ts                # Formatting Helpers
│
├── 🌐 providers/                    # React Context Providers
│   ├── QuestProvider.tsx           # Quest Tracking Context Provider
│   └── Web3Provider.tsx            # Web3 & Wallet Provider
│
├── 🗄️ store/                        # State Management
│   ├── alpacaStore.ts              # Alpaca State (Zustand)
│   └── tradingStore.ts             # Trading State (Zustand)
│
├── 🏷️ types/                        # TypeScript Definitions
│   ├── 0g-serving-broker.d.ts      # 0G Serving Broker Types
│   ├── 0g.d.ts                     # 0G Chain Types
│   ├── alpaca.ts                   # Alpaca & NFT Types (with Evolution & Equipment)
│   ├── quests.ts                   # Quest & Achievement System Types
│   └── trading.ts                  # Trading Types
│
├── 🎨 public/                       # Static Assets
│   ├── 🦙 alpaca/                   # Alpaca Illustrations
│   │   ├── aggressive.webp          # Aggressive Trading Alpaca
│   │   ├── conservative.webp        # Conservative Trading Alpaca
│   │   ├── default.webp             # Default Alpaca
│   │   └── moderate.webp            # Moderate Risk Alpaca
│   ├── 🏆 icons/                    # UI Icons
│   │   ├── bronze-medal.png         # Bronze Medal Icon
│   │   ├── buy-signal.png           # Buy Signal Icon
│   │   ├── gold-medal.png           # Gold Medal Icon
│   │   ├── sell-signal.png          # Sell Signal Icon
│   │   └── silver-medal.png         # Silver Medal Icon
│   ├── 🎯 items/                    # Game Items
│   │   ├── crystal-ball.png         # Prediction Item
│   │   └── trading-terminal.png     # Trading Terminal Item
│   ├── background.webp              # Main Background
│   ├── favicon.webp                 # Site Favicon
│   └── logo.webp                    # App Logo
│
├── ⚙️ Configuration Files
│   ├── hardhat.config.ts           # Hardhat Configuration
│   ├── next.config.js              # Next.js Configuration
│   ├── tailwind.config.ts          # Tailwind CSS Configuration
│   ├── tsconfig.json               # TypeScript Configuration
│   └── package.json                # Dependencies & Scripts
│
├── 📜 scripts/                      # Build & Deploy Scripts
│   ├── demo.js                     # Demo Script
│   └── deploy-all.sh               # Complete Deployment Script
│
└── 📖 Documentation
    ├── README.md                    # Project Overview (v0.5 Living Alpaca)
    ├── STRUCTURE.md                # This File
    ├── UPDATE_NOTES_V0.3.0.txt     # v0.3.0 Technical Update Notes
    ├── MILESTONES_3RD_4TH_WAVE.txt # Future Development Roadmap
    └── CHANGELOG.md                # Version History (gitignored)
    
    📝 Development Files (gitignored):
    ├── upgrade_progress.md          # Implementation Progress Tracking
    ├── upgrade_summary.md           # v0.5 Feature Planning Document
    └── build_failures_summary.md   # Development Issues & Solutions
```

## 🔄 Data Flow Architecture

### 1. **User Interaction Flow**
```
User → Frontend Components → React Hooks → API Routes → 0G Chain Services
```

### 2. **NFT Lifecycle (v0.5 Living Alpaca)**
```
Mint → Store Metadata (0G Storage) → Train AI (0G Compute) → Trade → Level Up → Evolve Stages
```

### 3. **Quest & Achievement System**
```
User Actions → Quest Tracking → Progress Update → Reward Distribution → Achievement Unlock
```

### 4. **Equipment System Flow**
```
Earn Items → Equip/Unequip → Boost Performance → Trade Better → Gain More Experience
```

### 5. **AI Strategy Generation**
```
Market Data → 0G Compute Network → LLM Processing → Trading Strategy → Execution
```

### 6. **Mood System Flow**
```
Trading Results → Performance Analysis → Mood Calculation → Visual Update → User Feedback
```

## 🧩 Component Architecture

### **Page Components** (app/)
- **Routing**: Next.js 14 App Router
- **SSR**: Server-side rendering for SEO
- **API Routes**: Backend functionality

### **UI Components** (components/)
- **Atomic Design**: Reusable UI elements
- **Composition**: Complex components from simple ones
- **Responsive**: Mobile-first design approach

### **Business Logic** (lib/)
- **0G Integration**: Modular 0G Chain services
- **Trading Engine**: Binance API abstraction
- **Utilities**: Helper functions and constants

## 🔗 Integration Points

### **0G Chain Services**

#### **0G Storage Network**
```typescript
// Knowledge Storage
zgStorage.uploadKnowledge({
  type: "strategy",
  content: tradingStrategy,
  tokenId: alpacaId
});

// Model Metadata Storage  
zgStorage.uploadModelMetadata(tokenId, modelData);

// Performance Data Storage
zgStorage.uploadPerformanceData(tokenId, performanceData);
```

#### **0G Compute Network (v0.3.0 Enhanced)**
```typescript
// Dual AI Model Strategy Generation
zgCompute.generateTradingStrategy(prompt, alpacaContext); // llama-3.3-70b
zgCompute.performAdvancedAnalysis(analysisRequest);      // deepseek-r1-70b

// Custom Model Training
zgCompute.trainCustomModel(trainingData);

// Batch Inference Processing
zgCompute.batchInferenceRequest(batchRequests);
```

### **Smart Contract Integration (v0.3.0 Optimized)**
```typescript
// v0.3.0 Batch Operations (85% Gas Savings)
useAlpacaContract.batchMintAlpacas({ names, value });
useAlpacaContract.batchFeedKnowledge({ knowledgeBatch });
useAlpacaContract.batchRecordTrades({ tradeBatch });

// Legacy Individual Operations (Still Supported)
useAlpacaContract.mintAlpaca({ name, value });
useAlpacaContract.feedKnowledge({ tokenId, knowledge });
useAlpacaContract.recordTrade({ tokenId, pnl, isWin });

// Enhanced Data Retrieval
useAlpacaContract.optimizedGetMultipleAlpacas({ tokenIds });
```

### **Trading Integration**
```typescript
// Get Market Data
binanceClient.getMarketData(symbol);

// Execute Trading Signal
binanceClient.executeTradeSignal(signal, alpacaId);

// Get Account Balance
binanceClient.getAccountBalance();
```

## 🎯 Key Design Patterns

### **1. Singleton Pattern**
- `zgStorage`, `zgCompute`, `binanceClient` - Single instances for service clients

### **2. Factory Pattern**
- Smart contract interactions through factory functions
- Component creation with consistent props

### **3. Observer Pattern**
- React state management with Zustand
- Real-time updates for trading data

### **4. Strategy Pattern**
- Different trading strategies based on Alpaca traits
- Modular AI model selection

### **5. Adapter Pattern**
- 0G Chain service wrappers
- Binance API abstraction layers

## 📊 State Management

### **Global State** (Zustand)
```typescript
// Alpaca Store
- alpacaList: AlpacaNFT[]
- currentAlpaca: AlpacaNFT | null
- loading: boolean

// Trading Store  
- activePositions: Position[]
- tradingRules: TradingRule[]
- performance: PerformanceMetrics
```

### **Local State** (React Hooks)
```typescript
// Component-level state for UI interactions
// Form states, modal visibility, loading states
```

### **Server State** (wagmi)
```typescript
// Blockchain data caching and synchronization
// Contract read/write operations
// Wallet connection state
```

## 🛡️ Security Architecture

### **Frontend Security**
- Input validation and sanitization
- XSS protection with proper escaping
- CSRF protection with API routes

### **Smart Contract Security**
- OpenZeppelin v5 security standards
- Access control with ownership patterns
- Reentrancy protection

### **API Security**
- Rate limiting on API routes
- Input validation with TypeScript
- Environment variable protection

### **0G Chain Security**
- TEE (Trusted Execution Environment) for AI computation
- Decentralized storage with data integrity
- Cryptographic verification of results

## 🔧 Development Tools

### **Build Tools**
- **Next.js**: React framework with SSR/SSG
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **Hardhat**: Ethereum development environment

### **Web3 Tools**
- **Web3Auth**: Multi-wallet authentication with social login
- **Web3.js**: Ethereum JavaScript library
- **MetaMask Adapter**: Direct wallet connection
- **WalletConnect V2**: Multi-wallet protocol support

### **Development Workflow**
```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting
npm run type-check # TypeScript validation
npm run deploy     # Smart contract deployment
```

## 📈 Performance Optimizations

### **Frontend Optimizations (v0.5 Enhanced)**
- **React.memo**: Optimized component re-rendering for AlpacaCard, QuestsPanel, AchievementsPanel
- **Loading Skeletons**: Professional loading states with AlpacaCardSkeleton, QuestsPanelSkeleton
- **Image Optimization**: Next.js Image component with priority loading
- **Error Boundaries**: Comprehensive ErrorBoundary components for fault tolerance
- **Mobile Optimization**: Touch-friendly interfaces with improved tap targets
- **Animation Performance**: Smooth 300-700ms transitions with hardware acceleration

### **Blockchain Optimizations (v0.3.0 Enhanced)**
- **AI-Driven Gas Optimization**: Machine learning price prediction with multi-strategy selection
- **High-Performance Transaction Pool**: 2,500+ TPS capacity with parallel execution
- **Batch Operations**: Up to 50 transactions per batch with 85% gas savings
- **Dynamic Load Balancing**: Real-time workload distribution across 0G network

### **0G Chain Benefits (v0.3.0)**
- **Enterprise-Grade Performance**: 2,500+ TPS with intelligent transaction management
- **Advanced Gas Optimization**: Up to 85% cost savings through batch processing
- **Precompiled Contract Integration**: Native DASigners and WrappedOG support
- **Fault-Tolerant Architecture**: Smart fallback mechanisms with simulation mode

## 🧪 Testing Strategy

### **Unit Testing**
- Component testing with React Testing Library
- Hook testing with custom test utilities
- Utility function testing

### **Integration Testing**
- API route testing with mock data
- Smart contract testing with Hardhat
- End-to-end user flows

### **Manual Testing**
- Cross-browser compatibility
- Mobile responsiveness
- Wallet connection flows

## 🚀 Deployment Architecture

### **Frontend Deployment**
- **Vercel**: Next.js optimized hosting
- **Environment Variables**: Secure configuration
- **CDN**: Global content distribution

### **Smart Contract Deployment**
- **0G Galileo Testnet**: Development environment
- **Contract Verification**: Source code verification
- **Upgrade Patterns**: Future-proof contract design

### **Monitoring & Analytics**
- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: Runtime error logging
- **Usage Analytics**: User behavior insights

---

<div align="center">

**🏗️ Architecture designed for scalability, security, and user experience**

*Built with modern best practices on 0G Chain*

</div>