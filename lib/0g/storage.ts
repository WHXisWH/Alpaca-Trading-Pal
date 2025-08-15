import { StorageUploadResult, ZGStorageConfig } from "@/types/0g";

// 0G Storage configuration for Galileo testnet
const DEFAULT_CONFIG: ZGStorageConfig = {
  endpoint: "https://rpc-testnet.0g.ai",
  indexerEndpoint: "https://indexer-testnet.0g.ai",
  evmRpc: "https://evmrpc-testnet.0g.ai",
  privateKey: process.env.PRIVATE_KEY || "",
};

export class ZGStorageClient {
  private config: ZGStorageConfig;

  constructor(config?: Partial<ZGStorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async uploadKnowledge(data: {
    type: "knowledge" | "model" | "performance";
    content: string;
    tokenId: string;
    metadata?: any;
  }): Promise<StorageUploadResult> {
    try {
      // Create structured data for Alpaca knowledge
      const structuredData = {
        timestamp: Date.now(),
        alpacaId: data.tokenId,
        dataType: data.type,
        content: data.content,
        metadata: {
          version: "1.0",
          source: "Alpaca Trading Pal",
          ...data.metadata
        }
      };

      // Convert to buffer for storage
      const jsonContent = JSON.stringify(structuredData, null, 2);
      const buffer = Buffer.from(jsonContent, 'utf-8');

      // For demo purposes, we'll simulate the storage upload
      // In real implementation, you would use 0G Storage SDK
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
      const mockRoot = `0x${Math.random().toString(16).slice(2)}`;
      const filename = `alpaca-${data.tokenId}-${data.type}-${Date.now()}.json`;
      
      // Simulate storage delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: StorageUploadResult = {
        txHash: mockTxHash,
        root: mockRoot,
        url: `https://storage-testnet.0g.ai/${mockRoot}/${filename}`
      };

      console.log(`📦 Uploaded to 0G Storage:`, {
        type: data.type,
        size: buffer.length,
        hash: result.txHash.slice(0, 10) + '...'
      });

      return result;
    } catch (error) {
      console.error("0G Storage upload failed:", error);
      throw new Error(`Storage upload failed: ${error}`);
    }
  }

  async downloadFromStorage(storageUrl: string): Promise<any> {
    try {
      // Simulate download from 0G Storage
      // In real implementation, you would fetch from 0G network
      console.log(`📥 Downloading from 0G Storage: ${storageUrl}`);
      
      // For demo, return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: "Mock knowledge data from 0G Storage",
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("0G Storage download failed:", error);
      throw new Error(`Storage download failed: ${error}`);
    }
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