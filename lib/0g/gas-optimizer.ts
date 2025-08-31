interface GasPrice {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
  timestamp: number;
}

interface GasPrediction {
  nextBlock: bigint;
  next5Blocks: bigint;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
}

interface OptimizedGasStrategy {
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  strategy: "economy" | "standard" | "fast" | "instant" | "dynamic";
  expectedConfirmationTime: number;
  estimatedCost: bigint;
}

interface NetworkConditions {
  congestionLevel: "low" | "medium" | "high" | "critical";
  memPoolSize: number;
  averageBlockTime: number;
  pendingTransactions: number;
  gasUtilization: number;
}

export class GasOptimizer {
  private gasHistory: GasPrice[] = [];
  private networkHistory: NetworkConditions[] = [];
  private predictionModel: Map<string, number> = new Map();
  private optimizationStrategies: Map<string, (conditions: NetworkConditions) => OptimizedGasStrategy> = new Map();
  
  private readonly HISTORY_LIMIT = 100;
  private readonly UPDATE_INTERVAL = 15000;
  private readonly PREDICTION_WINDOW = 5;

  constructor() {
    console.log("⛽ Initializing Dynamic Gas Optimizer");
    this.initializeOptimizationStrategies();
    this.startGasMonitoring();
    this.startPredictionModel();
  }

  private initializeOptimizationStrategies(): void {
    this.optimizationStrategies.set("economy", (conditions: NetworkConditions) => ({
      gasPrice: this.getCurrentGasPrice().slow,
      strategy: "economy",
      expectedConfirmationTime: this.estimateConfirmationTime(conditions, "slow"),
      estimatedCost: this.getCurrentGasPrice().slow * BigInt(21000)
    }));

    this.optimizationStrategies.set("standard", (conditions: NetworkConditions) => ({
      gasPrice: this.getCurrentGasPrice().standard,
      strategy: "standard", 
      expectedConfirmationTime: this.estimateConfirmationTime(conditions, "standard"),
      estimatedCost: this.getCurrentGasPrice().standard * BigInt(21000)
    }));

    this.optimizationStrategies.set("fast", (conditions: NetworkConditions) => ({
      gasPrice: this.getCurrentGasPrice().fast,
      strategy: "fast",
      expectedConfirmationTime: this.estimateConfirmationTime(conditions, "fast"),
      estimatedCost: this.getCurrentGasPrice().fast * BigInt(21000)
    }));

    this.optimizationStrategies.set("dynamic", (conditions: NetworkConditions) => {
      const prediction = this.predictGasPrice();
      const basePrice = prediction.nextBlock;
      
      let adjustedPrice = basePrice;
      if (conditions.congestionLevel === "high") {
        adjustedPrice = basePrice * BigInt(130) / BigInt(100);
      } else if (conditions.congestionLevel === "low") {
        adjustedPrice = basePrice * BigInt(95) / BigInt(100);
      }

      return {
        gasPrice: adjustedPrice,
        maxFeePerGas: adjustedPrice * BigInt(150) / BigInt(100),
        maxPriorityFeePerGas: adjustedPrice * BigInt(10) / BigInt(100),
        strategy: "dynamic",
        expectedConfirmationTime: this.estimateConfirmationTime(conditions, "dynamic"),
        estimatedCost: adjustedPrice * BigInt(21000)
      };
    });
  }

  async getOptimizedGasStrategy(
    priority: "low" | "normal" | "high" | "urgent",
    gasLimit: number = 21000
  ): Promise<OptimizedGasStrategy> {
    const conditions = await this.analyzeNetworkConditions();
    const strategyName = this.selectStrategyForPriority(priority, conditions);
    const strategy = this.optimizationStrategies.get(strategyName)!(conditions);
    
    strategy.estimatedCost = strategy.gasPrice * BigInt(gasLimit);
    
    console.log(`⛽ Optimized gas strategy: ${strategy.strategy}, price: ${this.formatGwei(strategy.gasPrice)} gwei`);
    
    return strategy;
  }

  async getBatchOptimizedStrategy(
    transactionCount: number,
    averageGasLimit: number,
    maxWaitTime: number
  ): Promise<OptimizedGasStrategy> {
    const conditions = await this.analyzeNetworkConditions();
    const prediction = this.predictGasPrice();
    
    let strategy: OptimizedGasStrategy;
    
    if (maxWaitTime > 300) {
      strategy = this.optimizationStrategies.get("economy")!(conditions);
    } else if (maxWaitTime > 60) {
      strategy = this.optimizationStrategies.get("standard")!(conditions);
    } else {
      strategy = this.optimizationStrategies.get("fast")!(conditions);
    }
    
    const batchDiscount = Math.min(transactionCount * 2, 15);
    strategy.gasPrice = strategy.gasPrice * BigInt(100 - batchDiscount) / BigInt(100);
    strategy.estimatedCost = strategy.gasPrice * BigInt(averageGasLimit) * BigInt(transactionCount);
    
    console.log(`📦 Batch gas optimization: ${batchDiscount}% discount for ${transactionCount} transactions`);
    
    return strategy;
  }

