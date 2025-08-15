"use client";

import { useState } from "react";
import { useAlpacaContract } from "@/hooks/useContract";
import { useStorage } from "@/hooks/useStorage";

interface KnowledgeFeedProps {
  tokenId: string;
}

const STRATEGY_TEMPLATES = [
  "Buy when RSI < 30",
  "Sell when RSI > 70",
  "Use 20-day moving average",
  "Set stop loss at 5%",
  "Take profit at 10%",
];

export default function KnowledgeFeed({ tokenId }: KnowledgeFeedProps) {
  const [knowledge, setKnowledge] = useState("");
  const [isFeeding, setIsFeeding] = useState(false);
  const { feedKnowledge } = useAlpacaContract();
  const { uploadToStorage } = useStorage();

  const handleFeed = async () => {
    if (!knowledge) return;
    
    setIsFeeding(true);
    try {
      const storageUri = await uploadToStorage({
        type: "knowledge",
        content: knowledge,
        tokenId,
      });
      
      await feedKnowledge({ tokenId, knowledge: storageUri });
      setKnowledge("");
    } catch (error) {
      console.error("Feeding failed:", error);
    } finally {
      setIsFeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-amber-900">Feed Knowledge</h3>
      
      <div>
        <label className="block text-amber-700 mb-2">
          Trading Strategy or Knowledge
        </label>
        <textarea
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value)}
          className="alpaca-input h-32"
          placeholder="Enter a trading strategy or market insight..."
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {STRATEGY_TEMPLATES.map((template) => (
          <button
            key={template}
            onClick={() => setKnowledge(template)}
            className="bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg text-sm text-amber-700"
          >
            {template}
          </button>
        ))}
      </div>
      
      <button
        onClick={handleFeed}
        disabled={!knowledge || isFeeding}
        className="alpaca-button w-full"
      >
        {isFeeding ? "Feeding..." : "Feed Knowledge"}
      </button>
    </div>
  );
}