"use client";

import { useAlpaca } from "@/hooks/useAlpaca";

interface StatsPanelProps {
  tokenId: string;
}

export default function StatsPanel({ tokenId }: StatsPanelProps) {
  const { alpaca } = useAlpaca(tokenId);

  const stats = [
    { label: "Win Rate", value: `${alpaca?.winRate || 0}%`, color: "green" },
    { label: "Total P&L", value: `$${alpaca?.totalPnL || 0}`, color: "amber" },
    { label: "Experience", value: alpaca?.experience || 0, color: "blue" },
  ];

  return (
    <div className="alpaca-card mt-6">
      <h3 className="text-xl font-bold text-amber-900 mb-4">Statistics</h3>
      
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-amber-700">{stat.label}</span>
            <span className={`font-bold text-${stat.color}-600`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}