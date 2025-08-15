import { useMemo } from "react";
import { useAlpacaRead } from "./useContract";
import { AlpacaTraits, AlpacaDisplayTraits } from "@/types/alpaca";

export function useAlpaca(tokenId: string) {
  const { alpaca: rawAlpaca, isLoading, error } = useAlpacaRead(tokenId);

  const alpaca: AlpacaDisplayTraits | null = useMemo(() => {
    if (!rawAlpaca) return null;
    
    const traits = rawAlpaca as AlpacaTraits;
    const totalTrades = Number(traits.totalTrades);
    const wins = Number(traits.wins);
    
    return {
      name: traits.name,
      riskAppetite: traits.riskAppetite,
      learningSpeed: traits.learningSpeed,
      preferredMarket: traits.preferredMarket,
      level: Number(traits.level),
      experience: Number(traits.experience),
      modelURI: traits.modelURI,
      performanceURI: traits.performanceURI,
      totalTrades,
      totalPnL: Number(traits.totalPnL),
      wins,
      winRate: totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0,
      birthTime: Number(traits.birthTime),
    };
  }, [rawAlpaca]);

  return { 
    alpaca, 
    loading: isLoading,
    error 
  };
}