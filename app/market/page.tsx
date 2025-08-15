"use client";

import { useState } from "react";
import MarketGrid from "@/components/market/MarketGrid";
import FilterPanel from "@/components/market/FilterPanel";

export default function MarketPage() {
  const [filters, setFilters] = useState({
    minLevel: 1,
    maxPrice: 1000,
    riskAppetite: "all",
  });

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-amber-900 text-center mb-12">
        Alpaca Marketplace
      </h1>
      
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>
        
        <div className="lg:col-span-3">
          <MarketGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}