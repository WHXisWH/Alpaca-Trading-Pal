import Web3 from "web3";
import { ZG_CONTRACTS } from "./chain";

interface DASubmitResult {
  txHash: string;
  dataHash: string;
  gasUsed: string;
}

interface TradingDataPacket {
  alpacaId: string;
  timestamp: number;
  trades: any[];
  metrics: {
    totalPnL: number;
    winRate: number;
    sharpeRatio: number;
  };
}

export class ZGDataAvailability {
  private web3: Web3 | null = null;
  private contract: any = null;
  
  constructor(web3?: Web3) {
    if (web3) {
      this.web3 = web3;
      this.initializeContract();
    }
  }

  private initializeContract() {
    if (!this.web3) return;
    
    const abi = [
      {
        inputs: [{ name: "data", type: "bytes" }],
        name: "submitData",
        outputs: [{ name: "", type: "bytes32" }],
        stateMutability: "payable" as const,
        type: "function" as const
      },
      {
        inputs: [{ name: "dataHash", type: "bytes32" }],
        name: "retrieveData",
        outputs: [{ name: "", type: "bytes" }],
        stateMutability: "view" as const,
        type: "function" as const
      },
      {
        inputs: [],
        name: "getQuorumCount",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view" as const,
        type: "function" as const
      }
    ] as const;
    
    this.contract = new this.web3.eth.Contract(abi as any, ZG_CONTRACTS.DA_ENTRANCE);
  }

  async submitTradingData(packet: TradingDataPacket, account: string): Promise<DASubmitResult> {
    if (!this.contract) {
      throw new Error("DA contract not initialized");
    }
    
    try {
      const encodedData = this.web3!.eth.abi.encodeParameters(
        ["string", "uint256", "string"],
        [packet.alpacaId, packet.timestamp, JSON.stringify(packet)]
      );
      
      const gasEstimate = await this.contract.methods.submitData(encodedData).estimateGas({
        from: account,
        value: Web3.utils.toWei("0.001", "ether")
      });
      
      const result = await this.contract.methods.submitData(encodedData).send({
        from: account,
        value: Web3.utils.toWei("0.001", "ether"),
        gas: gasEstimate
      });
      
      console.log(`📡 Submitted to 0G DA: ${result.transactionHash}`);
      
      return {
        txHash: result.transactionHash,
        dataHash: result.events?.DataSubmitted?.returnValues?.dataHash || "0x0",
        gasUsed: result.gasUsed.toString()
      };
    } catch (error) {
      console.error("DA submission failed:", error);
      throw error;
    }
  }

  async retrieveTradingData(dataHash: string): Promise<TradingDataPacket | null> {
    if (!this.contract) {
      throw new Error("DA contract not initialized");
    }
    
    try {
      const rawData = await this.contract.methods.retrieveData(dataHash).call();
      
      const decoded = this.web3!.eth.abi.decodeParameters(
        ["string", "uint256", "string"],
        rawData
      );
      
      return JSON.parse(decoded[2]);
    } catch (error) {
      console.error("DA retrieval failed:", error);
      return null;
    }
  }

  async submitPerformanceSnapshot(
    alpacaId: string, 
    performance: any,
    account: string
  ): Promise<DASubmitResult> {
    const packet: TradingDataPacket = {
      alpacaId,
      timestamp: Date.now(),
      trades: performance.recentTrades || [],
      metrics: {
        totalPnL: performance.totalPnL || 0,
        winRate: performance.winRate || 0,
        sharpeRatio: performance.sharpeRatio || 0
      }
    };
    
    return this.submitTradingData(packet, account);
  }

  async getQuorumInfo(): Promise<number> {
    if (!this.contract) {
      throw new Error("DA contract not initialized");
    }
    
    try {
      const count = await this.contract.methods.getQuorumCount().call();
      return parseInt(count);
    } catch (error) {
      console.error("Failed to get quorum info:", error);
      return 0;
    }
  }
}

export const zgDA = new ZGDataAvailability();

export async function initializeDA(web3: Web3) {
  const daClient = new ZGDataAvailability(web3);
  return daClient;
}