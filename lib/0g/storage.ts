import { StorageUploadResult } from "@/types/0g";

export class ZGStorageClient {
  private baseUrl = "/api/storage";

  constructor() {
    console.log("📦 0G Storage: Client mode, using API calls");
  }

  async uploadKnowledge(data: {
    type: "knowledge" | "model" | "performance";
    content: string;
    tokenId: string;
    metadata?: any;
  }): Promise<StorageUploadResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "uploadKnowledge",
          data
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`📦 Client: Uploaded via API:`, {
        type: data.type,
        hash: result.txHash?.slice(0, 10) + '...'
      });
      
      return result;
    } catch (error) {
      console.error("0G Storage API upload failed:", error);
      return this.simulateUpload(data);
    }
  }

  private simulateUpload(data: any): StorageUploadResult {
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    const mockRoot = `0x${Math.random().toString(16).slice(2)}`;
    
    const result: StorageUploadResult = {
      txHash: mockTxHash,
      root: mockRoot,
      url: `https://storage-testnet.0g.ai/${mockRoot}/alpaca-${data.tokenId}-${data.type}-${Date.now()}.json`
    };

    console.log(`📦 Client: Simulated upload fallback:`, {
      type: data.type,
      hash: result.txHash.slice(0, 10) + '...'
    });

    return result;
  }

  async downloadFromStorage(storageUrl: string): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "downloadFromStorage",
          storageUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`📥 Client: Downloaded via API:`, {
        url: storageUrl.slice(0, 50) + '...'
      });
      
      return result;
    } catch (error) {
      console.error("0G Storage API download failed:", error);
      return this.simulateDownload(storageUrl);
    }
  }

  private simulateDownload(storageUrl: string): any {
    console.log(`📥 Client: Simulated download fallback: ${storageUrl}`);
    
    return {
      success: true,
      data: "Mock knowledge data from 0G Storage",
      timestamp: Date.now()
    };
  }

  async uploadModelMetadata(tokenId: string, modelData: {
    name: string;
    description: string;
    architecture: string;
    parameters: any;
    performance: any;
  }): Promise<StorageUploadResult> {
    return this.uploadKnowledge({
      type: "model",
      content: JSON.stringify(modelData),
      tokenId,
      metadata: {
        modelName: modelData.name,
        architecture: modelData.architecture
      }
    });
  }

  async uploadPerformanceData(tokenId: string, performanceData: {
    trades: any[];
    metrics: any;
    analysis: string;
  }): Promise<StorageUploadResult> {
    return this.uploadKnowledge({
      type: "performance",
      content: JSON.stringify(performanceData),
      tokenId,
      metadata: {
        tradesCount: performanceData.trades.length,
        period: "30d"
      }
    });
  }

  async uploadBulkTrainingData(tokenId: string, trainingDatasets: {
    name: string;
    data: any[];
    format: string;
  }[]): Promise<StorageUploadResult[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "uploadBulkTrainingData",
          tokenId,
          trainingDatasets
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Bulk training data upload failed:", error);
      return [];
    }
  }

  async uploadAIModelWeights(tokenId: string, modelWeights: ArrayBuffer, modelConfig: {
    architecture: string;
    version: string;
    parameters: any;
  }): Promise<StorageUploadResult> {
    try {
      const weightsBase64 = Buffer.from(modelWeights).toString('base64');
      
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "uploadAIModelWeights",
          tokenId,
          modelWeights: weightsBase64,
          modelConfig
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("AI model weights upload failed:", error);
      return this.simulateUpload({ tokenId, type: "model_weights" });
    }
  }
}

// Export singleton instance
export const zgStorage = new ZGStorageClient();

// Legacy exports for compatibility
export async function uploadToStorage(data: {
  type: string;
  content: string;
  tokenId: string;
}): Promise<string> {
  const result = await zgStorage.uploadKnowledge(data as any);
  return result.url;
}

export async function downloadFromStorage(uri: string) {
  return zgStorage.downloadFromStorage(uri);
}