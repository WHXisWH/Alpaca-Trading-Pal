import { StorageUploadResult, ZGStorageConfig } from "@/types/0g";

const DEFAULT_CONFIG: ZGStorageConfig = {
  endpoint: "https://rpc-testnet.0g.ai",
  indexerEndpoint: "https://indexer-storage-testnet-standard.0g.ai", 
  evmRpc: "https://rpc.ankr.com/0g_galileo_testnet_evm",
  privateKey: process.env.PRIVATE_KEY || "",
};

export class ZGStorageServerClient {
  private config: ZGStorageConfig;
  private initialized = false;
  private sdkAvailable = false;

  constructor(config?: Partial<ZGStorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      if (!this.config.privateKey) {
        throw new Error("Private key required for 0G Storage operations");
      }

      const { Indexer, MemData } = await import("@0glabs/0g-ts-sdk");
      const { ethers } = await import("ethers");
      
      const provider = new ethers.JsonRpcProvider(this.config.evmRpc);
      const wallet = new ethers.Wallet(this.config.privateKey, provider);
      const indexer = new Indexer(this.config.indexerEndpoint);
      
      (this as any).wallet = wallet;
      (this as any).indexer = indexer;
      (this as any).MemData = MemData;
      
      this.sdkAvailable = true;
      console.log("📦 Server: Initialized 0G Storage Client");
    } catch (error) {
      console.warn("Failed to initialize 0G Storage, using simulation mode:", error);
      this.sdkAvailable = false;
    }
  }

  async uploadKnowledge(data: {
    type: "knowledge" | "model" | "performance";
    content: string;
    tokenId: string;
    metadata?: any;
  }): Promise<StorageUploadResult> {
    await this.initialize();

    try {
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

      const jsonContent = JSON.stringify(structuredData, null, 2);
      
      if (this.sdkAvailable) {
        return await this.uploadToRealStorage(jsonContent, data);
      } else {
        return await this.simulateUpload(jsonContent, data);
      }
    } catch (error) {
      console.error("0G Storage upload failed:", error);
      return await this.simulateUpload(JSON.stringify(data), data);
    }
  }

  private async uploadToRealStorage(content: string, data: any): Promise<StorageUploadResult> {
    const buffer = Buffer.from(content, 'utf-8');
    const MemData = (this as any).MemData;
    const wallet = (this as any).wallet;
    const indexer = (this as any).indexer;
    
    const file = new MemData(buffer);
    
    // Use official method: indexer.upload() handles flow contract automatically
    const [tx, err] = await indexer.upload(file, this.config.evmRpc, wallet);
    
    if (err) {
      throw new Error(`Failed to upload to 0G Storage: ${err}`);
    }
    
    // Get merkle tree for root hash
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr) {
      throw new Error(`Failed to create merkle tree: ${treeErr}`);
    }

    const result: StorageUploadResult = {
      txHash: tx,
      root: tree.rootHash(),
      url: `${this.config.indexerEndpoint}/download/${tree.rootHash()}`
    };

    console.log(`📦 Server: Uploaded to 0G Storage:`, {
      type: data.type,
      size: buffer.length,
      root: result.root.slice(0, 10) + '...',
      txHash: tx.slice(0, 10) + '...'
    });

    return result;
  }

  private async simulateUpload(content: string, data: any): Promise<StorageUploadResult> {
    const buffer = Buffer.from(content, 'utf-8');
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    const mockRoot = `0x${Math.random().toString(16).slice(2)}`;
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result: StorageUploadResult = {
      txHash: mockTxHash,
      root: mockRoot,
      url: `https://storage-testnet.0g.ai/${mockRoot}/alpaca-${data.tokenId}-${data.type}-${Date.now()}.json`
    };

    console.log(`📦 Server: Simulated upload to 0G Storage:`, {
      type: data.type,
      size: buffer.length,
      hash: result.txHash.slice(0, 10) + '...'
    });

    return result;
  }

  async downloadFromStorage(storageUrl: string): Promise<any> {
    await this.initialize();

    try {
      if (this.sdkAvailable && storageUrl.includes('/download/')) {
        return await this.downloadFromRealStorage(storageUrl);
      } else {
        return await this.simulateDownload(storageUrl);
      }
    } catch (error) {
      console.error("0G Storage download failed:", error);
      return await this.simulateDownload(storageUrl);
    }
  }

  private async downloadFromRealStorage(storageUrl: string): Promise<any> {
    const rootHash = storageUrl.split('/download/')[1];
    const indexer = (this as any).indexer;
    
    const data = await indexer.download(rootHash);
    const content = Buffer.from(data).toString('utf-8');
    const parsed = JSON.parse(content);

    console.log(`📥 Server: Downloaded from 0G Storage:`, {
      root: rootHash.slice(0, 10) + '...',
      size: data.length
    });

    return {
      success: true,
      data: parsed,
      timestamp: Date.now()
    };
  }

  private async simulateDownload(storageUrl: string): Promise<any> {
    console.log(`📥 Server: Simulated download from 0G Storage: ${storageUrl}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: "Mock knowledge data from 0G Storage",
      timestamp: Date.now()
    };
  }

  async uploadBulkTrainingData(tokenId: string, trainingDatasets: {
    name: string;
    data: any[];
    format: string;
  }[]): Promise<StorageUploadResult[]> {
    const results: StorageUploadResult[] = [];
    
    for (const dataset of trainingDatasets) {
      try {
        const result = await this.uploadKnowledge({
          type: "model",
          content: JSON.stringify(dataset),
          tokenId,
          metadata: {
            datasetName: dataset.name,
            format: dataset.format,
            recordCount: dataset.data.length
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload dataset ${dataset.name}:`, error);
      }
    }
    
    return results;
  }

  async uploadAIModelWeights(tokenId: string, modelWeights: ArrayBuffer, modelConfig: {
    architecture: string;
    version: string;
    parameters: any;
  }): Promise<StorageUploadResult> {
    await this.initialize();

    try {
      const metadata = {
        timestamp: Date.now(),
        alpacaId: tokenId,
        dataType: "model_weights",
        architecture: modelConfig.architecture,
        version: modelConfig.version,
        parameters: modelConfig.parameters
      };

      if (this.sdkAvailable) {
        const ZgFile = (this as any).ZgFile;
        const flowContract = (this as any).flowContract;
        const indexer = (this as any).indexer;
        
        const file = new ZgFile(new Uint8Array(modelWeights));
        
        const [tree, err] = await file.merkleTree();
        if (err) {
          throw new Error(`Failed to create merkle tree: ${err}`);
        }

        const submission = await flowContract.submit(tree.root());
        await submission.wait();

        const segments = await file.split(flowContract.segmentSize());
        await indexer.upload(segments);

        return {
          txHash: submission.hash,
          root: tree.root(),
          url: `${this.config.indexerEndpoint}/download/${tree.root()}`
        };
      } else {
        return await this.simulateUpload(JSON.stringify(metadata), { tokenId, type: "model_weights" });
      }
    } catch (error) {
      console.error("Failed to upload AI model weights:", error);
      throw error;
    }
  }
}

export const zgStorageServer = new ZGStorageServerClient();