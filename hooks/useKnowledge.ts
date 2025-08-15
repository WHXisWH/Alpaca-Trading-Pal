import { useState, useCallback } from "react";
import { zgStorage } from "@/lib/0g/storage";
import { useWeb3 } from "@/providers/Web3Provider";

interface KnowledgeItem {
  id: string;
  content: string;
  timestamp: number;
  type: "knowledge" | "model" | "performance";
  storageUrl: string;
}

export function useKnowledge(tokenId: string) {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useWeb3();

  // Store knowledge items in localStorage as a simple demo implementation
  // In real app, this would come from 0G storage or blockchain events
  const getStorageKey = useCallback(() => `alpaca-knowledge-${tokenId}`, [tokenId]);

  const loadKnowledge = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load from localStorage for demo
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const items = JSON.parse(stored);
        setKnowledgeItems(items);
      }
    } catch (error) {
      console.error("Failed to load knowledge:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  const addKnowledge = useCallback(async (content: string, type: "knowledge" | "model" | "performance" = "knowledge") => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      // Upload to 0G Storage
      const storageResult = await zgStorage.uploadKnowledge({
        type,
        content,
        tokenId,
        metadata: { source: "user_input" }
      });

      // Create knowledge item
      const newItem: KnowledgeItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        content,
        timestamp: Date.now(),
        type,
        storageUrl: storageResult.url
      };

      // Update local storage
      const currentItems = [...knowledgeItems, newItem];
      setKnowledgeItems(currentItems);
      localStorage.setItem(getStorageKey(), JSON.stringify(currentItems));

      return newItem;
    } catch (error) {
      console.error("Failed to add knowledge:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, tokenId, knowledgeItems, getStorageKey]);

  const getAllKnowledge = useCallback((): string[] => {
    return knowledgeItems
      .filter(item => item.type === "knowledge")
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.content);
  }, [knowledgeItems]);

  const getKnowledgeSummary = useCallback((): string => {
    const knowledge = getAllKnowledge();
    if (knowledge.length === 0) {
      return "No previous trading knowledge available.";
    }

    const summary = knowledge.slice(0, 5).join("; ");
    return `Previous learning: ${summary}${knowledge.length > 5 ? ` (and ${knowledge.length - 5} more strategies)` : ""}`;
  }, [getAllKnowledge]);

  return {
    knowledgeItems,
    isLoading,
    loadKnowledge,
    addKnowledge,
    getAllKnowledge,
    getKnowledgeSummary
  };
}