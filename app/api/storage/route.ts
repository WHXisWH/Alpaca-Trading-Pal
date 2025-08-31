import { NextRequest, NextResponse } from 'next/server';
import { zgStorageServer } from '@/lib/0g/storage-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, tokenId, storageUrl, trainingDatasets, modelWeights, modelConfig } = body;

    switch (action) {
      case 'uploadKnowledge':
        const uploadResult = await zgStorageServer.uploadKnowledge({
          type: data.type || "knowledge",
          content: data.content,
          tokenId: data.tokenId,
          metadata: data.metadata
        });
        
        return NextResponse.json(uploadResult);

      case 'downloadFromStorage':
        const downloadResult = await zgStorageServer.downloadFromStorage(storageUrl);
        return NextResponse.json(downloadResult);

      case 'uploadBulkTrainingData':
        const bulkResult = await zgStorageServer.uploadBulkTrainingData(tokenId, trainingDatasets);
        return NextResponse.json(bulkResult);

      case 'uploadAIModelWeights':
        const weightsBuffer = Buffer.from(modelWeights, 'base64').buffer;
        const weightsResult = await zgStorageServer.uploadAIModelWeights(tokenId, weightsBuffer, modelConfig);
        return NextResponse.json(weightsResult);

      case 'uploadModel':
        const modelResult = await zgStorageServer.uploadKnowledge({
          type: "model",
          content: JSON.stringify(data),
          tokenId,
          metadata: { modelName: data.name, architecture: data.architecture }
        });
        return NextResponse.json(modelResult);

      case 'uploadPerformance':
        const perfResult = await zgStorageServer.uploadKnowledge({
          type: "performance",
          content: JSON.stringify(data),
          tokenId,
          metadata: { tradesCount: data.trades?.length || 0, period: "30d" }
        });
        return NextResponse.json(perfResult);

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