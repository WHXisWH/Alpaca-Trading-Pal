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

    // Prefer read-only public RPC to avoid MetaMask rate limiting for reads
    const fallbackWeb3 = getReadOnlyWeb3();
    const primaryWeb3 = web3;

    const attemptFetch = async (w3: any) => {
      const contract = new w3.eth.Contract(
        ALPACA_NFT_ABI as any,
        CONTRACT_ADDRESSES.ALPACA_NFT
      );
      const tokens = await contract.methods.getAllTokensByOwner(address).call();
      return tokens.map((id: any) => id.toString());
    };

    try {
      if (fallbackWeb3) {
        const tokens = await attemptFetch(fallbackWeb3);
        setTokenIds(tokens);
        console.log(`Found ${tokens.length} Alpacas for user ${address} (read-only RPC)`);
      } else if (primaryWeb3) {
        const tokens = await attemptFetch(primaryWeb3);
        setTokenIds(tokens);
        console.log(`Found ${tokens.length} Alpacas for user ${address} (wallet provider)`);
      }
    } catch (err) {
      console.error("Failed to fetch user tokens:", err);
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
