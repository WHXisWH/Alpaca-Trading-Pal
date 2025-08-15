"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MintCard from "@/components/mint/MintCard";
import TraitSelector from "@/components/mint/TraitSelector";
import AlpacaPreview from "@/components/mint/AlpacaPreview";

export default function MintPage() {
  const [name, setName] = useState("");
  const [traits, setTraits] = useState({
    riskAppetite: 0,
    learningSpeed: 0,
    preferredMarket: 0,
  });

  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-amber-900 text-center mb-12">
          Mint Your Alpaca Trading Pal
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <MintCard 
              name={name}
              onNameChange={setName}
              traits={traits}
            />
            <TraitSelector 
              traits={traits}
              onTraitsChange={setTraits}
            />
          </div>
          
          <div>
            <AlpacaPreview 
              name={name}
              traits={traits}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}