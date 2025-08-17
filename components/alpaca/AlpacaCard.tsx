"use client";

import Image from "next/image";
import { useAlpaca } from "@/hooks/useAlpaca";
import { motion } from "framer-motion";

interface AlpacaCardProps {
  tokenId: string;
}

export default function AlpacaCard({ tokenId }: AlpacaCardProps) {
  const { alpaca, loading } = useAlpaca(tokenId);

  if (loading) {
    return <div className="alpaca-card animate-pulse h-64" />;
  }

  const getMoodImage = () => {
    if (!alpaca) return "/alpaca/default.webp";
    if (alpaca.riskAppetite === 0) return "/alpaca/conservative.webp";
    if (alpaca.riskAppetite === 2) return "/alpaca/aggressive.webp";
    return "/alpaca/moderate.webp";
  };

  return (
    <motion.div 
      className="alpaca-card text-center"
      whileHover={{ scale: 1.02 }}
    >
      <Image
        src={getMoodImage()}
        alt={alpaca?.name || "Alpaca"}
        width={200}
        height={200}
        className="mx-auto mb-4"
      />
      
      <h2 className="text-2xl font-bold text-amber-900">
        {alpaca?.name}
      </h2>
      
      <div className="mt-4 flex justify-center gap-2">
        <span className="bg-amber-100 px-3 py-1 rounded-full text-sm text-amber-700">
          Level {alpaca?.level}
        </span>
        <span className="bg-green-100 px-3 py-1 rounded-full text-sm text-green-700">
          {alpaca?.totalTrades} Trades
        </span>
      </div>
    </motion.div>
  );
}