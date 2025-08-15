"use client";

import AlpacaRank from "./AlpacaRank";

const mockLeaderboard = [
  { rank: 1, id: "1", name: "AlphaTrader", level: 10, winRate: 78, totalPnL: 5420 },
  { rank: 2, id: "2", name: "MoonWalker", level: 9, winRate: 75, totalPnL: 4850 },
  { rank: 3, id: "3", name: "DiamondHooves", level: 8, winRate: 72, totalPnL: 3920 },
  { rank: 4, id: "4", name: "GoldenFleece", level: 7, winRate: 68, totalPnL: 3200 },
  { rank: 5, id: "5", name: "SilverMane", level: 6, winRate: 65, totalPnL: 2800 },
];

export default function LeaderboardTable() {
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
        {mockLeaderboard.map((entry) => (
          <AlpacaRank key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}