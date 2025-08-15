"use client";

import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";

interface TradingPanelProps {
  tokenId: string;
}

export default function TradingPanel({ tokenId }: TradingPanelProps) {
  const [isTrading, setIsTrading] = useState(false);
  const { startTrading, stopTrading, tradingStatus } = useTrading(tokenId);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-amber-900">Trading Control</h3>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-green-700 font-semibold">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isTrading ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
          }`}>
            {isTrading ? "Active" : "Inactive"}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Exchange</span>
            <span className="text-green-900">Binance Testnet</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Balance</span>
            <span className="text-green-900">1000 USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Open Positions</span>
            <span className="text-green-900">0</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => isTrading ? stopTrading() : startTrading()}
        className={`w-full px-6 py-3 rounded-full font-semibold transition-all ${
          isTrading 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        {isTrading ? "Stop Trading" : "Start Trading"}
      </button>
      
      <div className="bg-amber-50 p-3 rounded-lg">
        <p className="text-xs text-amber-600">
          ⚠️ Trading uses Binance Testnet. No real funds at risk.
        </p>
      </div>
    </div>
  );
}