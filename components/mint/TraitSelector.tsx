"use client";

interface TraitSelectorProps {
  traits: {
    riskAppetite: number;
    learningSpeed: number;
    preferredMarket: number;
  };
  onTraitsChange: (traits: any) => void;
}

const RISK_LEVELS = ["Conservative", "Balanced", "Aggressive"];
const LEARNING_SPEEDS = ["Steady", "Normal", "Fast"];
const MARKETS = ["Crypto", "Forex", "Stocks"];

export default function TraitSelector({ traits, onTraitsChange }: TraitSelectorProps) {
  return (
    <div className="alpaca-card">
      <h3 className="text-xl font-bold text-amber-900 mb-4">
        Random Traits Preview
      </h3>
      
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700 font-semibold">Risk Appetite</p>
          <p className="text-green-900">
            {RISK_LEVELS[traits.riskAppetite] || "Random"}
          </p>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 font-semibold">Learning Speed</p>
          <p className="text-blue-900">
            {LEARNING_SPEEDS[traits.learningSpeed] || "Random"}
          </p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-purple-700 font-semibold">Preferred Market</p>
          <p className="text-purple-900">
            {MARKETS[traits.preferredMarket] || "Random"}
          </p>
        </div>
        
        <p className="text-xs text-amber-600 italic">
          * Traits are randomly assigned when minting
        </p>
      </div>
    </div>
  );
}