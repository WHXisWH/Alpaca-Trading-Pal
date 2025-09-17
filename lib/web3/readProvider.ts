import Web3 from "web3";

// Singleton read-only Web3 instance using public RPC
let readOnlyWeb3: Web3 | null = null;

export function getReadOnlyWeb3(): Web3 | null {
  const rpc = process.env.NEXT_PUBLIC_0G_RPC_URL;
  if (!rpc) return null;
  if (readOnlyWeb3) return readOnlyWeb3;
  try {
    const provider = new Web3.providers.HttpProvider(rpc);
    readOnlyWeb3 = new Web3(provider);
    return readOnlyWeb3;
  } catch (_e) {
    return null;
  }
}

