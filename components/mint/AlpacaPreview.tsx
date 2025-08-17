"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface AlpacaPreviewProps {
  name: string;
  traits: any;
}

export default function AlpacaPreview({ name, traits }: AlpacaPreviewProps) {
  const getPreviewImage = () => {
    if (traits.riskAppetite === 0) return "/alpaca/conservative.webp";
    if (traits.riskAppetite === 2) return "/alpaca/aggressive.webp";
    if (traits.riskAppetite === 1) return "/alpaca/moderate.webp";
    return "/alpaca/default.webp";
  };

  return (
    <div className="alpaca-card h-full flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Image
          src={getPreviewImage()}
          alt="Alpaca Preview"
          width={300}
          height={300}
        />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-amber-900 mt-6">
        {name || "Your Alpaca"}
      </h3>
      
      <p className="text-amber-700 mt-2">
        Ready to learn and trade!
      </p>
    </div>
  );
}