"use client";

import { Line } from "recharts";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  tokenId: string;
}

const mockData = [
  { date: "Jan 1", pnl: 0 },
  { date: "Jan 5", pnl: 50 },
  { date: "Jan 10", pnl: 120 },
  { date: "Jan 15", pnl: 80 },
  { date: "Jan 20", pnl: 150 },
  { date: "Jan 25", pnl: 220 },
  { date: "Jan 30", pnl: 280 },
];

export default function PerformanceChart({ tokenId }: PerformanceChartProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-amber-900">Performance History</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
            <XAxis dataKey="date" stroke="#92400e" />
            <YAxis stroke="#92400e" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fef3c7", 
                border: "1px solid #f59e0b" 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="pnl" 
              stroke="#f59e0b" 
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-xs text-green-600">Best Day</p>
          <p className="text-lg font-bold text-green-900">+$70</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <p className="text-xs text-red-600">Worst Day</p>
          <p className="text-lg font-bold text-red-900">-$40</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-600">Avg Daily</p>
          <p className="text-lg font-bold text-blue-900">+$9.3</p>
        </div>
      </div>
    </div>
  );
}