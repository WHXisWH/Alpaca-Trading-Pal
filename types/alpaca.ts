export interface AlpacaTraits {
  name: string;
  riskAppetite: number;
  learningSpeed: number;
  preferredMarket: number;
  level: bigint;
  experience: bigint;
  modelURI: string;
  performanceURI: string;
  totalTrades: bigint;
  totalPnL: bigint;
  wins: bigint;
  birthTime: bigint;
}

export interface AlpacaDisplayTraits {
  name: string;
  riskAppetite: number;
  learningSpeed: number;
  preferredMarket: number;
  level: number;
  experience: number;
  modelURI: string;
  performanceURI: string;
  totalTrades: number;
  totalPnL: number;
  wins: number;
  winRate: number;
  birthTime: number;
}

export interface AlpacaNFT extends AlpacaTraits {
  tokenId: string;
  owner: string;
}

export interface AlpacaDisplayNFT extends AlpacaDisplayTraits {
  tokenId: string;
  owner: string;
}

export interface MintAlpacaParams {
  name: string;
  value?: string;
}

export interface FeedKnowledgeParams {
  tokenId: string;
  knowledge: string;
}

export interface RecordTradeParams {
  tokenId: string;
  pnl: string;
  isWin: boolean;
}

export enum RiskAppetite {
  CONSERVATIVE = 0,
  MODERATE = 1,
  AGGRESSIVE = 2
}

export enum LearningSpeed {
  SLOW = 0,
  NORMAL = 1,
  FAST = 2
}

export enum PreferredMarket {
  CRYPTO = 0,
  STOCKS = 1,
  FOREX = 2
}