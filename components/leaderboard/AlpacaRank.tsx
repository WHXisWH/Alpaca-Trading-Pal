"use client";

import Link from "next/link";

interface AlpacaRankProps {
  entry: {
    rank: number;
    id: string;
    name: string;
    level: number;
    winRate: number;
    totalPnL: number;
  };
}

export default function AlpacaRank({ entry }: AlpacaRankProps) {
  const getRankColor = () => {
    if (entry.rank === 1) return "bg-yellow-400";
    if (entry.rank === 2) return "bg-gray-300";
    if (entry.rank === 3) return "bg-amber-600";
    return "bg-amber-100";
  };

  return (
    <Link href={`/alpaca/${entry.id}`}>
      <div className="grid grid-cols-5 gap-4 items-center p-3 rounded-lg hover:bg-amber-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getRankColor()}`}>
            {entry.rank}
          </span>
        </div>
        <div className="font-semibold text-amber-900">{entry.name}</div>
        <div className="text-amber-700">{entry.level}</div>
        <div className="text-green-600 font-semibold">{entry.winRate}%</div>
        <div className={`font-bold ${entry.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${entry.totalPnL}
        </div>
      </div>
    </Link>
  );
}