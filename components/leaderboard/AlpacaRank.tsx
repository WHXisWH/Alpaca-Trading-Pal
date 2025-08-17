"use client";

import Link from "next/link";

import Image from "next/image";

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
  const getRankDisplay = () => {
    if (entry.rank === 1) {
      return <Image src="/icons/gold-medal.png" alt="Gold Medal" width={32} height={32} />;
    }
    if (entry.rank === 2) {
      return <Image src="/icons/silver-medal.png" alt="Silver Medal" width={32} height={32} />;
    }
    if (entry.rank === 3) {
      return <Image src="/icons/bronze-medal.png" alt="Bronze Medal" width={32} height={32} />;
    }
    return (
      <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-700 font-bold`}>
        {entry.rank}
      </span>
    );
  };

  return (
    <Link href={`/alpaca/${entry.id}`}>
      <div className="grid grid-cols-5 gap-4 items-center p-3 rounded-lg hover:bg-amber-50 transition-colors">
        <div className="flex items-center justify-center w-8">
          {getRankDisplay()}
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