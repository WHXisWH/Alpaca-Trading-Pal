import { NextRequest, NextResponse } from 'next/server';
import { zgCompute } from '@/lib/0g/compute';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, alpacaId, alpacaContext } = body;

    // Initialize 0G Compute if needed
    if (!await zgCompute.initialize()) {
      console.warn("0G Compute initialization failed, using simulation mode");
    }

    switch (action) {
      case 'generateStrategy':
        const strategy = await zgCompute.generateTradingStrategy(prompt, alpacaContext);
        return NextResponse.json({
          success: true,
          strategy: strategy.result,
          verified: strategy.verified,
          cost: strategy.cost.toString(),
          provider: "0G Compute Network"
        });

      case 'analyzeMarket':
        const analysis = await zgCompute.analyzeMarketData(body.marketData, prompt);
        return NextResponse.json({
          success: true,
          analysis: analysis.result,
          verified: analysis.verified
        });

      case 'trainModel':
        const training = await zgCompute.trainAlpacaModel(body.knowledgeData, alpacaId);
        return NextResponse.json({
          success: true,
          insights: training.result,
          verified: training.verified
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Compute API error:", error);
    return NextResponse.json(
      { 
        error: "Compute operation failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "0G Compute Network API",
    endpoints: {
      POST: "Execute AI compute operations",
      actions: [
        "generateStrategy - Generate trading strategies",
        "analyzeMarket - Analyze market data", 
        "trainModel - Train Alpaca models"
      ]
    },
    status: "Ready"
  });
}