import { create } from "zustand";
import { Rule } from "@/lib/trading/strategies";

interface TradingState {
  rules: Map<string, Rule[]>;
  tradingIntervals: Map<string, NodeJS.Timeout>;
  setRules: (tokenId: string, rules: Rule[]) => void;
  getRules: (tokenId: string) => Rule[];
  setTradingInterval: (tokenId: string, interval: NodeJS.Timeout) => void;
  getTradingInterval: (tokenId: string) => NodeJS.Timeout | undefined;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  rules: new Map(),
  tradingIntervals: new Map(),
  
  setRules: (tokenId, rules) => {
    set((state) => {
      const newRules = new Map(state.rules);
      newRules.set(tokenId, rules);
      return { rules: newRules };
    });
  },
  
  getRules: (tokenId) => {
    return get().rules.get(tokenId) || [];
  },
  
  setTradingInterval: (tokenId, interval) => {
    set((state) => {
      const newIntervals = new Map(state.tradingIntervals);
      newIntervals.set(tokenId, interval);
      return { tradingIntervals: newIntervals };
    });
  },
  
  getTradingInterval: (tokenId) => {
    return get().tradingIntervals.get(tokenId);
  },
}));