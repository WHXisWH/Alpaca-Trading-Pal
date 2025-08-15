"use client";

import { useState, useEffect } from "react";
import { useAlpacaContract } from "@/hooks/useContract";
import { useKnowledge } from "@/hooks/useKnowledge";

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
  const { addKnowledge, knowledgeItems, loadKnowledge } = useKnowledge(tokenId);

  // Load existing knowledge when component mounts
  useEffect(() => {
    loadKnowledge();
  }, [loadKnowledge]);

  const handleFeed = async () => {
    if (!knowledge) return;
    
    setIsFeeding(true);
    try {
      // Add to knowledge base
      const knowledgeItem = await addKnowledge(knowledge);
      
      // Record to smart contract
      await feedKnowledge({ tokenId, knowledge: knowledgeItem.storageUrl });
      
      setKnowledge("");
      
      // Reload knowledge to update display
      await loadKnowledge();
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

      {/* Display learned knowledge */}
      {knowledgeItems.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="text-lg font-semibold text-green-800 mb-3">
            🧠 Learned Knowledge ({knowledgeItems.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {knowledgeItems
              .filter(item => item.type === "knowledge")
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="text-sm text-green-700 bg-white p-2 rounded border-l-4 border-green-400">
                  <div className="font-medium">{item.content}</div>
                  <div className="text-xs text-green-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            {knowledgeItems.filter(item => item.type === "knowledge").length > 5 && (
              <div className="text-xs text-green-600 text-center mt-2">
                ... and {knowledgeItems.filter(item => item.type === "knowledge").length - 5} more knowledge items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}