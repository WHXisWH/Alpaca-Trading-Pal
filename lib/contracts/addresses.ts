export const CONTRACT_ADDRESSES = {
  // TODO: Deploy contract and update this address
  ALPACA_NFT: process.env.NEXT_PUBLIC_ALPACA_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
  STORAGE_FLOW: "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628",
  STORAGE_MARKET: "0x53191725d260221bBa307D8EeD6e2Be8DD265e19",
};

export const NETWORK = {
  chainId: 16601,
  name: "0G-Galileo-Testnet",
  rpcUrl: "https://rpc.ankr.com/0g_galileo_testnet_evm",
  explorer: "https://chainscan-galileo.0g.ai",
};