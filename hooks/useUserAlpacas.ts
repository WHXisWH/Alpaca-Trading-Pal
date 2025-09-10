import { useState, useCallback, useEffect } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import { ALPACA_NFT_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

export function useUserAlpacas(address: string | null) {
  const { web3 } = useWeb3();
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserTokens = useCallback(async () => {
    if (!web3 || !address || CONTRACT_ADDRESSES.ALPACA_NFT === "0x0000000000000000000000000000000000000000") {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const contract = new web3.eth.Contract(
        ALPACA_NFT_ABI as any,
        CONTRACT_ADDRESSES.ALPACA_NFT
      );
      
      console.log("Contract address:", CONTRACT_ADDRESSES.ALPACA_NFT);
      console.log("User address:", address);
      
      // Check if user has any tokens first
      console.log("Calling balanceOf...");
      const balance = await contract.methods.balanceOf(address).call();
      console.log(`User balance: ${balance} tokens`);
      
      if (balance === '0' || balance === 0) {
        setTokenIds([]);
        console.log(`No Alpacas found for user ${address}`);
        return;
      }
      
      console.log("Calling getAllTokensByOwner...");
      const tokens = await contract.methods.getAllTokensByOwner(address).call();
      setTokenIds(tokens.map((id: any) => id.toString()));
      
      console.log(`Found ${tokens.length} Alpacas for user ${address}`);
    } catch (err) {
      console.error("Failed to fetch user tokens:", err);
      
      // Handle RPC node sync issues gracefully
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as any).message;
        if (message.includes('missing trie node') || message.includes('state is not available')) {
          console.log("RPC node sync issue detected, showing empty state");
          setTokenIds([]);
          return;
        }
      }
      
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [web3, address]);

  useEffect(() => {
    fetchUserTokens();
  }, [fetchUserTokens]);

  return {
    tokenIds,
    isLoading,
    error,
    refetch: fetchUserTokens,
  };
}