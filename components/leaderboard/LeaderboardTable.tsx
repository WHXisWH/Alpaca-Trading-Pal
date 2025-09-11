"use client";

import { useMemo } from "react";
import AlpacaRank from "./AlpacaRank";
import { useAllAlpacas } from "@/hooks/useAllAlpacas";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  winRate: number;
  totalPnL: number;
}

export default function LeaderboardTable() {
  const { listings, isLoading, error } = useAllAlpacas();

  const leaderboard = useMemo(() => {
    if (!listings.length) return [];

    // Sort by performance score (combination of PnL, level, and win rate)
    const sorted = listings
      .map(alpaca => ({
        ...alpaca,
        score: (alpaca.totalPnL * 0.4) + (alpaca.level * 10) + (alpaca.winRate * 0.6)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20

    return sorted.map((alpaca, index): LeaderboardEntry => ({
      rank: index + 1,
      id: alpaca.tokenId,
      name: alpaca.name,
      level: alpaca.level,
      winRate: alpaca.winRate,
      totalPnL: alpaca.totalPnL
    }));
  }, [listings]);

  if (isLoading) {
    return (
      <div className="alpaca-card">
        <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-semibold text-amber-700">
          <div>Rank</div>
          <div>Alpaca</div>
          <div>Level</div>
          <div>Win Rate</div>
          <div>Total P&L</div>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-amber-50 rounded-lg p-3">
              <div className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-amber-100 rounded"></div>
                <div className="h-4 bg-amber-100 rounded"></div>
                <div className="h-4 bg-amber-100 rounded"></div>
                <div className="h-4 bg-amber-100 rounded"></div>
                <div className="h-4 bg-amber-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alpaca-card">
        <div className="text-center py-8">
          <p className="text-amber-700">Failed to load leaderboard</p>
          <p className="text-sm text-amber-600 mt-2">Please check your network connection</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="alpaca-card">
        <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-semibold text-amber-700">
          <div>Rank</div>
          <div>Alpaca</div>
          <div>Level</div>
          <div>Win Rate</div>
          <div>Total P&L</div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-amber-700">No Alpacas found for leaderboard</p>
          <p className="text-sm text-amber-600 mt-2">Mint and train some Alpacas to see rankings!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alpaca-card">
      <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-semibold text-amber-700">
        <div>Rank</div>
        <div>Alpaca</div>
        <div>Level</div>
        <div>Win Rate</div>
        <div>Total P&L</div>
      </div>
      
      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <AlpacaRank key={entry.id} entry={entry} />
        ))}
      </div>
      
      {listings.length > leaderboard.length && (
        <div className="text-center mt-4 pt-4 border-t border-amber-200">
          <p className="text-xs text-amber-600">
            Showing top {leaderboard.length} of {listings.length} Alpacas
          </p>
        </div>
      )}
    </div>
  );
}