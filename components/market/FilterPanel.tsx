"use client";

interface FilterPanelProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  return (
    <div className="alpaca-card">
      <h3 className="text-xl font-bold text-amber-900 mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-amber-700 mb-2 text-sm">
            Min Level
          </label>
          <input
            type="number"
            min="1"
            value={filters.minLevel}
            onChange={(e) => onFiltersChange({ ...filters, minLevel: e.target.value })}
            className="alpaca-input"
          />
        </div>
        
        <div>
          <label className="block text-amber-700 mb-2 text-sm">
            Max Price (OG)
          </label>
          <input
            type="number"
            step="0.1"
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
            className="alpaca-input"
          />
        </div>
        
        <div>
          <label className="block text-amber-700 mb-2 text-sm">
            Risk Appetite
          </label>
          <select
            value={filters.riskAppetite}
            onChange={(e) => onFiltersChange({ ...filters, riskAppetite: e.target.value })}
            className="alpaca-input"
          >
            <option value="all">All</option>
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        
        <button className="alpaca-button w-full">
          Apply Filters
        </button>
      </div>
    </div>
  );
}