import { useState, useCallback, useEffect } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import { ALPACA_NFT_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { MintAlpacaParams, FeedKnowledgeParams, RecordTradeParams } from "@/types/alpaca";
import { ethers } from "ethers";
import Web3 from "web3";

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
    if (!web3 || !tokenId || CONTRACT_ADDRESSES.ALPACA_NFT === "0x0000000000000000000000000000000000000000") {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const contract = new web3.eth.Contract(
        ALPACA_NFT_ABI as any,
        CONTRACT_ADDRESSES.ALPACA_NFT
      );
      
      const result = await contract.methods.getAlpaca(tokenId).call();
      setAlpaca(result);
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