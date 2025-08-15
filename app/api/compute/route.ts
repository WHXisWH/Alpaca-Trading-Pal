import { NextRequest, NextResponse } from 'next/server';
import { ZGComputeClient } from '@/lib/0g/compute';

const zgCompute = new ZGComputeClient();

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
        "generateStrategy - Generate trading strategies"
      ]
    },
    status: "Ready"
  });
}