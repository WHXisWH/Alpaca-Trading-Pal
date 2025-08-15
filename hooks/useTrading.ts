import { useState, useEffect } from "react";
import { useAlpacaStore } from "@/store/alpacaStore";
import { useTradingStore } from "@/store/tradingStore";
import { getMarketData, executeTestnetTrade } from "@/lib/trading/binance";
import { evaluateRules } from "@/lib/trading/strategies";

export function useTrading(tokenId: string) {
  const [isTrading, setIsTrading] = useState(false);
  const [tradingStatus, setTradingStatus] = useState("idle");
  
  const startTrading = async () => {
    setIsTrading(true);
    setTradingStatus("active");
    
    const interval = setInterval(async () => {
      try {
        const marketData = await getMarketData("BTCUSDT");
        
        const rules = useTradingStore.getState().getRules(tokenId);
        const signal = evaluateRules(rules, marketData);
        
        if (signal) {
          await executeTestnetTrade({
            action: signal.action as "BUY" | "SELL" | "HOLD",
            symbol: "BTCUSDT",
            quantity: 0.001,
            price: parseFloat(marketData.price),
            reason: signal.reason,
          });
        }
      } catch (error) {
        console.error("Trading error:", error);
      }
    }, 60000);
    
    useTradingStore.getState().setTradingInterval(tokenId, interval);
  };
  
  const stopTrading = () => {
    setIsTrading(false);
    setTradingStatus("stopped");
    
    const interval = useTradingStore.getState().getTradingInterval(tokenId);
    if (interval) {
      clearInterval(interval);
    }
  };
  
  return {
    isTrading,
    tradingStatus,
    startTrading,
    stopTrading,
  };
}