  async analyzeNetworkConditions(): Promise<NetworkConditions> {
    try {
      const currentGas = this.getCurrentGasPrice();
      const recentHistory = this.gasHistory.slice(-10);
      
      let congestionLevel: NetworkConditions["congestionLevel"] = "low";
      let gasUtilization = 50;
      
      if (recentHistory.length > 5) {
        const avgRecentGas = recentHistory.reduce((sum, gas) => sum + gas.standard, BigInt(0)) / BigInt(recentHistory.length);
        const currentVsAvg = Number(currentGas.standard * BigInt(100) / avgRecentGas);
        
        if (currentVsAvg > 150) {
          congestionLevel = "critical";
          gasUtilization = 90;
        } else if (currentVsAvg > 130) {
          congestionLevel = "high";
          gasUtilization = 75;
        } else if (currentVsAvg > 110) {
          congestionLevel = "medium";
          gasUtilization = 60;
        }
      }
      
      const conditions: NetworkConditions = {
        congestionLevel,
        memPoolSize: Math.floor(Math.random() * 50000) + 10000,
        averageBlockTime: 2.1 + (Math.random() - 0.5),
        pendingTransactions: Math.floor(Math.random() * 10000) + 1000,
        gasUtilization
      };
      
      this.networkHistory.push(conditions);
      if (this.networkHistory.length > this.HISTORY_LIMIT) {
        this.networkHistory = this.networkHistory.slice(-this.HISTORY_LIMIT);
      }
      
      return conditions;
    } catch (error) {
      console.error("Network analysis failed:", error);
      return {
        congestionLevel: "medium",
        memPoolSize: 25000,
        averageBlockTime: 2.5,
        pendingTransactions: 5000,
        gasUtilization: 50
      };
    }
  }

  predictGasPrice(): GasPrediction {
    if (this.gasHistory.length < 10) {
      const current = this.getCurrentGasPrice();
      return {
        nextBlock: current.standard,
        next5Blocks: current.standard,
        trend: "stable",
        confidence: 0.5
      };
    }

    const recent = this.gasHistory.slice(-10);
    const trend = this.calculateTrend(recent.map(g => g.standard));
    const nextBlock = this.extrapolatePrice(recent, 1);
    const next5Blocks = this.extrapolatePrice(recent, 5);
    
    const confidence = this.calculatePredictionConfidence(recent);
    
    return {
      nextBlock,
      next5Blocks,
      trend,
      confidence
    };
  }

  private calculateTrend(prices: bigint[]): "increasing" | "decreasing" | "stable" {
    if (prices.length < 3) return "stable";
    
    const recentAvg = prices.slice(-3).reduce((sum, p) => sum + p, BigInt(0)) / BigInt(3);
    const olderAvg = prices.slice(-6, -3).reduce((sum, p) => sum + p, BigInt(0)) / BigInt(3);
    
    const changePercent = Number((recentAvg - olderAvg) * BigInt(100) / olderAvg);
    
    if (changePercent > 10) return "increasing";
    if (changePercent < -10) return "decreasing";
    return "stable";
  }

  private extrapolatePrice(history: GasPrice[], blocksAhead: number): bigint {
    if (history.length < 5) return history[history.length - 1]?.standard || BigInt(20000000000);
    
    const prices = history.map(h => Number(h.standard));
    const n = prices.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const predicted = intercept + slope * (n + blocksAhead - 1);
    
    return BigInt(Math.max(Math.floor(predicted), 1000000000));
  }

  private calculatePredictionConfidence(history: GasPrice[]): number {
    if (history.length < 5) return 0.5;
    
    const variance = this.calculateVariance(history.map(h => Number(h.standard)));
    const coefficient = Math.sqrt(variance) / this.calculateMean(history.map(h => Number(h.standard)));
    
    return Math.max(0.1, Math.min(0.95, 1 - coefficient));
  }

  private calculateVariance(numbers: number[]): number {
    const mean = this.calculateMean(numbers);
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return this.calculateMean(squaredDiffs);
  }

  private calculateMean(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private selectStrategyForPriority(
    priority: "low" | "normal" | "high" | "urgent",
    conditions: NetworkConditions
  ): string {
    if (priority === "urgent") return "fast";
    if (priority === "high") return "dynamic";
    if (priority === "low") return "economy";
    
    if (conditions.congestionLevel === "low") return "economy";
    if (conditions.congestionLevel === "high") return "fast";
    
    return "standard";
  }

  private estimateConfirmationTime(
    conditions: NetworkConditions,
    strategy: "slow" | "standard" | "fast" | "dynamic"
  ): number {
    const baseTime = conditions.averageBlockTime;
    const congestionMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2.5,
      critical: 4
    }[conditions.congestionLevel];
    
    const strategyMultiplier = {
      slow: 3,
      standard: 1.5,
      fast: 0.8,
      dynamic: 1
    }[strategy];
    
    return Math.ceil(baseTime * congestionMultiplier * strategyMultiplier);
  }

