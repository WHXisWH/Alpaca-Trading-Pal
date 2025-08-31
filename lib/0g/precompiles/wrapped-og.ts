import Web3 from "web3";
import { AbiItem } from "web3-utils";

const WRAPPED_OG_ADDRESS = "0x0000000000000000000000000000000000001002";

interface MinterSupply {
  cap: bigint;
  initialSupply: bigint;
  supply: bigint;
}

interface WrappingTransaction {
  id: string;
  minter: string;
  amount: bigint;
  type: "mint" | "burn";
  timestamp: number;
  txHash?: string;
  status: "pending" | "completed" | "failed";
}

interface LiquidityMetrics {
  totalWrapped: bigint;
  totalBurned: bigint;
  netSupply: bigint;
  utilizationRate: number;
  minterStats: {
    totalMinters: number;
    activeMinters: number;
    avgSupplyUsage: number;
  };
}

const WRAPPED_OG_ABI: AbiItem[] = [
  {
    name: "getWA0GI",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "minterSupply",
    type: "function",
    inputs: [{ name: "minter", type: "address" }],
    outputs: [
      { name: "cap", type: "uint256" },
      { name: "initialSupply", type: "uint256" },
      { name: "supply", type: "uint256" }
    ]
  },
  {
    name: "mint",
    type: "function",
    inputs: [
      { name: "minter", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "burn",
    type: "function",
    inputs: [
      { name: "minter", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
];

export class WrappedOGClient {
  private web3: Web3 | null = null;
  private contract: any = null;
  private account: string | null = null;
  private wrappedOGContract: string | null = null;
  private transactionHistory: Map<string, WrappingTransaction> = new Map();

  constructor() {
    console.log("🪙 Initializing WrappedOG Precompiled Contract Client");
  }

  async initialize(web3Instance?: Web3, address?: string): Promise<boolean> {
    try {
      if (web3Instance && address) {
        this.web3 = web3Instance;
        this.account = address;
      } else if (typeof window === 'undefined') {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Private key required for WrappedOG operations");
        }
        
        const provider = new Web3.providers.HttpProvider("https://evmrpc-testnet.0g.ai");
        this.web3 = new Web3(provider);
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.account = account.address;
        this.web3.eth.accounts.wallet.add(account);
      }

      if (!this.web3) {
        throw new Error("Web3 instance required for WrappedOG operations");
      }

      this.contract = new this.web3.eth.Contract(WRAPPED_OG_ABI, WRAPPED_OG_ADDRESS);
      
      await this.loadWrappedOGContract();
      
      console.log(`🪙 Connected to WrappedOG precompile: ${WRAPPED_OG_ADDRESS}`);
      return true;
    } catch (error) {
      console.error("Failed to initialize WrappedOG client:", error);
      return false;
    }
  }

  private async loadWrappedOGContract(): Promise<void> {
    try {
      this.wrappedOGContract = await this.contract.methods.getWA0GI().call();
      console.log(`🪙 Wrapped OG contract: ${this.wrappedOGContract}`);
    } catch (error) {
      console.warn("Failed to load WA0GI contract address:", error);
      this.wrappedOGContract = null;
    }
  }

  async getMinterSupply(minterAddress: string): Promise<MinterSupply> {
    if (!this.contract) {
      throw new Error("WrappedOG contract not initialized");
    }

    try {
      const supply = await this.contract.methods.minterSupply(minterAddress).call();
      
      return {
        cap: BigInt(supply.cap),
        initialSupply: BigInt(supply.initialSupply),
        supply: BigInt(supply.supply)
      };
    } catch (error) {
      console.error(`Failed to get minter supply for ${minterAddress}:`, error);
      throw error;
    }
  }

  async wrapOGTokens(amount: bigint, minter?: string): Promise<string> {
    if (!this.contract || !this.account) {
      throw new Error("WrappedOG contract not initialized");
    }

    const minterAddress = minter || this.account;
    const txId = `wrap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const minterSupply = await this.getMinterSupply(minterAddress);
      
      if (minterSupply.supply + amount > minterSupply.cap) {
        throw new Error(`Minting would exceed cap: ${minterSupply.supply + amount} > ${minterSupply.cap}`);
      }

      const transaction: WrappingTransaction = {
        id: txId,
        minter: minterAddress,
        amount,
        type: "mint",
        timestamp: Date.now(),
        status: "pending"
      };

      this.transactionHistory.set(txId, transaction);

      const gasEstimate = await this.contract.methods.mint(minterAddress, amount.toString()).estimateGas({
        from: this.account
      });

      const receipt = await this.contract.methods.mint(minterAddress, amount.toString()).send({
        from: this.account,
        gas: gasEstimate
      });

      transaction.txHash = receipt.transactionHash;
      transaction.status = "completed";

      console.log(`🪙 Wrapped ${this.formatOG(amount)} OG tokens (tx: ${receipt.transactionHash})`);
      
      return txId;
    } catch (error) {
      const transaction = this.transactionHistory.get(txId);
      if (transaction) {
        transaction.status = "failed";
      }
      
      console.error(`Failed to wrap OG tokens:`, error);
      throw error;
    }
  }

  async unwrapOGTokens(amount: bigint, minter?: string): Promise<string> {
    if (!this.contract || !this.account) {
      throw new Error("WrappedOG contract not initialized");
    }

    const minterAddress = minter || this.account;
    const txId = `unwrap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const minterSupply = await this.getMinterSupply(minterAddress);
      
      if (amount > minterSupply.supply) {
        throw new Error(`Insufficient minted supply to burn: ${amount} > ${minterSupply.supply}`);
      }

      const transaction: WrappingTransaction = {
        id: txId,
        minter: minterAddress,
        amount,
        type: "burn",
        timestamp: Date.now(),
        status: "pending"
      };

      this.transactionHistory.set(txId, transaction);

      const gasEstimate = await this.contract.methods.burn(minterAddress, amount.toString()).estimateGas({
        from: this.account
      });

      const receipt = await this.contract.methods.burn(minterAddress, amount.toString()).send({
        from: this.account,
        gas: gasEstimate
      });

      transaction.txHash = receipt.transactionHash;
      transaction.status = "completed";

      console.log(`🪙 Unwrapped ${this.formatOG(amount)} OG tokens (tx: ${receipt.transactionHash})`);
      
      return txId;
    } catch (error) {
      const transaction = this.transactionHistory.get(txId);
      if (transaction) {
        transaction.status = "failed";
      }
      
      console.error(`Failed to unwrap OG tokens:`, error);
      throw error;
    }
  }

  async calculateOptimalWrapping(
    targetLiquidity: bigint,
    currentMinterSupplies: { [address: string]: MinterSupply }
  ): Promise<{
    recommendations: Array<{
      minter: string;
      suggestedAmount: bigint;
      reason: string;
      utilizationAfter: number;
    }>;
    totalRecommended: bigint;
    feasible: boolean;
  }> {
    const recommendations: Array<{
      minter: string;
      suggestedAmount: bigint;
      reason: string;
      utilizationAfter: number;
    }> = [];

    let totalRecommended = BigInt(0);
    let remainingTarget = targetLiquidity;

    for (const [minter, supply] of Object.entries(currentMinterSupplies)) {
      const availableCapacity = supply.cap - supply.supply;
      
      if (availableCapacity > BigInt(0) && remainingTarget > BigInt(0)) {
        const suggestedAmount = availableCapacity < remainingTarget ? availableCapacity : remainingTarget;
        const utilizationAfter = Number((supply.supply + suggestedAmount) * BigInt(100) / supply.cap);
        
        let reason = "Optimal capacity utilization";
        if (utilizationAfter > 90) {
          reason = "Near capacity limit - high efficiency";
        } else if (utilizationAfter < 50) {
          reason = "Low utilization - room for growth";
        }

        recommendations.push({
          minter,
          suggestedAmount,
          reason,
          utilizationAfter
        });

        totalRecommended += suggestedAmount;
        remainingTarget -= suggestedAmount;
      }
    }

    const feasible = remainingTarget === BigInt(0);

    console.log(`💡 Wrapping recommendations: ${this.formatOG(totalRecommended)} total (feasible: ${feasible})`);

    return {
      recommendations,
      totalRecommended,
      feasible
    };
  }

  async getLiquidityMetrics(): Promise<LiquidityMetrics> {
    try {
      const mockMinters = [this.account!, "0x1234567890123456789012345678901234567890"];
      let totalWrapped = BigInt(0);
      let totalBurned = BigInt(0);
      let activeMinters = 0;
      let totalUtilization = 0;

      for (const minter of mockMinters) {
        try {
          const supply = await this.getMinterSupply(minter);
          totalWrapped += supply.supply;
          totalBurned += supply.initialSupply - supply.supply;
          
          if (supply.supply > BigInt(0)) {
            activeMinters++;
            totalUtilization += Number(supply.supply * BigInt(100) / supply.cap);
          }
        } catch (error) {
        }
      }

      const netSupply = totalWrapped - totalBurned;
      const utilizationRate = totalWrapped > BigInt(0) ? Number(netSupply * BigInt(100) / totalWrapped) : 0;
      const avgSupplyUsage = activeMinters > 0 ? totalUtilization / activeMinters : 0;

      return {
        totalWrapped,
        totalBurned,
        netSupply,
        utilizationRate,
        minterStats: {
          totalMinters: mockMinters.length,
          activeMinters,
          avgSupplyUsage
        }
      };
    } catch (error) {
      console.error("Failed to get liquidity metrics:", error);
      return {
        totalWrapped: BigInt(0),
        totalBurned: BigInt(0),
        netSupply: BigInt(0),
        utilizationRate: 0,
        minterStats: {
          totalMinters: 0,
          activeMinters: 0,
          avgSupplyUsage: 0
        }
      };
    }
  }

  async enhanceAlpacaLiquidity(
    alpacaId: string,
    requiredLiquidity: bigint,
    maxSlippage: number = 5
  ): Promise<{
    success: boolean;
    wrappedAmount: bigint;
    transactionIds: string[];
    liquidityImpact: {
      before: bigint;
      after: bigint;
      improvement: number;
    };
  }> {
    try {
      const beforeMetrics = await this.getLiquidityMetrics();
      const currentSupply = await this.getMinterSupply(this.account!);
      
      let wrappedAmount = BigInt(0);
      const transactionIds: string[] = [];

      if (currentSupply.cap - currentSupply.supply >= requiredLiquidity) {
        const txId = await this.wrapOGTokens(requiredLiquidity);
        transactionIds.push(txId);
        wrappedAmount = requiredLiquidity;
      } else {
        const availableAmount = currentSupply.cap - currentSupply.supply;
        if (availableAmount > BigInt(0)) {
          const txId = await this.wrapOGTokens(availableAmount);
          transactionIds.push(txId);
          wrappedAmount = availableAmount;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const afterMetrics = await this.getLiquidityMetrics();
      const improvement = Number((afterMetrics.netSupply - beforeMetrics.netSupply) * BigInt(100) / requiredLiquidity);

      const success = improvement >= (100 - maxSlippage);

      console.log(`💰 Enhanced Alpaca ${alpacaId} liquidity: ${this.formatOG(wrappedAmount)} wrapped (${improvement.toFixed(1)}% of target)`);

      return {
        success,
        wrappedAmount,
        transactionIds,
        liquidityImpact: {
          before: beforeMetrics.netSupply,
          after: afterMetrics.netSupply,
          improvement
        }
      };
    } catch (error) {
      console.error(`Failed to enhance liquidity for Alpaca ${alpacaId}:`, error);
      return {
        success: false,
        wrappedAmount: BigInt(0),
        transactionIds: [],
        liquidityImpact: {
          before: BigInt(0),
          after: BigInt(0),
          improvement: 0
        }
      };
    }
  }

  async getTransactionHistory(limit: number = 50): Promise<WrappingTransaction[]> {
    return Array.from(this.transactionHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getTransactionStatus(txId: string): Promise<WrappingTransaction | null> {
    return this.transactionHistory.get(txId) || null;
  }

  private formatOG(amount: bigint): string {
    const og = Number(amount) / 1e18;
    if (og >= 1000000) {
      return `${(og / 1000000).toFixed(2)}M OG`;
    } else if (og >= 1000) {
      return `${(og / 1000).toFixed(2)}K OG`;
    } else {
      return `${og.toFixed(4)} OG`;
    }
  }

  async simulateDeFiIntegration(
    protocol: "uniswap" | "compound" | "aave",
    amount: bigint
  ): Promise<{
    estimatedReturns: bigint;
    liquidityProvided: bigint;
    fees: bigint;
    duration: number;
    recommendation: string;
  }> {
    const baseYield = {
      uniswap: 0.08,
      compound: 0.05,
      aave: 0.06
    }[protocol];

    const duration = 30;
    const estimatedReturns = amount * BigInt(Math.floor(baseYield * duration / 365 * 10000)) / BigInt(10000);
    const fees = amount * BigInt(30) / BigInt(10000);
    const liquidityProvided = amount - fees;

    const recommendation = `${protocol} integration: ${(baseYield * 100).toFixed(1)}% APY, ${duration}d duration`;

    console.log(`🏦 DeFi Integration Simulation (${protocol}): ${this.formatOG(estimatedReturns)} estimated returns`);

    return {
      estimatedReturns,
      liquidityProvided,
      fees,
      duration,
      recommendation
    };
  }

  async clearOldTransactions(): Promise<number> {
    const oldThreshold = Date.now() - (24 * 60 * 60 * 1000);
    let cleared = 0;

    for (const [txId, tx] of this.transactionHistory.entries()) {
      if (tx.timestamp < oldThreshold && tx.status === "completed") {
        this.transactionHistory.delete(txId);
        cleared++;
      }
    }

    console.log(`🧹 Cleared ${cleared} old wrapping transactions`);
    return cleared;
  }
}

export const wrappedOGClient = new WrappedOGClient();