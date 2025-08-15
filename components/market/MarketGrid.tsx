"use client";

import AlpacaListing from "./AlpacaListing";

interface MarketGridProps {
  filters: any;
}

const mockListings = [
  { id: "1", name: "Warren", level: 5, winRate: 65, price: 0.5 },
  { id: "2", name: "Buffet", level: 8, winRate: 72, price: 1.2 },
  { id: "3", name: "Soros", level: 3, winRate: 58, price: 0.3 },
  { id: "4", name: "Lynch", level: 6, winRate: 68, price: 0.8 },
];

export default function MarketGrid({ filters }: MarketGridProps) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {mockListings.map((listing) => (
        <AlpacaListing key={listing.id} listing={listing} />
      ))}
    </div>
  );
}