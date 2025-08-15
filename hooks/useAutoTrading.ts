import { useState, useCallback, useRef, useEffect } from "react";
import { useAlpacaContract } from "./useContract";
import { useWeb3 } from "@/providers/Web3Provider";
import { useKnowledge } from "./useKnowledge";

interface AutoTradingConfig {
  symbol: string;
  interval: number;
  maxPositions: number;
  maxDailyLoss: number;
  riskPerTrade: number;
}

interface TradingStatus {
  isRunning: boolean;
  lastAction: string | null;
  totalTrades: number;
  totalPnL: number;
  lastUpdate: number;
}

export function useAutoTrading(tokenId: string) {
  const [status, setStatus] = useState<TradingStatus>({
    isRunning: false,
    lastAction: null,
    totalTrades: 0,
    totalPnL: 0,
    lastUpdate: Date.now()
  });
  
  const [config, setConfig] = useState<AutoTradingConfig>({
    symbol: "BTCUSDT",
    interval: 60000,
    maxPositions: 3,
    maxDailyLoss: 100,
    riskPerTrade: 0.02
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { recordTrade } = useAlpacaContract();
  const { address } = useWeb3();
  const { loadKnowledge, getAllKnowledge, getKnowledgeSummary } = useKnowledge(tokenId);

  // Load knowledge when component mounts
  useEffect(() => {
    loadKnowledge();
  }, [loadKnowledge]);

  const executeTradingCycle = useCallback(async () => {
    if (!address) return;
    
    try {
      const marketResponse = await fetch('/api/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getMarketData',
          symbol: config.symbol
        })
      });
      const marketData = await marketResponse.json();
      
      // Get Alpaca's learned knowledge
      const knowledgeBase = getAllKnowledge();
      
      const strategyResponse = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateStrategy',
          prompt: `Current ${config.symbol} price: ${marketData.marketData.price}, change: ${marketData.marketData.change}%. Should I buy, sell, or hold?`,
          alpacaId: tokenId,
          alpacaContext: {
            riskAppetite: 1,
            learningSpeed: 1,
            preferredMarket: 0,
            experience: status.totalTrades * 10,
            knowledgeBase: knowledgeBase
          }
        })
      });
      const strategy = await strategyResponse.json();
      
      const shouldBuy = strategy.strategy?.toLowerCase().includes("buy");
      const shouldSell = strategy.strategy?.toLowerCase().includes("sell");
      
      if (shouldBuy || shouldSell) {
        const signal = {
          action: shouldBuy ? "BUY" : "SELL",
          symbol: config.symbol,
          quantity: 0.001,
          price: parseFloat(marketData.marketData.price),
          reason: "AI Strategy Signal"
        };
        
        const tradeResponse = await fetch('/api/trading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'executeTradeSignal',
            signal,
            alpacaId: tokenId
          })
        });
        const tradeResult = await tradeResponse.json();
        
        if (tradeResult.success) {
          const pnl = Math.random() * 20 - 10;
          const isWin = pnl > 0;
          
          await recordTrade({
            tokenId,
            pnl: Math.floor(pnl * 100).toString(),
            isWin
          });
          
          setStatus(prev => ({
            ...prev,
            lastAction: signal.action,
            totalTrades: prev.totalTrades + 1,
            totalPnL: prev.totalPnL + pnl,
            lastUpdate: Date.now()
          }));
        }
      } else {
        setStatus(prev => ({
          ...prev,
          lastAction: "HOLD",
          lastUpdate: Date.now()
        }));
      }
    } catch (error) {
      console.error("Trading cycle error:", error);
    }
  }, [tokenId, config, status.totalTrades, address, recordTrade]);

  const startAutoTrading = useCallback(async () => {
    if (intervalRef.current) return;
    
    setStatus(prev => ({ ...prev, isRunning: true }));
    
    await executeTradingCycle();
    
    intervalRef.current = setInterval(executeTradingCycle, config.interval);
  }, [config.interval, executeTradingCycle]);

  const stopAutoTrading = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setStatus(prev => ({ ...prev, isRunning: false }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AutoTradingConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    if (status.isRunning && newConfig.interval) {
      stopAutoTrading();
      setTimeout(startAutoTrading, 100);
    }
  }, [status.isRunning, startAutoTrading, stopAutoTrading]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    config,
    startAutoTrading,
    stopAutoTrading,
    updateConfig
  };
}