"use client";

import { useState } from "react";
import { useAlpacaContract } from "@/hooks/useContract";
import { motion } from "framer-motion";

interface MintCardProps {
  name: string;
  onNameChange: (name: string) => void;
  traits: {
    riskAppetite: number;
    learningSpeed: number;
    preferredMarket: number;
  };
}

export default function MintCard({ name, onNameChange, traits }: MintCardProps) {
  const [isMinting, setIsMinting] = useState(false);
  const { mintAlpaca } = useAlpacaContract();

  const handleMint = async () => {
    if (!name) return;
    
    setIsMinting(true);
    try {
      await mintAlpaca({ name });
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <motion.div 
      className="alpaca-card"
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-2xl font-bold text-amber-900 mb-6">
        Create Your Alpaca
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-amber-700 mb-2">
            Alpaca Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="alpaca-input"
            placeholder="Enter a name for your Alpaca"
          />
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-700">
            Minting Cost: <span className="font-bold">0.01 OG</span>
          </p>
          <p className="text-sm text-amber-600 mt-2">
            Your Alpaca will be born with random traits that affect its trading style!
          </p>
        </div>
        
        <button
          onClick={handleMint}
          disabled={!name || isMinting}
          className="alpaca-button w-full"
        >
          {isMinting ? "Minting..." : "Mint Alpaca"}
        </button>
      </div>
    </motion.div>
  );
}