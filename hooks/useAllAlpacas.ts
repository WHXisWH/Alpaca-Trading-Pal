import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import { ALPACA_NFT_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { AlpacaTraits } from "@/types/alpaca";

interface AlpacaListing {
  tokenId: string;
  name: string;
  level: number;
  winRate: number;
  totalPnL: number;
  owner: string;
  isForSale?: boolean;
  price?: number;
}

export function useAllAlpacas() {
  const { web3 } = useWeb3();
  const [listings, setListings] = useState<AlpacaListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllAlpacas = useCallback(async () => {
    if (!web3 || CONTRACT_ADDRESSES.ALPACA_NFT === "0x0000000000000000000000000000000000000000") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new web3.eth.Contract(
        ALPACA_NFT_ABI as any,
        CONTRACT_ADDRESSES.ALPACA_NFT
      );

      // Get total supply to iterate through tokens
      let totalSupply = 0;
      try {
        totalSupply = await contract.methods.totalSupply().call();
      } catch {
        // Fallback: try to get tokens by checking tokenIds 1-100
        totalSupply = 100;
      }

      const alpacaPromises: Promise<AlpacaListing | null>[] = [];
      
      // Iterate through possible token IDs
      for (let tokenId = 1; tokenId <= Math.min(totalSupply, 50); tokenId++) {
        const promise = (async (): Promise<AlpacaListing | null> => {
          try {
            // Check if token exists by trying to get owner
            const owner = await contract.methods.ownerOf(tokenId).call();
            
            // Get alpaca data
            const alpacaData: AlpacaTraits = await contract.methods.getAlpaca(tokenId).call();
            
            const totalTrades = Number(alpacaData.totalTrades);
            const wins = Number(alpacaData.wins);
            const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

            return {
              tokenId: tokenId.toString(),
              name: alpacaData.name || `Alpaca #${tokenId}`,
              level: Number(alpacaData.level),
              winRate,
              totalPnL: Number(alpacaData.totalPnL),
              owner,
              isForSale: false, // TODO: Add marketplace contract integration
              price: 0 // TODO: Add marketplace pricing
            };
          } catch {
            // Token doesn't exist or other error
            return null;
          }
        })();
        
        alpacaPromises.push(promise);
      }

      const results = await Promise.all(alpacaPromises);
      const validAlpacas = results.filter((alpaca): alpaca is AlpacaListing => alpaca !== null);
      
      // Sort by performance (level and win rate)
      validAlpacas.sort((a, b) => {
        if (a.level !== b.level) return b.level - a.level;
        return b.winRate - a.winRate;
      });

      setListings(validAlpacas);
    } catch (err) {
      console.error("Failed to fetch all alpacas:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [web3]);

  useEffect(() => {
    fetchAllAlpacas();
  }, [fetchAllAlpacas]);

  return {
    listings,
    isLoading,
    error,
    refetch: fetchAllAlpacas,
  };
}