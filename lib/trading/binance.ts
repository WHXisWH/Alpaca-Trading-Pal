import axios from "axios";
import crypto from "crypto";
import { TradeRecord } from "@/types/trading";

const BINANCE_TESTNET_API = "https://testnet.binance.vision/api/v3";
// Trading mode: "simulation" (default) or "testnet"
const TRADING_MODE = (process.env.TRADING_MODE || "simulation").toLowerCase();
// Read server-side secrets only; keep NEXT_PUBLIC as last-resort fallback to avoid breaking older envs
const API_KEY = process.env.BINANCE_API_KEY || process.env.NEXT_PUBLIC_BINANCE_API_KEY || "";
const API_SECRET = process.env.BINANCE_API_SECRET || "";

// Popular crypto pairs for demo
const DEMO_PAIRS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT",
  "XRPUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT"
];

export interface MarketData {
  symbol: string;
  price: string;
  volume: string;
  change: string;
  high: string;
  low: string;
  timestamp: number;
}

export interface TradeSignal {
  action: "BUY" | "SELL" | "HOLD";
  symbol: string;
  quantity: number;
  price: number;
  reason: string;
  confidence?: number;
}

export interface OrderResult {
  orderId: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  timestamp: number;
  simulated?: boolean;
  mode?: "simulation" | "testnet";
  fillPrice?: number;
  slippageBps?: number;
}

export class BinanceClient {
  private apiKey: string;
  private apiSecret: string;
  private isDemo: boolean;

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey || API_KEY;
    this.apiSecret = apiSecret || API_SECRET;
    // Force simulation unless explicitly set to testnet and keys are present
    this.isDemo = TRADING_MODE !== "testnet" || !this.apiKey || !this.apiSecret;
    if (this.isDemo) {
      console.log("🔄 Binance client running in simulation mode");
    } else {
      console.log("🔧 Binance client running against testnet (dry-run)");
    }
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private createQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      if (this.isDemo) {
        return this.generateDemoMarketData(symbol);
      }

      const response = await axios.get(`${BINANCE_TESTNET_API}/ticker/24hr`, {
        params: { symbol },
      });
      
