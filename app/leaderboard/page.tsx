"use client";

import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-amber-900 text-center mb-12">
        Alpaca Leaderboard
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <LeaderboardTable />
      </div>
    </div>
  );
}