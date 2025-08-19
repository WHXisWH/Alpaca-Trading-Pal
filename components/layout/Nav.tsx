"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import { Button } from "@/components/ui/Button";

export default function Nav() {
  const { address, isConnected, isLoading, login, loginWithWallet, logout } = useWeb3();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-amber-900">
              Alpaca Trading Pal
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/mint" className="text-amber-700 hover:text-amber-900 font-semibold">
              Mint
            </Link>
            <Link href="/market" className="text-amber-700 hover:text-amber-900 font-semibold">
              Market
            </Link>
            <Link href="/leaderboard" className="text-amber-700 hover:text-amber-900 font-semibold">
              Leaderboard
            </Link>
            {address && (
              <Link href="/my-alpacas" className="text-amber-700 hover:text-amber-900 font-semibold">
                My Alpacas
              </Link>
            )}
            
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Button disabled className="alpaca-button">
                  Loading...
                </Button>
              ) : isConnected && address ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700 font-medium">
                    {formatAddress(address)}
                  </span>
                  <Button 
                    onClick={logout}
                    className="alpaca-button text-sm px-4 py-2"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  {showLoginOptions ? (
                    <div className="absolute right-0 top-0 bg-white border border-amber-200 rounded-lg shadow-lg p-3 min-w-[250px]">
                      <div className="text-center mb-3">
                        <h3 className="font-semibold text-amber-900 text-sm">Connect to Alpaca Trading Pal</h3>
                        <p className="text-xs text-gray-600 mt-1">Choose your preferred connection method</p>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          login();
                          setShowLoginOptions(false);
                        }}
                        className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 flex items-center justify-center gap-2"
                      >
                        <span>🔗</span> Web3 Wallets
                      </Button>
                      <div className="text-xs text-gray-500 text-center mb-2">MetaMask, WalletConnect, and more</div>
                      
                      <Button 
                        onClick={() => {
                          loginWithWallet();
                          setShowLoginOptions(false);
                        }}
                        className="w-full mb-2 bg-orange-600 hover:bg-orange-700 text-white text-sm py-3 flex items-center justify-center gap-2"
                      >
                        <span>🦊</span> MetaMask Direct
                      </Button>
                      <div className="text-xs text-gray-500 text-center mb-3">Direct MetaMask connection</div>
                      
                      <Button 
                        onClick={() => setShowLoginOptions(false)}
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white text-xs py-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setShowLoginOptions(true)}
                      className="alpaca-button"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}