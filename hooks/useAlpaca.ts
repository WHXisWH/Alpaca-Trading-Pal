import { useMemo } from "react";
import { useAlpacaRead } from "./useContract";
import { AlpacaTraits, AlpacaDisplayTraits } from "@/types/alpaca";

const getAlpacaMood = (winRate: number, totalPnL: number): string => {
  if (winRate > 75 && totalPnL > 100) return "Ecstatic";
  if (winRate > 60 && totalPnL > 20) return "Confident";
  if (winRate < 40 && totalPnL < -20) return "Frustrated";
  return "Calm";
};

export function useAlpaca(tokenId: string) {
  const { alpaca: rawAlpaca, isLoading, error } = useAlpacaRead(tokenId);

  const alpaca: AlpacaDisplayTraits | null = useMemo(() => {
    if (!rawAlpaca) return null;
    
    const traits = rawAlpaca as AlpacaTraits;
    const totalTrades = Number(traits.totalTrades);
    const wins = Number(traits.wins);
    const totalPnL = Number(traits.totalPnL);
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    
    return {
      name: traits.name,
      riskAppetite: traits.riskAppetite,
      learningSpeed: traits.learningSpeed,
      preferredMarket: traits.preferredMarket,
      level: Number(traits.level),
      experience: Number(traits.experience),
      evolutionStage: Number(traits.evolutionStage),
      equipmentId: Number(traits.equipmentId),
      mood: getAlpacaMood(winRate, totalPnL),
      modelURI: traits.modelURI,
      performanceURI: traits.performanceURI,
      totalTrades,
      totalPnL,
      wins,
      winRate,
      birthTime: Number(traits.birthTime),
    };
  }, [rawAlpaca]);

  return { 
    alpaca, 
    loading: isLoading,
    error 
  };
}