  private getCurrentGasPrice(): GasPrice {
    if (this.gasHistory.length === 0) {
      return {
        slow: BigInt(15000000000),
        standard: BigInt(20000000000), 
        fast: BigInt(30000000000),
        instant: BigInt(50000000000),
        timestamp: Date.now()
      };
    }
    
    return this.gasHistory[this.gasHistory.length - 1];
  }

  private startGasMonitoring(): void {
    const updateGasPrices = async () => {
      try {
        const basePrice = BigInt(Math.floor(Math.random() * 20000000000) + 10000000000);
        const volatility = (Math.random() - 0.5) * 0.2;
        
        const gasPrice: GasPrice = {
          slow: basePrice * BigInt(80) / BigInt(100),
          standard: basePrice,
          fast: basePrice * BigInt(130) / BigInt(100),
          instant: basePrice * BigInt(200) / BigInt(100),
          timestamp: Date.now()
        };
        
        this.gasHistory.push(gasPrice);
        if (this.gasHistory.length > this.HISTORY_LIMIT) {
          this.gasHistory = this.gasHistory.slice(-this.HISTORY_LIMIT);
        }
        
      } catch (error) {
        console.error("Gas price update failed:", error);
      }
    };
    
    updateGasPrices();
    setInterval(updateGasPrices, this.UPDATE_INTERVAL);
  }

  private startPredictionModel(): void {
    setInterval(() => {
      this.updatePredictionModel();
    }, 60000);
  }

  private updatePredictionModel(): void {
    if (this.gasHistory.length < 20) return;
    
    const features = this.extractFeatures(this.gasHistory.slice(-20));
    const accuracy = this.validatePredictions();
    
    this.predictionModel.set("accuracy", accuracy);
    this.predictionModel.set("lastUpdate", Date.now());
    
    console.log(`🔮 Updated prediction model: ${(accuracy * 100).toFixed(1)}% accuracy`);
  }

  private extractFeatures(history: GasPrice[]): number[] {
    const prices = history.map(h => Number(h.standard));
    const timestamps = history.map(h => h.timestamp);
    
    return [
      this.calculateMean(prices),
      this.calculateVariance(prices),
      prices[prices.length - 1] - prices[prices.length - 2],
      (timestamps[timestamps.length - 1] - timestamps[0]) / timestamps.length
    ];
  }

  private validatePredictions(): number {
    if (this.gasHistory.length < 30) return 0.5;
    
    let correct = 0;
    let total = 0;
    
    for (let i = 20; i < this.gasHistory.length - 5; i++) {
      const historical = this.gasHistory.slice(i - 10, i);
      const predicted = this.extrapolatePrice(historical, 5);
      const actual = this.gasHistory[i + 5].standard;
      
      const error = Math.abs(Number(predicted - actual)) / Number(actual);
      if (error < 0.15) correct++;
      total++;
    }
    
    return total > 0 ? correct / total : 0.5;
  }

  private formatGwei(wei: bigint): string {
    return (Number(wei) / 1000000000).toFixed(2);
  }

  public getGasMetrics(): {
    currentPrices: GasPrice;
    prediction: GasPrediction;
    networkConditions: NetworkConditions;
    modelAccuracy: number;
  } {
    return {
      currentPrices: this.getCurrentGasPrice(),
      prediction: this.predictGasPrice(),
      networkConditions: this.networkHistory[this.networkHistory.length - 1] || {
        congestionLevel: "medium",
        memPoolSize: 25000,
        averageBlockTime: 2.5,
        pendingTransactions: 5000,
        gasUtilization: 50
      },
      modelAccuracy: this.predictionModel.get("accuracy") || 0.5
    };
  }

  public async optimizeForBudget(
    maxBudget: bigint,
    gasLimit: number,
    maxWaitTime: number
  ): Promise<OptimizedGasStrategy | null> {
    const maxGasPrice = maxBudget / BigInt(gasLimit);
    const strategies = ["economy", "standard", "fast"];
    
    for (const strategyName of strategies) {
      const conditions = await this.analyzeNetworkConditions();
      const strategy = this.optimizationStrategies.get(strategyName)!(conditions);
      
      if (strategy.gasPrice <= maxGasPrice && 
          strategy.expectedConfirmationTime <= maxWaitTime) {
        strategy.estimatedCost = strategy.gasPrice * BigInt(gasLimit);
        return strategy;
      }
    }
    
    return null;
  }
}

export const gasOptimizer = new GasOptimizer();