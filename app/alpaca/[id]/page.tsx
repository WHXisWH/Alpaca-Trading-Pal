"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import AlpacaCard from "@/components/alpaca/AlpacaCard";
import StatsPanel from "@/components/alpaca/StatsPanel";
import KnowledgeFeed from "@/components/alpaca/KnowledgeFeed";
import TradingPanel from "@/components/alpaca/TradingPanel";
import PerformanceChart from "@/components/alpaca/PerformanceChart";

export default function AlpacaDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AlpacaCard tokenId={params.id as string} />
            <StatsPanel tokenId={params.id as string} />
          </div>
          
          <div className="lg:col-span-2">
            <div className="alpaca-card mb-6">
              <div className="flex gap-4 mb-6">
                {["overview", "feed", "trading", "performance"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                      activeTab === tab
                        ? "bg-amber-500 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-900">Overview</h3>
                  <p className="text-amber-700">
                    Your Alpaca is ready to learn and trade!
                  </p>
                </div>
              )}
              
              {activeTab === "feed" && (
                <KnowledgeFeed tokenId={params.id as string} />
              )}
              
              {activeTab === "trading" && (
                <TradingPanel tokenId={params.id as string} />
              )}
              
              {activeTab === "performance" && (
                <PerformanceChart tokenId={params.id as string} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}