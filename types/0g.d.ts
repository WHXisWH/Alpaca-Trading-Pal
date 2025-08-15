// 0G Chain related types

export interface ZGStorageConfig {
  endpoint: string;
  indexerEndpoint: string;
  evmRpc: string;
  privateKey: string;
}

export interface ZGComputeConfig {
  brokerAddress: string;
  providerAddress: string;
  chainId: number;
}

export interface StorageUploadResult {
  txHash: string;
  root: string;
  url: string;
}

export interface ComputeResponse {
  result: string;
  cost: bigint;
  verified: boolean;
}

export interface AIModelMetadata {
  name: string;
  description: string;
  version: string;
  inputSchema: object;
  outputSchema: object;
  storageRoot: string;
  computeProvider: string;
}

export interface TrainingSession {
  id: string;
  tokenId: string;
  knowledge: string[];
  modelVersion: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  completedAt?: number;
}