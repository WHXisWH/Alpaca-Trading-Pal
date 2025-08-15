// @ts-ignore
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import Web3 from "web3";
import { ComputeResponse } from "@/types/0g";
import { ZG_SERVICES } from "./chain";

export class ZGComputeClient {
  private broker: any = null;
  private web3: Web3 | null = null;
  private account: string | null = null;

  async initialize(web3Instance?: Web3, address?: string) {
    try {
      if (web3Instance && address) {
        this.web3 = web3Instance;
        this.account = address;
      } else if (typeof window === 'undefined') {
        // Server-side: use environment variable
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Private key required for compute operations");
        }
        
        const provider = new Web3.providers.HttpProvider("https://evmrpc-testnet.0g.ai");
        this.web3 = new Web3(provider);
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      }
      
      if (!this.web3) {
        throw new Error("Web3 instance required for compute operations");
      }
      
      // Initialize broker (with fallback for demo)
      try {
        this.broker = await createZGComputeNetworkBroker(this.web3, this.account);
        console.log("🧠 Connected to 0G Compute Network");
      } catch (error) {
        console.warn("0G Compute Network unavailable, using simulation mode:", error);
        this.broker = null;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to initialize 0G Compute:", error);
      return false;
    }
  }

  async generateTradingStrategy(prompt: string, alpacaContext?: {
    riskAppetite: number;
    learningSpeed: number;
    preferredMarket: number;
    experience: number;
  }): Promise<ComputeResponse> {
    try {
      // Enhanced prompt with Alpaca context
      const enhancedPrompt = this.buildStrategyPrompt(prompt, alpacaContext);
      
      if (this.broker) {
        // Real 0G Compute Network inference
        return await this.runRealInference(enhancedPrompt);
      } else {
        // Simulation mode for demo
        return await this.simulateInference(enhancedPrompt, alpacaContext);
      }
    } catch (error) {
      console.error("Strategy generation failed:", error);
      throw error;
    }
  }

  private buildStrategyPrompt(prompt: string, context?: any): string {
    const riskLevels = ["Conservative", "Moderate", "Aggressive"];
    const markets = ["Crypto", "Forex", "Stocks"];
    
    let enhancedPrompt = `You are an AI trading advisor for an Alpaca Trading Pal. Generate a trading strategy based on the following:

User Request: ${prompt}`;

    if (context) {
      enhancedPrompt += `

Alpaca Context:
- Risk Appetite: ${riskLevels[context.riskAppetite] || "Moderate"}
- Preferred Market: ${markets[context.preferredMarket] || "Crypto"}
- Experience Level: ${context.experience || 0} points
- Learning Speed: ${["Slow", "Normal", "Fast"][context.learningSpeed] || "Normal"}

Please provide a trading strategy that:
1. Matches the Alpaca's risk tolerance
2. Is appropriate for the preferred market
3. Considers the experience level
4. Includes specific entry/exit conditions
5. Provides risk management rules

Format your response as actionable trading rules.`;
    }

    return enhancedPrompt;
  }

  private async runRealInference(prompt: string, model: string = "llama-3.3-70b-instruct"): Promise<ComputeResponse> {
    const services = await this.broker.listService();
    const service = services.find((s: any) => s.model === model);
    
    if (!service) {
      throw new Error(`Model ${model} not found in 0G Compute Network`);
    }

    try {
      // Acknowledge provider
      await this.broker.inference.acknowledgeProviderSigner(service.provider);
      
      // Get service metadata
      const { endpoint, model: serviceModel } = await this.broker.inference.getServiceMetadata(service.provider);
      
      // Generate auth headers
      const headers = await this.broker.inference.getRequestHeaders(service.provider, prompt);
      
      // Send request
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: serviceModel,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data.choices[0].message.content;
      
      // Process response for verification
      const valid = await this.broker.inference.processResponse(
        service.provider,
        result
      );
      
      console.log(`🧠 Generated strategy via 0G Compute (${model})`);
      
      return {
        result,
        verified: valid,
        cost: BigInt(0), // TODO: Get actual cost from broker
      };
    } catch (error) {
      console.error("0G Inference error:", error);
      throw error;
    }
  }

  private async simulateInference(prompt: string, context?: any): Promise<ComputeResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate demo trading strategy based on context
    const strategies = this.generateDemoStrategy(context);
    
    console.log("🧠 Generated strategy via simulation mode");
    
    return {
      result: strategies,
      verified: true,
      cost: BigInt(0)
    };
  }

  private generateDemoStrategy(context?: any): string {
    const riskLevels = ["Conservative", "Moderate", "Aggressive"];
    const markets = ["Crypto", "Forex", "Stocks"];
    
    const risk = riskLevels[context?.riskAppetite || 1];
    const market = markets[context?.preferredMarket || 0];
    
    return `🎯 Generated Trading Strategy for ${market} Market (${risk} Risk)

📊 **Entry Conditions:**
${risk === "Conservative" ? 
  "- Only enter positions when RSI < 30 and price above 50-day MA\n- Maximum 2% of portfolio per trade" :
  risk === "Aggressive" ?
  "- Enter on momentum breaks above resistance\n- Maximum 10% of portfolio per trade" :
  "- Enter when RSI < 40 and MACD crosses above signal\n- Maximum 5% of portfolio per trade"
}

🛡️ **Risk Management:**
- Stop loss: ${risk === "Conservative" ? "3%" : risk === "Aggressive" ? "8%" : "5%"}
- Take profit: ${risk === "Conservative" ? "6%" : risk === "Aggressive" ? "15%" : "10%"}
- Maximum daily loss: ${risk === "Conservative" ? "1%" : risk === "Aggressive" ? "5%" : "3%"}

📈 **Position Sizing:**
- Use ${risk === "Conservative" ? "fixed" : risk === "Aggressive" ? "Kelly" : "percentage"} position sizing
- Adjust based on volatility and market conditions

🎛️ **Additional Rules:**
- Review positions every ${risk === "Conservative" ? "week" : risk === "Aggressive" ? "hour" : "day"}
- Adapt to ${market} market volatility patterns
- Experience Level: ${context?.experience || 0} points

⚡ Generated by 0G Compute Network (Simulation Mode)`;
  }

  async analyzeMarketData(marketData: any, question: string): Promise<ComputeResponse> {
    const prompt = `Analyze the following market data and answer: ${question}

Market Data:
${JSON.stringify(marketData, null, 2)}

Please provide insights and recommendations.`;

    return this.generateTradingStrategy(prompt);
  }

  async trainAlpacaModel(knowledgeData: string[], alpacaId: string): Promise<ComputeResponse> {
    const prompt = `Train and update the trading model for Alpaca ${alpacaId} based on this knowledge:

${knowledgeData.join('\n\n')}

Generate an improved trading strategy and provide learning insights.`;

    return this.generateTradingStrategy(prompt);
  }
}

// Export singleton instance
export const zgCompute = new ZGComputeClient();

// Legacy exports for compatibility
export async function initializeCompute(web3?: Web3, address?: string) {
  await zgCompute.initialize(web3, address);
  return zgCompute;
}

export async function runInference(
  broker: any,
  prompt: string,
  model: string = "llama-3.3-70b-instruct"
): Promise<ComputeResponse> {
  return zgCompute.generateTradingStrategy(prompt);
}