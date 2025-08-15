"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface AlpacaListingProps {
  listing: {
    id: string;
    name: string;
    level: number;
    winRate: number;
    price: number;
  };
}

export default function AlpacaListing({ listing }: AlpacaListingProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="alpaca-card"
    >
      <div className="text-center mb-4">
        <Image
          src="/alpaca/happy.svg"
          alt={listing.name}
          width={120}
          height={120}
          className="mx-auto"
        />
      </div>
      
      <h3 className="text-xl font-bold text-amber-900 text-center">
        {listing.name}
      </h3>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-amber-600">Level</span>
          <span className="font-semibold text-amber-900">{listing.level}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-amber-600">Win Rate</span>
          <span className="font-semibold text-green-600">{listing.winRate}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-amber-600">Price</span>
          <span className="font-semibold text-amber-900">{listing.price} OG</span>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Link
          href={`/alpaca/${listing.id}`}
          className="flex-1 text-center bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg font-semibold"
        >
          View
        </Link>
        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
          Buy
        </button>
      </div>
    </motion.div>
  );
}