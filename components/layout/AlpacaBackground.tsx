"use client";

import Image from "next/image";

export default function AlpacaBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src="/background.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={80}
      />
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
    </div>
  );
}