export interface TradeRecord {
  id: string;
  tokenId: string;
  timestamp: number;
  action: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  pnl: number;
  reason: string;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
  sharpeRatio: number;
}