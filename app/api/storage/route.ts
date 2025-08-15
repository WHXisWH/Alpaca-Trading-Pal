import { NextRequest, NextResponse } from 'next/server';
import { zgStorage } from '@/lib/0g/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, tokenId, uri } = body;

    switch (action) {
      case 'uploadKnowledge':
        const uploadResult = await zgStorage.uploadKnowledge({
          type: data.type || "knowledge",
          content: data.content,
          tokenId,
          metadata: data.metadata
        });
        
        return NextResponse.json({
          success: true,
          txHash: uploadResult.txHash,
          storageRoot: uploadResult.root,
          url: uploadResult.url,
          message: "Knowledge uploaded to 0G Storage"
        });

      case 'downloadData':
        const downloadResult = await zgStorage.downloadFromStorage(uri);
        return NextResponse.json({
          success: true,
          data: downloadResult,
          message: "Data retrieved from 0G Storage"
        });

      case 'uploadModel':
        const modelResult = await zgStorage.uploadModelMetadata(tokenId, data);
        return NextResponse.json({
          success: true,
          txHash: modelResult.txHash,
          url: modelResult.url,
          message: "Model metadata uploaded to 0G Storage"
        });

      case 'uploadPerformance':
        const perfResult = await zgStorage.uploadPerformanceData(tokenId, data);
        return NextResponse.json({
          success: true,
          txHash: perfResult.txHash,
          url: perfResult.url,
          message: "Performance data uploaded to 0G Storage"
        });

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
      const data = await zgStorage.downloadFromStorage(uri);
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
    message: "0G Storage API",
    endpoints: {
      POST: "Upload data to 0G Storage",
      GET: "Retrieve data from 0G Storage (with ?uri=<storage_uri>)",
      actions: [
        "uploadKnowledge - Store Alpaca knowledge",
        "uploadModel - Store AI model metadata",
        "uploadPerformance - Store trading performance data",
        "downloadData - Retrieve stored data"
      ]
    },
    status: "Ready"
  });
}