"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useWeb3 } from "@/providers/Web3Provider";
import { useUserAlpacas } from "@/hooks/useUserAlpacas";
import { useAlpaca } from "@/hooks/useAlpaca";

interface AlpacaDisplayCardProps {
  tokenId: string;
}

function AlpacaDisplayCard({ tokenId }: AlpacaDisplayCardProps) {
  const { alpaca, loading } = useAlpaca(tokenId);

  if (loading) {
    return (
      <div className="alpaca-card animate-pulse h-80">
        <div className="w-32 h-32 bg-amber-200 rounded-lg mx-auto mb-4"></div>
        <div className="h-6 bg-amber-200 rounded mb-2"></div>
        <div className="h-4 bg-amber-100 rounded"></div>
      </div>
    );
  }

  if (!alpaca) {
    return (
      <div className="alpaca-card h-80 flex items-center justify-center">
        <div className="text-center text-amber-600">
          <div className="text-2xl mb-2">🦙</div>
          <div>Alpaca #{tokenId}</div>
          <div className="text-sm text-amber-500">Loading failed</div>
        </div>
      </div>
    );
  }

  const getMoodImage = () => {
    if (alpaca.riskAppetite === 0) return "/alpaca/conservative.webp";
    if (alpaca.riskAppetite === 2) return "/alpaca/aggressive.webp";
    return "/alpaca/moderate.webp";
  };

  const getRiskLabel = () => {
    if (alpaca.riskAppetite === 0) return "Conservative";
    if (alpaca.riskAppetite === 2) return "Aggressive";
    return "Moderate";
  };

  const getSpeedLabel = () => {
    if (alpaca.learningSpeed === 0) return "Steady";
    if (alpaca.learningSpeed === 2) return "Fast";
    return "Normal";
  };

  const getMarketLabel = () => {
    if (alpaca.preferredMarket === 0) return "Crypto";
    if (alpaca.preferredMarket === 1) return "Forex";
    return "Stocks";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className="alpaca-card relative overflow-hidden group cursor-pointer flex flex-col h-full"
    >
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          #{tokenId}
        </span>
      </div>

      <div className="text-center p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="relative mb-4">
            <Image
              src={getMoodImage()}
              alt={alpaca.name}
              width={120}
              height={120}
              className="mx-auto rounded-lg"
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                Lv.{alpaca.level}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-amber-900 mb-2 truncate">
            {alpaca.name}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-600">Risk:</span>
              <span className="font-semibold text-amber-800">{getRiskLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-600">Speed:</span>
              <span className="font-semibold text-amber-800">{getSpeedLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-600">Market:</span>
              <span className="font-semibold text-amber-800">{getMarketLabel()}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2 text-xs">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {alpaca.totalTrades} trades
          </span>
          <span className={`px-2 py-1 rounded-full ${
            alpaca.totalPnL >= 0 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {alpaca.totalPnL >= 0 ? '+' : ''}${alpaca.totalPnL}
          </span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold text-center">
          Train & Trade
        </div>
      </div>
    </motion.div>
  );
}

export default function MyAlpacasPage() {
  const { address, isConnected } = useWeb3();
  const { tokenIds, isLoading, error } = useUserAlpacas(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-8"
          >
            <Image
              src="/alpaca/default.webp"
              alt="Connect Wallet"
              width={200}
              height={200}
              className="mx-auto opacity-50"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">My Alpacas</h1>
          <p className="text-amber-700 mb-6">Connect your wallet to view your trading companions</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-amber-800 text-sm">
              🔗 Use the "Connect Wallet" button in the navigation to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-amber-900 text-center mb-12">My Alpacas</h1>
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-amber-700 mt-4">Loading your trading companions...</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="alpaca-card animate-pulse h-80">
              <div className="w-32 h-32 bg-amber-200 rounded-lg mx-auto mb-4 mt-8"></div>
              <div className="h-6 bg-amber-200 rounded mb-2 mx-4"></div>
              <div className="h-4 bg-amber-100 rounded mx-4 mb-2"></div>
              <div className="h-4 bg-amber-100 rounded mx-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-amber-900 text-center mb-12">My Alpacas</h1>
        <div className="max-w-md mx-auto text-center">
          <div className="alpaca-card border-red-200 bg-red-50">
            <div className="text-6xl mb-4">😵</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Loading Failed</h3>
            <p className="text-red-600 mb-4 text-sm">
              Unable to fetch your Alpacas from the blockchain
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tokenIds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <Image
              src="/alpaca/default.webp"
              alt="No Alpacas"
              width={250}
              height={250}
              className="mx-auto"
            />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-amber-900 mb-4">No Alpacas Yet</h1>
          <p className="text-xl text-amber-700 mb-8">
            Your trading journey starts with minting your first AI companion
          </p>
          
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">What you'll get:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-white p-4 rounded-lg border border-amber-100">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-semibold text-amber-900">AI Brain</h4>
                <p className="text-sm text-amber-700">Learns from your trading strategies</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-100">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-semibold text-amber-900">Auto Trading</h4>
                <p className="text-sm text-amber-700">Executes trades while you sleep</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-100">
                <div className="text-2xl mb-2">💎</div>
                <h4 className="font-semibold text-amber-900">NFT Value</h4>
                <p className="text-sm text-amber-700">Grows in value with performance</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/mint">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
              >
                🥚 Mint Your First Alpaca
              </motion.button>
            </Link>
            <Link href="/market">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
              >
                🛒 Browse Marketplace
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-3">
            My Trading Alpacas
          </h1>
          <p className="text-lg text-amber-600">
            You have {tokenIds.length} AI trading companion{tokenIds.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {tokenIds.map((tokenId, index) => (
            <motion.div
              key={tokenId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Link href={`/alpaca/${tokenId}`} className="h-full block">
                <AlpacaDisplayCard tokenId={tokenId} />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">Ready to expand your team?</h3>
            <p className="text-amber-700 mb-6">
              Each Alpaca has unique traits and learns differently. Build a diverse portfolio of AI traders!
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/mint">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <span>🥚</span>
                  Mint Another Alpaca
                </motion.button>
              </Link>
              
              <Link href="/market">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <span>🛒</span>
                  Browse Marketplace
                </motion.button>
              </Link>
              
              <Link href="/leaderboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <span>🏆</span>
                  View Leaderboard
                </motion.button>
              </Link>
            </div>
          </div>

          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p>💡 <strong>Tip:</strong> Click on any Alpaca to start training, feed knowledge, or enable auto-trading!</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
