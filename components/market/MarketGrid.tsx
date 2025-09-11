"use client";

import AlpacaListing from "./AlpacaListing";
import { useAllAlpacas } from "@/hooks/useAllAlpacas";

interface MarketGridProps {
  filters: any;
}

export default function MarketGrid({ filters }: MarketGridProps) {
  const { listings, isLoading, error } = useAllAlpacas();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="alpaca-card animate-pulse">
            <div className="w-full h-32 bg-amber-100 rounded mb-4"></div>
            <div className="h-6 bg-amber-100 rounded mb-2"></div>
            <div className="h-4 bg-amber-100 rounded mb-2"></div>
            <div className="h-4 bg-amber-100 rounded mb-2"></div>
            <div className="h-4 bg-amber-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-amber-700">Failed to load Alpacas from the blockchain</p>
        <p className="text-sm text-amber-600 mt-2">Please check your network connection</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-amber-700">No Alpacas found on the blockchain</p>
        <p className="text-sm text-amber-600 mt-2">Mint some Alpacas to see them here!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <AlpacaListing 
          key={listing.tokenId} 
          listing={{
            id: listing.tokenId,
            name: listing.name,
            level: listing.level,
            winRate: listing.winRate,
            price: listing.totalPnL > 0 ? listing.totalPnL / 100 : 0.1 // Simple pricing based on PnL
          }} 
        />
      ))}
    </div>
  );
}