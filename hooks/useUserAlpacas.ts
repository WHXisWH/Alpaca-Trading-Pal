import { useState, useCallback, useEffect } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import { ALPACA_NFT_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { getReadOnlyWeb3 } from "@/lib/web3/readProvider";

export function useUserAlpacas(address: string | null) {
  const { web3 } = useWeb3();
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserTokens = useCallback(async () => {
    if (!address || CONTRACT_ADDRESSES.ALPACA_NFT === "0x0000000000000000000000000000000000000000") {
      return;
    }

    setIsLoading(true);
    setError(null);

    const primaryWeb3 = web3;
    const fallbackWeb3 = getReadOnlyWeb3();

    const attemptFetch = async (w3: any) => {
      const contract = new w3.eth.Contract(
        ALPACA_NFT_ABI as any,
        CONTRACT_ADDRESSES.ALPACA_NFT
      );

      console.log("Contract address:", CONTRACT_ADDRESSES.ALPACA_NFT);
      console.log("User address:", address);

      // Optional quick balance check
      try {
        console.log("Calling balanceOf...");
        const balance = await contract.methods.balanceOf(address).call();
        console.log(`User balance: ${balance} tokens`);
        if (balance === '0' || balance === 0) return [] as string[];
      } catch { /* some contracts might not implement balanceOf properly */ }

      console.log("Calling getAllTokensByOwner...");
      const tokens = await contract.methods.getAllTokensByOwner(address).call();
      return tokens.map((id: any) => id.toString());
    };

    try {
      if (primaryWeb3) {
        try {
          const tokens = await attemptFetch(primaryWeb3);
          setTokenIds(tokens);
          console.log(`Found ${tokens.length} Alpacas for user ${address}`);
        } catch (e) {
          console.warn("Primary provider failed, trying fallback:", e);
          if (fallbackWeb3) {
            const tokens = await attemptFetch(fallbackWeb3);
            setTokenIds(tokens);
            console.log(`Found ${tokens.length} Alpacas for user ${address} (fallback)`);
          } else {
            throw e;
          }
        }
      } else if (fallbackWeb3) {
        const tokens = await attemptFetch(fallbackWeb3);
        setTokenIds(tokens);
        console.log(`Found ${tokens.length} Alpacas for user ${address} (fallback only)`);
      }
    } catch (err) {
      console.error("Failed to fetch user tokens:", err);
      // Handle RPC node sync issues gracefully
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as any).message || "";
        if (message.includes('missing trie node') || message.includes('state is not available')) {
          console.log("RPC node sync issue detected, showing empty state");
          setTokenIds([]);
          setIsLoading(false);
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
