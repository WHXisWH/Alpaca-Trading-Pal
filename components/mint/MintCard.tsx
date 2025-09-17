"use client";

import { useState } from "react";
import { useAlpacaContract } from "@/hooks/useContract";
import { motion } from "framer-motion";
import Link from "next/link";

interface MintCardProps {
  name: string;
  onNameChange: (name: string) => void;
  traits: {
    riskAppetite: number;
    learningSpeed: number;
    preferredMarket: number;
  };
}

export default function MintCard({ name, onNameChange, traits }: MintCardProps) {
  const [isMinting, setIsMinting] = useState(false);
  const { mintAlpaca } = useAlpacaContract();
  const [successInfo, setSuccessInfo] = useState<{ tokenId?: string; txHash?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMint = async () => {
    if (!name) return;
    
    setIsMinting(true);
    try {
      setErrorMsg(null);
      const receipt: any = await mintAlpaca({ name });
      const tokenId = receipt?.events?.AlpacaMinted?.returnValues?.tokenId?.toString?.();
      const txHash = receipt?.transactionHash as string | undefined;
      setSuccessInfo({ tokenId, txHash });
    } catch (error) {
      console.error("Minting failed:", error);
      setSuccessInfo(null);
      setErrorMsg(error instanceof Error ? error.message : "Mint 失败，请重试");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <motion.div 
      className="alpaca-card"
      whileHover={{ scale: 1.02 }}
    >
      {successInfo && (
        <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm">
          <div className="font-semibold mb-1">🎉 Mint 成功！</div>
          {successInfo.tokenId && (
            <div className="mb-1">Token ID: {successInfo.tokenId}</div>
          )}
          {successInfo.txHash && (
            <div className="mb-2 break-all">Tx: {successInfo.txHash.slice(0, 10)}...{successInfo.txHash.slice(-8)}</div>
          )}
          <div className="flex gap-3">
            <Link href="/my-alpacas" className="underline">前往 My Alpacas 查看</Link>
            <button className="underline" onClick={() => setSuccessInfo(null)}>关闭</button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <div className="font-semibold mb-1">Mint 失败</div>
          <div className="mb-2">{errorMsg}</div>
          <button className="underline" onClick={() => setErrorMsg(null)}>关闭</button>
        </div>
      )}
      <h2 className="text-2xl font-bold text-amber-900 mb-6">
        Create Your Alpaca
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-amber-700 mb-2">
            Alpaca Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="alpaca-input"
            placeholder="Enter a name for your Alpaca"
          />
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-700">
            Minting Cost: <span className="font-bold">0.01 OG</span>
          </p>
          <p className="text-sm text-amber-600 mt-2">
            Your Alpaca will be born with random traits that affect its trading style!
          </p>
        </div>
        
        <button
          onClick={handleMint}
          disabled={!name || isMinting}
          className="alpaca-button w-full"
        >
          {isMinting ? "Minting..." : "Mint Alpaca"}
        </button>
      </div>
    </motion.div>
  );
}
