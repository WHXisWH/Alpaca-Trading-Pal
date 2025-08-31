import { NextRequest, NextResponse } from 'next/server';
import { ZGComputeClient } from '@/lib/0g/compute';

const zgCompute = new ZGComputeClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, alpacaId, alpacaContext, trainingData, analysisRequest, batchRequests } = body;

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

      case 'trainCustomModel':
        const training = await zgCompute.trainCustomModel(trainingData);
        return NextResponse.json({
          success: training.success,
          modelId: training.modelId,
          metrics: training.trainingMetrics,
          cost: training.estimatedCost.toString(),
          message: "Custom AI model training completed"
        });

      case 'advancedAnalysis':
        const analysis = await zgCompute.performAdvancedAnalysis(analysisRequest);
        return NextResponse.json({
          success: true,
          analysisType: analysisRequest.type,
          result: analysis.result,
          verified: analysis.verified,
          cost: analysis.cost.toString(),
          provider: "0G Compute Network"
        });

      case 'batchInference':
        const batchResults = await zgCompute.batchInferenceRequest(batchRequests);
        return NextResponse.json({
          success: true,
          results: batchResults.map(r => ({
            result: r.result,
            verified: r.verified,
            cost: r.cost.toString()
          })),
          totalCost: batchResults.reduce((sum, r) => sum + r.cost, BigInt(0)).toString(),
          message: `Processed ${batchResults.length} requests`
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
    message: "Enhanced 0G Compute Network API",
    endpoints: {
      POST: "Execute AI compute operations",
      actions: [
        "generateStrategy - Generate trading strategies",
        "trainCustomModel - Train personalized AI models", 
        "advancedAnalysis - Perform advanced market analysis",
        "batchInference - Process multiple inference requests"
      ]
    },
    models: [
      "llama-3.3-70b-instruct - General purpose reasoning",
      "deepseek-r1-70b - Advanced reasoning and analysis"
    ],
    features: [
      "TEE verification for trusted execution",
      "Personalized model training",
      "Batch processing optimization",
      "Advanced market analysis",
      "Risk assessment capabilities"
    ],
    status: "Enhanced & Ready"
  });
}