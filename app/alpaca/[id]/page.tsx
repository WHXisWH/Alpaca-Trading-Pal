"use client";

import { useParams } from "next/navigation";
import { useAlpaca } from "@/hooks/useAlpaca";
import { useQuests } from "@/hooks/useQuests";
import { useEffect } from "react";
import { AlpacaCard } from "@/components/alpaca/AlpacaCard";
import PerformanceChart from "@/components/alpaca/PerformanceChart";
import StatsPanel from "@/components/alpaca/StatsPanel";
import TradingPanel from "@/components/alpaca/TradingPanel";
import KnowledgeFeed from "@/components/alpaca/KnowledgeFeed";
import { InventoryPanel } from "@/components/alpaca/InventoryPanel";
import { QuestsPanel } from "@/components/alpaca/QuestsPanel";
import { AchievementsPanel } from "@/components/alpaca/AchievementsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlpacaCardSkeleton } from "@/components/ui/AlpacaCardSkeleton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function AlpacaProfilePage() {
  const params = useParams();
  const tokenId = params.id as string;
  const { alpaca, loading, error } = useAlpaca(tokenId);
  const { trackAction } = useQuests();

  // Track profile visit for quest
  useEffect(() => {
    if (alpaca && tokenId) {
      trackAction('visit_profile');
    }
  }, [alpaca, tokenId, trackAction]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Loading your Alpaca...</div>
      </div>
    );
  }

  if (error || !alpaca) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-red-500">
          Could not load Alpaca. It might be on a different network or the ID is invalid.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column */}
        <div className="xl:col-span-1 space-y-4 lg:space-y-6">
          {loading ? <AlpacaCardSkeleton /> : <AlpacaCard alpaca={alpaca} tokenId={tokenId} />}
          <StatsPanel tokenId={tokenId} />
          
          {/* Mobile: Quest and Achievements side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <ErrorBoundary>
              <QuestsPanel />
            </ErrorBoundary>
            <ErrorBoundary>
              <AchievementsPanel />
            </ErrorBoundary>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart tokenId={tokenId} />
            </CardContent>
          </Card>

          <ErrorBoundary>
            <TradingPanel tokenId={tokenId} />
          </ErrorBoundary>

          <ErrorBoundary>
            <InventoryPanel tokenId={tokenId} currentEquipmentId={alpaca.equipmentId} />
          </ErrorBoundary>

          <ErrorBoundary>
            <KnowledgeFeed tokenId={tokenId} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}