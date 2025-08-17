"use client";

import { useState, useEffect } from "react";
import { useAutoTrading } from "@/hooks/useAutoTrading";
import { motion } from "framer-motion";
import Image from "next/image";

interface TradingPanelProps {
  tokenId: string;
}

export default function TradingPanel({ tokenId }: TradingPanelProps) {
  const { status, config, startAutoTrading, stopAutoTrading, updateConfig } = useAutoTrading(tokenId);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/trading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getMultipleMarketData',
            symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
          })
        });
        const data = await response.json();
        if (data.success) {
          const prices: { [key: string]: any } = {};
          data.marketData.forEach((item: any) => {
            prices[item.symbol] = item;
          });
          setMarketPrices(prices);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-amber-900">AI Trading Control</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-amber-600 hover:text-amber-700"
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-700 font-semibold">Status</span>
            <motion.span
              animate={{ scale: status.isRunning ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 2, repeat: status.isRunning ? Infinity : 0 }}
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                status.isRunning 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {status.isRunning ? "🤖 Active" : "💤 Inactive"}
            </motion.span>
          </div>
          <div className="text-xs text-green-600">
            Last Update: {formatTime(status.lastUpdate)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-blue-700 font-semibold mb-2">Performance</div>
          <div className="text-2xl font-bold text-blue-900">
            {status.totalPnL >= 0 ? "+" : ""}{status.totalPnL.toFixed(2)} USDT
          </div>
          <div className="text-xs text-blue-600">
            {status.totalTrades} trades executed
          </div>
        </div>
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-amber-50 p-4 rounded-lg space-y-3"
        >
          <div>
            <label className="text-sm text-amber-700">Trading Pair</label>
            <select
              value={config.symbol}
              onChange={(e) => updateConfig({ symbol: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-amber-200"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-amber-700">Trading Interval</label>
            <select
              value={config.interval}
              onChange={(e) => updateConfig({ interval: parseInt(e.target.value) })}
              className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-amber-200"
            >
              <option value="60000">1 minute</option>
              <option value="300000">5 minutes</option>
              <option value="900000">15 minutes</option>
              <option value="3600000">1 hour</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-amber-700">Risk Per Trade (%)</label>
            <input
              type="number"
              value={config.riskPerTrade * 100}
              onChange={(e) => updateConfig({ riskPerTrade: parseFloat(e.target.value) / 100 })}
              className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-amber-200"
              min="0.1"
              max="10"
              step="0.1"
            />
          </div>
        </motion.div>
      )}

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-3">Live Market</h4>
        <div className="space-y-2">
          {Object.values(marketPrices).length > 0 ? (
            Object.values(marketPrices).map((market: any) => (
              <div key={market.symbol} className="flex justify-between items-center">
                <span className="text-amber-700 font-medium">{market.symbol}</span>
                <div className="text-right">
                  <span className="font-bold text-amber-900">${market.price}</span>
                  <span className={`ml-2 text-sm ${
                    parseFloat(market.change) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {parseFloat(market.change) >= 0 ? "↑" : "↓"} {market.change}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-amber-600 text-sm">Loading market data...</div>
          )}
        </div>
      </div>

      {status.lastAction && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-purple-700 font-semibold">Last Action</span>
            <div className="flex items-center gap-2">
              {status.lastAction === "BUY" && <Image src="/icons/buy-signal.png" alt="Buy" width={20} height={20} />}
              {status.lastAction === "SELL" && <Image src="/icons/sell-signal.png" alt="Sell" width={20} height={20} />}
              <span className={`font-bold ${
                status.lastAction === "BUY" ? "text-green-600" :
                status.lastAction === "SELL" ? "text-red-600" :
                "text-gray-600"
              }`}>
                {status.lastAction}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => status.isRunning ? stopAutoTrading() : startAutoTrading()}
        className={`w-full px-6 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
          status.isRunning 
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
            : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
        }`}
      >
        {status.isRunning ? "🛑 Stop AI Trading" : "🚀 Start AI Trading"}
      </button>

      <div className="bg-amber-50 p-3 rounded-lg">
        <p className="text-xs text-amber-600">
          ⚠️ Trading uses Binance Testnet. Your Alpaca learns from each trade to improve strategy.
        </p>
      </div>
    </div>
  );
}