      return {
        symbol: response.data.symbol,
        price: response.data.lastPrice,
        volume: response.data.volume,
        change: response.data.priceChangePercent,
        high: response.data.highPrice,
        low: response.data.lowPrice,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      // Fallback to demo data
      return this.generateDemoMarketData(symbol);
    }
  }

  private generateDemoMarketData(symbol: string): MarketData {
    // Generate realistic demo market data
    const basePrice = symbol.includes("BTC") ? 45000 : 
                     symbol.includes("ETH") ? 3000 :
                     symbol.includes("BNB") ? 300 : 1;
    
    const variation = 0.05; // 5% max variation
    const randomFactor = 1 + (Math.random() - 0.5) * variation * 2;
    const price = (basePrice * randomFactor).toFixed(2);
    
    const change = ((randomFactor - 1) * 100).toFixed(2);
    const volume = Math.floor(Math.random() * 1000000).toString();
    
    return {
      symbol,
      price,
      volume,
      change,
      high: (parseFloat(price) * 1.05).toFixed(2),
      low: (parseFloat(price) * 0.95).toFixed(2),
      timestamp: Date.now(),
    };
  }

  async executeTradeSignal(signal: TradeSignal, alpacaId: string): Promise<OrderResult> {
    try {
      console.log(`📊 Executing ${signal.action} for Alpaca ${alpacaId}:`, {
        symbol: signal.symbol,
        quantity: signal.quantity,
        price: signal.price,
        reason: signal.reason
      });

      if (this.isDemo || signal.action === "HOLD") {
        return this.simulateTradeExecution(signal);
      }

      // Real Binance testnet execution
      const params = {
        symbol: signal.symbol,
        side: signal.action,
        type: "LIMIT",
        timeInForce: "GTC",
        quantity: signal.quantity,
        price: signal.price,
        timestamp: Date.now(),
      };

      const queryString = this.createQueryString(params);
      const signature = this.createSignature(queryString);

      const response = await axios.post(
        `${BINANCE_TESTNET_API}/order/test`,
        null,
        {
          params: { ...params, signature },
          headers: {
            "X-MBX-APIKEY": this.apiKey,
          },
        }
      );
      // Even though test endpoint, we return a realistic fill with slippage metadata
      const slippageBps = Math.round((Math.random() * 2 - 1) * 5); // +/-5 bps
      const fillPrice = Number((signal.price * (1 + slippageBps / 10000)).toFixed(2));
      return {
        orderId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol: signal.symbol,
        side: signal.action,
        quantity: signal.quantity,
        price: signal.price,
        status: "FILLED",
        timestamp: Date.now(),
        simulated: true,
        mode: "testnet",
        fillPrice,
        slippageBps,
      };
    } catch (error) {
      console.error("Trade execution failed:", error);
      // Fallback to simulation
      return this.simulateTradeExecution(signal);
    }
  }

  private simulateTradeExecution(signal: TradeSignal): OrderResult {
    // Simulate trade execution with slippage and meta
    const orderId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const slippageBps = Math.round((Math.random() * 2 - 1) * 10); // +/-10 bps
    const fillPrice = Number((signal.price * (1 + slippageBps / 10000)).toFixed(2));

    console.log(`🎭 Simulated ${signal.action} order:`, {
      orderId,
      symbol: signal.symbol,
      quantity: signal.quantity,
      reqPrice: signal.price,
      fillPrice,
      slippageBps,
    });

    return {
      orderId,
      symbol: signal.symbol,
      side: signal.action,
      quantity: signal.quantity,
      price: signal.price,
      status: "FILLED",
      timestamp: Date.now(),
      simulated: true,
      mode: "simulation",
      fillPrice,
      slippageBps,
    };
  }

  async getMultipleMarketData(symbols: string[] = DEMO_PAIRS): Promise<MarketData[]> {
    try {
      const promises = symbols.map(symbol => this.getMarketData(symbol));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error("Failed to fetch multiple market data:", error);
      return [];
    }
  }

  async getAccountBalance(): Promise<any[]> {
    try {
      if (this.isDemo) {
        // Return demo balance
        return [
          { asset: "USDT", free: "10000.00", locked: "0.00" },
          { asset: "BTC", free: "0.1", locked: "0.00" },
          { asset: "ETH", free: "2.5", locked: "0.00" },
        ];
      }

      const params = {
        timestamp: Date.now(),
      };

      const queryString = this.createQueryString(params);
      const signature = this.createSignature(queryString);

      const response = await axios.get(`${BINANCE_TESTNET_API}/account`, {
        params: { ...params, signature },
        headers: {
          "X-MBX-APIKEY": this.apiKey,
        },
      });
      
      return response.data.balances.filter((b: any) => parseFloat(b.free) > 0);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      return [];
    }
  }

  async createTradeRecord(orderResult: OrderResult, alpacaId: string): Promise<TradeRecord> {
    const marketData = await this.getMarketData(orderResult.symbol);
    const pnl = this.calculatePnL(orderResult, marketData);

    const tradeRecord: TradeRecord = {
      id: orderResult.orderId,
      tokenId: alpacaId,
      timestamp: orderResult.timestamp,
      action: orderResult.side as "BUY" | "SELL",
      symbol: orderResult.symbol,
      quantity: orderResult.quantity,
      price: orderResult.price,
      pnl,
      reason: `Executed by AI strategy`,
    };

    console.log(`📝 Created trade record:`, tradeRecord);
    return tradeRecord;
  }

  private calculatePnL(order: OrderResult, currentMarket: MarketData): number {
    // Simplified P&L calculation for demo
    const currentPrice = parseFloat(currentMarket.price);
    const orderPrice = order.fillPrice ?? order.price;
    
    if (order.side === "BUY") {
      return (currentPrice - orderPrice) * order.quantity;
    } else {
      return (orderPrice - currentPrice) * order.quantity;
    }
  }
}

// Export singleton instance
export const binanceClient = new BinanceClient();

// Legacy exports for compatibility
export async function getMarketData(symbol: string): Promise<MarketData> {
  return binanceClient.getMarketData(symbol);
}

export async function executeTestnetTrade(signal: TradeSignal): Promise<OrderResult> {
  return binanceClient.executeTradeSignal(signal, "unknown");
}

export async function getAccountBalance() {
  return binanceClient.getAccountBalance();
}
