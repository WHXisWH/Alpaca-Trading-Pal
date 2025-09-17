import { NextRequest, NextResponse } from 'next/server';
import { zgStorageServer } from '@/lib/0g/storage-server';

// Basic rate limit to harden the endpoint (best-effort)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateMap: Map<string, { count: number; windowStart: number }> = new Map();

function clientIP(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for');
  return (xfwd?.split(',')[0] || 'unknown').trim();
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec || now - rec.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now });
    return true;
    }
  if (rec.count >= RATE_LIMIT_MAX) return false;
  rec.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIP(request);
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const body = await request.json();
    const { action, data, tokenId, storageUrl, trainingDatasets, modelWeights, modelConfig } = body;

    switch (action) {
      case 'uploadKnowledge': {
        if (!data?.content || !data?.type || !data?.tokenId) {
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        const uploadResult = await zgStorageServer.uploadKnowledge({
          type: data.type || "knowledge",
          content: data.content,
          tokenId: data.tokenId,
          metadata: data.metadata
        });
        
        return NextResponse.json(uploadResult);
      }

      case 'downloadFromStorage': {
        if (!storageUrl || typeof storageUrl !== 'string') {
          return NextResponse.json({ error: 'storageUrl required' }, { status: 400 });
        }
        const downloadResult = await zgStorageServer.downloadFromStorage(storageUrl);
        return NextResponse.json(downloadResult);
      }

      case 'uploadBulkTrainingData': {
        if (!Array.isArray(trainingDatasets) || !tokenId) {
          return NextResponse.json({ error: 'tokenId and trainingDatasets required' }, { status: 400 });
        }
        const bulkResult = await zgStorageServer.uploadBulkTrainingData(tokenId, trainingDatasets);
        return NextResponse.json(bulkResult);
      }

      case 'uploadAIModelWeights': {
        if (!tokenId || !modelWeights || !modelConfig) {
          return NextResponse.json({ error: 'tokenId, modelWeights, modelConfig required' }, { status: 400 });
        }
        const weightsBuffer = Buffer.from(modelWeights, 'base64').buffer;
        const weightsResult = await zgStorageServer.uploadAIModelWeights(tokenId, weightsBuffer, modelConfig);
        return NextResponse.json(weightsResult);
      }

      case 'uploadModel': {
        if (!tokenId || !data) {
          return NextResponse.json({ error: 'tokenId and data required' }, { status: 400 });
        }
        const modelResult = await zgStorageServer.uploadKnowledge({
          type: "model",
          content: JSON.stringify(data),
          tokenId,
          metadata: { modelName: data.name, architecture: data.architecture }
        });
        return NextResponse.json(modelResult);
      }

      case 'uploadPerformance': {
        if (!tokenId || !data) {
          return NextResponse.json({ error: 'tokenId and data required' }, { status: 400 });
        }
        const perfResult = await zgStorageServer.uploadKnowledge({
          type: "performance",
          content: JSON.stringify(data),
          tokenId,
          metadata: { tradesCount: data.trades?.length || 0, period: "30d" }
        });
        return NextResponse.json(perfResult);
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Storage API error:", error);
    return NextResponse.json(
      { 
        error: "Storage operation failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get('uri');

  if (uri) {
    try {
      const data = await zgStorageServer.downloadFromStorage(uri);
      return NextResponse.json({
        success: true,
        data,
        message: "Data retrieved from 0G Storage"
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to retrieve data" }, 
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ 
    message: "Enhanced 0G Storage API with Real SDK",
    endpoints: {
      POST: "Upload data to 0G Storage",
      GET: "Retrieve data from 0G Storage (with ?uri=<storage_uri>)",
      actions: [
        "uploadKnowledge - Store Alpaca knowledge",
        "uploadModel - Store AI model metadata", 
        "uploadPerformance - Store trading performance data",
        "uploadBulkTrainingData - Store training datasets",
        "uploadAIModelWeights - Store AI model weights",
        "downloadFromStorage - Retrieve stored data"
      ]
    },
    features: [
      "Real 0G Storage SDK integration",
      "Fallback simulation mode",
      "Binary data support (AI model weights)",
      "Bulk operations",
      "Merkle tree verification"
    ],
    status: "Enhanced & Ready"
  });
}
