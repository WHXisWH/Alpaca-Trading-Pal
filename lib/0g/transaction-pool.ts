import { zgChainManager } from "./chain-manager";

interface PooledTransaction {
  id: string;
  alpacaId: string;
  operation: "mint" | "feedKnowledge" | "recordTrade" | "updateModel" | "transfer";
  data: any;
  priority: 1 | 2 | 3 | 4 | 5;
  gasLimit: number;
  maxRetries: number;
  currentRetries: number;
  createdAt: number;
  scheduledFor?: number;
  dependencies?: string[];
  status: "queued" | "processing" | "completed" | "failed" | "retrying";
}

interface ExecutionSlot {
  id: string;
  transactions: PooledTransaction[];
  estimatedGas: bigint;
  priority: number;
  startTime?: number;
  completionTime?: number;
}

interface PerformanceMetrics {
  totalProcessed: number;
  successRate: number;
  avgExecutionTime: number;
  avgGasCost: bigint;
  tpsAchieved: number;
  gasEfficiency: number;
}

export class TransactionPool {
  private pool: Map<string, PooledTransaction> = new Map();
  private executionQueue: ExecutionSlot[] = [];
  private processingSlots: Map<string, ExecutionSlot> = new Map();
  private completedTransactions: Map<string, PooledTransaction> = new Map();
  
  private readonly MAX_POOL_SIZE = 1000;
  private readonly MAX_CONCURRENT_SLOTS = 10;
  private readonly SLOT_SIZE = 20;
  private readonly TPS_TARGET = 2500;
  
  private metrics: PerformanceMetrics = {
    totalProcessed: 0,
    successRate: 0,
    avgExecutionTime: 0,
    avgGasCost: BigInt(0),
    tpsAchieved: 0,
    gasEfficiency: 0
  };

  private isProcessing = false;
  private lastProcessingTime = 0;

  constructor() {
    console.log("🏊 Initializing High-Performance Transaction Pool");
    this.startProcessingLoop();
    this.startMetricsCollection();
  }

  async submitTransaction(tx: Omit<PooledTransaction, 'id' | 'status' | 'createdAt' | 'currentRetries'>): Promise<string> {
    if (this.pool.size >= this.MAX_POOL_SIZE) {
      await this.evictLowPriorityTransactions();
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pooledTx: PooledTransaction = {
      ...tx,
      id: txId,
      status: "queued",
      createdAt: Date.now(),
      currentRetries: 0
    };

    this.pool.set(txId, pooledTx);
    
    console.log(`📥 Submitted transaction ${txId} for Alpaca ${tx.alpacaId} (${tx.operation})`);
    
    this.scheduleProcessing();
    return txId;
  }

  async submitBatchTransactions(
    alpacaId: string,
    operations: Array<{
      operation: PooledTransaction["operation"];
      data: any;
      priority?: number;
    }>
  ): Promise<string[]> {
    const txIds: string[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const txId = await this.submitTransaction({
        alpacaId,
        operation: op.operation,
        data: op.data,
        priority: (op.priority as any) || 3,
        gasLimit: this.estimateGasForOperation(op.operation),
        maxRetries: 3,
        scheduledFor: baseTime + (i * 100)
      });
      txIds.push(txId);
    }

    console.log(`📦 Submitted batch of ${operations.length} transactions for Alpaca ${alpacaId}`);
    return txIds;
  }

  private async scheduleProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    setTimeout(() => {
      this.processPool();
    }, 50);
  }

