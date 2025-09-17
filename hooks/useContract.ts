import { useState, useCallback, useEffect } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import { ALPACA_NFT_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { MintAlpacaParams, FeedKnowledgeParams, RecordTradeParams } from "@/types/alpaca";
import { ethers } from "ethers";
import Web3 from "web3";
import { getReadOnlyWeb3 } from "@/lib/web3/readProvider";

export function useAlpacaContract() {
  const { web3, address } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);

  const getContract = useCallback(() => {
    if (!web3 || !CONTRACT_ADDRESSES.ALPACA_NFT) {
      throw new Error("Web3 or contract address not available");
    }
    
    return new web3.eth.Contract(
      ALPACA_NFT_ABI as any,
      CONTRACT_ADDRESSES.ALPACA_NFT
    );
  }, [web3]);

  const mintAlpaca = async ({ name, value = "0.01" }: MintAlpacaParams) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    try {
      const contract = getContract();
      const valueWei = Web3.utils.toWei(value, 'ether');
      
      const result = await contract.methods.mintAlpaca(name).send({
        from: address,
        value: valueWei,
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const feedKnowledge = async ({ tokenId, knowledge }: FeedKnowledgeParams) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    try {
      const contract = getContract();
      
      const result = await contract.methods.feedKnowledge(tokenId, knowledge).send({
        from: address,
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateModelURI = async (tokenId: string, modelURI: string) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    try {
      const contract = getContract();
      
      const result = await contract.methods.updateModelURI(tokenId, modelURI).send({
        from: address,
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const recordTrade = async ({ tokenId, pnl, isWin }: RecordTradeParams) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    try {
      const contract = getContract();
      
      const result = await contract.methods.recordTrade(tokenId, pnl, isWin).send({
        from: address,
      });
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const equipItem = async (tokenId: string, itemId: number) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    try {
      const contract = getContract();
      const result = await contract.methods.equipItem(tokenId, itemId).send({ from: address });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const unequipItem = async (tokenId: string) => {
    if (!address) throw new Error("Wallet not connected");
    
    setIsLoading(true);
    try {
      const contract = getContract();
      const result = await contract.methods.unequipItem(tokenId).send({ from: address });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mintAlpaca,
    feedKnowledge,
    updateModelURI,
    recordTrade,
    equipItem,
    unequipItem,
    isLoading,
  };
}

export function useAlpacaRead(tokenId: string | undefined) {
  const { web3 } = useWeb3();
  const [alpaca, setAlpaca] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlpaca = useCallback(async () => {
    if (!tokenId || CONTRACT_ADDRESSES.ALPACA_NFT === "0x0000000000000000000000000000000000000000") {
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
      try {
        const res = await contract.methods.getAlpaca(tokenId).call();
        return res;
      } catch (e: any) {
        const msg = (e?.message || "").toString();
        const decodeErr = msg.includes("invalid codepoint") || msg.includes("missing continuation byte") || msg.includes("could not decode");
        if (!decodeErr) throw e;
        // Fallback to legacy tuple layout (without evolutionStage/equipmentId)
        const LEGACY_ABI = [
          {
            inputs: [{ name: "tokenId", type: "uint256" }],
            name: "getAlpaca",
            outputs: [
              {
                components: [
                  { name: "name", type: "string" },
                  { name: "riskAppetite", type: "uint8" },
                  { name: "learningSpeed", type: "uint8" },
                  { name: "preferredMarket", type: "uint8" },
                  { name: "level", type: "uint256" },
                  { name: "experience", type: "uint256" },
                  { name: "modelURI", type: "string" },
                  { name: "performanceURI", type: "string" },
                  { name: "totalTrades", type: "uint256" },
                  { name: "totalPnL", type: "int256" },
                  { name: "wins", type: "uint256" },
                  { name: "birthTime", type: "uint256" }
                ],
                name: "",
                type: "tuple"
              }
            ],
            stateMutability: "view",
            type: "function"
          }
        ];
        const legacy = new w3.eth.Contract(LEGACY_ABI as any, CONTRACT_ADDRESSES.ALPACA_NFT);
        const legacyRes = await legacy.methods.getAlpaca(tokenId).call();
        // Normalize to new shape by injecting defaults
        return {
          ...legacyRes,
          evolutionStage: legacyRes.evolutionStage ?? 0,
          equipmentId: legacyRes.equipmentId ?? 0,
        };
      }
    };

    try {
      if (primaryWeb3) {
        try {
          const result = await attemptFetch(primaryWeb3);
          // Ensure fields exist for consumers
          const normalized = {
            ...result,
            evolutionStage: (result as any).evolutionStage ?? 0,
            equipmentId: (result as any).equipmentId ?? 0,
          };
          setAlpaca(normalized);
        } catch (e) {
          if (fallbackWeb3) {
            const result = await attemptFetch(fallbackWeb3);
            const normalized = {
              ...result,
              evolutionStage: (result as any).evolutionStage ?? 0,
              equipmentId: (result as any).equipmentId ?? 0,
            };
            setAlpaca(normalized);
          } else {
            throw e;
          }
        }
      } else if (fallbackWeb3) {
        const result = await attemptFetch(fallbackWeb3);
        const normalized = {
          ...result,
          evolutionStage: (result as any).evolutionStage ?? 0,
          equipmentId: (result as any).equipmentId ?? 0,
        };
        setAlpaca(normalized);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [web3, tokenId]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchAlpaca();
  }, [fetchAlpaca]);

  return {
    alpaca,
    isLoading,
    error,
    refetch: fetchAlpaca,
  };
}
