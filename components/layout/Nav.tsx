"use client";

import Link from "next/link";
import Image from "next/image";
import { useWeb3 } from "@/providers/Web3Provider";
import { Button } from "@/components/ui/Button";

export default function Nav() {
  const { address, isConnected, isLoading, login, logout } = useWeb3();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/alpaca/happy.svg"
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
              <Link href={`/alpaca/${address}`} className="text-amber-700 hover:text-amber-900 font-semibold">
                My Alpacas
              </Link>
            )}
            
            {/* Web3Auth Connect Button */}
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
                <Button 
                  onClick={login}
                  className="alpaca-button"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}