  private async processPool(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.createExecutionSlots();
      await this.executeSlots();
    } catch (error) {
      console.error("Pool processing error:", error);
    } finally {
      this.isProcessing = false;
      this.lastProcessingTime = Date.now();
    }
  }

  private async createExecutionSlots(): Promise<void> {
    const availableTransactions = Array.from(this.pool.values())
      .filter(tx => tx.status === "queued" && this.canExecuteNow(tx))
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.createdAt - b.createdAt;
      });

    const slots: ExecutionSlot[] = [];
    let currentSlot: ExecutionSlot | null = null;

    for (const tx of availableTransactions) {
      if (!currentSlot || currentSlot.transactions.length >= this.SLOT_SIZE) {
        if (currentSlot) slots.push(currentSlot);
        
        currentSlot = {
          id: `slot_${Date.now()}_${slots.length}`,
          transactions: [],
          estimatedGas: BigInt(0),
          priority: tx.priority
        };
      }

      if (this.canAddToSlot(currentSlot, tx)) {
        currentSlot.transactions.push(tx);
        currentSlot.estimatedGas += BigInt(tx.gasLimit);
        tx.status = "processing";
      }

      if (slots.length >= this.MAX_CONCURRENT_SLOTS) break;
    }

    if (currentSlot && currentSlot.transactions.length > 0) {
      slots.push(currentSlot);
    }

    this.executionQueue.push(...slots);
  }

  private async executeSlots(): Promise<void> {
    const slotsToProcess = this.executionQueue.splice(0, this.MAX_CONCURRENT_SLOTS);
    
    const promises = slotsToProcess.map(slot => this.executeSlot(slot));
    await Promise.allSettled(promises);
  }

  private async executeSlot(slot: ExecutionSlot): Promise<void> {
    slot.startTime = Date.now();
    this.processingSlots.set(slot.id, slot);
    
    try {
      const transactionRequests = slot.transactions.map(tx => ({
        to: this.getContractAddress(tx.operation),
        data: this.encodeTransactionData(tx),
        value: tx.operation === "mint" ? "10000000000000000" : "0"
      }));

      const result = await zgChainManager.executeBatchParallel(transactionRequests);
      
      slot.transactions.forEach((tx, index) => {
        const txResult = result.transactions[index];
        if (txResult && txResult.status === "success") {
          tx.status = "completed";
          this.completedTransactions.set(tx.id, tx);
          this.pool.delete(tx.id);
        } else {
          this.handleTransactionFailure(tx);
        }
      });

      slot.completionTime = Date.now();
      
      console.log(`🎯 Executed slot ${slot.id}: ${result.successful}/${slot.transactions.length} successful`);
      
    } catch (error) {
      console.error(`Slot ${slot.id} execution failed:`, error);
      slot.transactions.forEach(tx => this.handleTransactionFailure(tx));
    } finally {
      this.processingSlots.delete(slot.id);
    }
  }

  private handleTransactionFailure(tx: PooledTransaction): void {
    tx.currentRetries++;
    
    if (tx.currentRetries >= tx.maxRetries) {
      tx.status = "failed";
      this.completedTransactions.set(tx.id, tx);
      this.pool.delete(tx.id);
      console.error(`❌ Transaction ${tx.id} failed after ${tx.maxRetries} retries`);
    } else {
      tx.status = "retrying";
      tx.scheduledFor = Date.now() + (tx.currentRetries * 2000);
      console.warn(`🔄 Retrying transaction ${tx.id} (attempt ${tx.currentRetries})`);
    }
  }

  private canExecuteNow(tx: PooledTransaction): boolean {
    if (tx.scheduledFor && Date.now() < tx.scheduledFor) return false;
    
    if (tx.dependencies) {
      return tx.dependencies.every(depId => {
        const dep = this.completedTransactions.get(depId);
        return dep && dep.status === "completed";
      });
    }
    
    return true;
  }

  private canAddToSlot(slot: ExecutionSlot, tx: PooledTransaction): boolean {
    if (slot.transactions.length >= this.SLOT_SIZE) return false;
    if (slot.estimatedGas + BigInt(tx.gasLimit) > BigInt(10000000)) return false;
    
    const sameAlpacaCount = slot.transactions.filter(t => t.alpacaId === tx.alpacaId).length;
    if (sameAlpacaCount >= 5) return false;
    
    return true;
  }

  private estimateGasForOperation(operation: PooledTransaction["operation"]): number {
    const gasEstimates = {
      mint: 200000,
      feedKnowledge: 80000,
      recordTrade: 100000,
      updateModel: 120000,
      transfer: 150000
    };
    return gasEstimates[operation];
  }

  private getContractAddress(operation: PooledTransaction["operation"]): string {
    return process.env.NEXT_PUBLIC_ALPACA_NFT_ADDRESS || "0x2451c1c2D71eBec5f63e935670c4bb0Ce19381f5";
  }

  private encodeTransactionData(tx: PooledTransaction): string {
    switch (tx.operation) {
      case "mint":
        return `0x1234567890${tx.data.name}`;
      case "feedKnowledge":
        return `0xabcdef1234${tx.data.tokenId}${tx.data.knowledge}`;
      case "recordTrade":
        return `0x567890abcd${tx.data.tokenId}${tx.data.pnl}${tx.data.isWin}`;
      default:
        return "0x";
    }
  }

  private async evictLowPriorityTransactions(): Promise<void> {
    const lowPriorityTxs = Array.from(this.pool.values())
      .filter(tx => tx.priority <= 2 && tx.status === "queued")
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, 50);

    lowPriorityTxs.forEach(tx => {
      this.pool.delete(tx.id);
      console.log(`🗑️ Evicted low priority transaction ${tx.id}`);
    });
  }

  private startProcessingLoop(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.pool.size > 0) {
        await this.processPool();
      }
    }, 100);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }

  private updateMetrics(): void {
    const completedInLastSecond = Array.from(this.completedTransactions.values())
      .filter(tx => Date.now() - (tx as any).completionTime < 1000);

    const totalCompleted = this.completedTransactions.size;
    const successful = Array.from(this.completedTransactions.values())
      .filter(tx => tx.status === "completed").length;

    this.metrics = {
      totalProcessed: totalCompleted,
      successRate: totalCompleted > 0 ? successful / totalCompleted : 0,
      avgExecutionTime: this.calculateAverageExecutionTime(),
      avgGasCost: this.calculateAverageGasCost(),
      tpsAchieved: completedInLastSecond.length,
      gasEfficiency: this.calculateGasEfficiency()
    };
  }

  private calculateAverageExecutionTime(): number {
    const completed = Array.from(this.processingSlots.values())
      .filter(slot => slot.completionTime);
    
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((sum, slot) => 
      sum + (slot.completionTime! - slot.startTime!), 0
    );
    
    return totalTime / completed.length;
  }

  private calculateAverageGasCost(): bigint {
    const completed = Array.from(this.completedTransactions.values());
    if (completed.length === 0) return BigInt(0);

    const totalGas = completed.reduce((sum, tx) => 
      sum + BigInt(tx.gasLimit), BigInt(0)
    );
    
    return totalGas / BigInt(completed.length);
  }

  private calculateGasEfficiency(): number {
    return Math.min(this.metrics.tpsAchieved / this.TPS_TARGET, 1.0) * 100;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getPoolStatus(): {
    queuedTransactions: number;
    processingTransactions: number;
    completedTransactions: number;
    failedTransactions: number;
    activeSlots: number;
  } {
    const queued = Array.from(this.pool.values()).filter(tx => tx.status === "queued").length;
    const processing = Array.from(this.pool.values()).filter(tx => tx.status === "processing").length;
    const completed = Array.from(this.completedTransactions.values()).filter(tx => tx.status === "completed").length;
    const failed = Array.from(this.completedTransactions.values()).filter(tx => tx.status === "failed").length;

    return {
      queuedTransactions: queued,
      processingTransactions: processing,
      completedTransactions: completed,
      failedTransactions: failed,
      activeSlots: this.processingSlots.size
    };
  }

  public async getTransactionStatus(txId: string): Promise<PooledTransaction | null> {
    return this.pool.get(txId) || this.completedTransactions.get(txId) || null;
  }

  public async clearOldTransactions(): Promise<number> {
    const oldThreshold = Date.now() - (24 * 60 * 60 * 1000);
    let cleared = 0;

    for (const [id, tx] of this.completedTransactions.entries()) {
      if (tx.createdAt < oldThreshold) {
        this.completedTransactions.delete(id);
        cleared++;
      }
    }

    console.log(`🧹 Cleared ${cleared} old completed transactions`);
    return cleared;
  }
}

export const transactionPool = new TransactionPool();