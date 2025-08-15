// 0G Chain configuration and utilities

export const ZG_TESTNET_CONFIG = {
  chainId: 16601,
  chainName: "0G-Galileo-Testnet",
  nativeCurrency: {
    name: "0G",
    symbol: "OG",
    decimals: 18,
  },
  rpcUrls: [
    "https://evmrpc-testnet.0g.ai"
  ],
  blockExplorerUrls: [
    "https://chainscan-galileo.0g.ai"
  ],
  faucetUrl: "https://faucet.0g.ai",
};

export const ZG_CONTRACTS = {
  // 0G Storage contracts on Galileo testnet
  STORAGE_FLOW: "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628",
  STORAGE_MINE: "0x3A0d1d67497Ad770d6f72e7f4B8F0BAbaa2A649C",
  STORAGE_MARKET: "0x53191725d260221bBa307D8EeD6e2Be8DD265e19",
  STORAGE_REWARD: "0xd3D4D91125D76112AE256327410Dd0414Ee08Cb4",
  
  // 0G DA contract
  DA_ENTRANCE: "0xE75A073dA5bb7b0eC622170Fd268f35E675a957B",
};

export const ZG_SERVICES = {
  // 0G Compute Network official providers
  COMPUTE_PROVIDERS: {
    "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
    "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
  }
};

export function getZGNetworkConfig() {
  return ZG_TESTNET_CONFIG;
}

export function isZGNetwork(chainId: number): boolean {
  return chainId === ZG_TESTNET_CONFIG.chainId;
}

export function formatZGAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getZGExplorerUrl(txHash?: string, address?: string): string {
  const baseUrl = ZG_TESTNET_CONFIG.blockExplorerUrls[0];
  if (txHash) return `${baseUrl}/tx/${txHash}`;
  if (address) return `${baseUrl}/address/${address}`;
  return baseUrl;
}