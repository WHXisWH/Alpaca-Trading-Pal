import Web3 from "web3";
import { ComputeResponse } from "@/types/0g";
import { ZG_SERVICES } from "./chain";

export class ZGComputeClient {
  private broker: any = null;
  private web3: Web3 | null = null;
  private account: string | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000;

  async initialize(web3Instance?: Web3, address?: string) {
    try {
      if (web3Instance && address) {
        this.web3 = web3Instance;
        this.account = address;
      } else if (typeof window === 'undefined') {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Private key required for compute operations");
        }
        
        const provider = new Web3.providers.HttpProvider("https://evmrpc-testnet.0g.ai");
        this.web3 = new Web3(provider);
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      }
      
      if (!this.web3 || !this.account) {
        throw new Error("Web3 instance and account required for compute operations");
      }
      
      try {
        const { createZGComputeNetworkBroker } = await import("@0glabs/0g-serving-broker");
        this.broker = await createZGComputeNetworkBroker(this.web3, this.account);
        
        await this.broker.ledger.addLedger(Web3.utils.toWei("0.01", "ether"));
        
        console.log("🧠 Connected to 0G Compute Network");
        return true;
      } catch (error) {
        console.warn("0G Compute Network unavailable, using simulation mode:", error);
        this.broker = null;
        return false;
      }
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
    knowledgeBase?: string[];
  }): Promise<ComputeResponse> {
    const enhancedPrompt = this.buildStrategyPrompt(prompt, alpacaContext);
    
    if (!this.broker) {
      await this.initialize();
    }
    
    if (this.broker) {
      return await this.runRealInferenceWithRetry(enhancedPrompt);
    } else {
      return await this.simulateInference(enhancedPrompt, alpacaContext);
    }
  }

  private async runRealInferenceWithRetry(prompt: string, model: string = "llama-3.3-70b-instruct"): Promise<ComputeResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.runRealInference(prompt, model);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError || new Error("All inference attempts failed");
  }

  private async runRealInference(prompt: string, model: string = "llama-3.3-70b-instruct"): Promise<ComputeResponse> {
    const providerAddress = ZG_SERVICES.COMPUTE_PROVIDERS[model as keyof typeof ZG_SERVICES.COMPUTE_PROVIDERS];
    
    if (!providerAddress) {
      throw new Error(`Model ${model} not found in 0G Compute Network`);
    }

    await this.broker.inference.acknowledgeProviderSigner(providerAddress);
    
    const { endpoint, model: serviceModel } = await this.broker.inference.getServiceMetadata(providerAddress);
    const headers = await this.broker.inference.getRequestHeaders(providerAddress, prompt);
    
    const requestBody = {
      messages: [{ role: "user", content: prompt }],
      model: serviceModel,
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    };
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...headers 
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response format from compute provider");
    }
    
    const result = data.choices[0].message.content;
    const chatId = data.id;
    
    const valid = await this.broker.inference.processResponse(
      providerAddress,
      result,
      chatId
    );
    
    console.log(`🧠 Generated strategy via 0G Compute (${model})`);
    
    return {
      result,
      verified: valid,
      cost: BigInt(data.usage?.total_tokens || 0)
    };
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
- Learning Speed: ${["Slow", "Normal", "Fast"][context.learningSpeed] || "Normal"}`;

      // Add knowledge base if available
      if (context.knowledgeBase && context.knowledgeBase.length > 0) {
        enhancedPrompt += `

Previously Learned Knowledge:
${context.knowledgeBase.map((knowledge: string, index: number) => `${index + 1}. ${knowledge}`).join('\n')}

IMPORTANT: Please incorporate and build upon this existing knowledge when generating your strategy. Consider how these learned patterns and rules can be applied to the current market situation.`;
      } else {
        enhancedPrompt += `

Note: This Alpaca is new and has no previous trading knowledge to draw from.`;
      }

      enhancedPrompt += `

Please provide a trading strategy that:
1. Matches the Alpaca's risk tolerance
2. Is appropriate for the preferred market
3. Considers the experience level
4. Incorporates any previously learned knowledge
5. Includes specific entry/exit conditions
6. Provides risk management rules

Format your response as actionable trading rules with specific parameters.`;
    }

    return enhancedPrompt;
  }

  private async simulateInference(prompt: string, context?: any): Promise<ComputeResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
}