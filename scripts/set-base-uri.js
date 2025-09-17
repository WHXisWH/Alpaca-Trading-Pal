#!/usr/bin/env node
// Set baseURI on a deployed contract
// Env: RPC_URL, PRIVATE_KEY (or PK), CONTRACT, BASEURI (with trailing slash)

const { ethers } = require('ethers');

async function main() {
  const { RPC_URL, PRIVATE_KEY, PK, CONTRACT, BASEURI } = process.env;
  if (!RPC_URL || !(PRIVATE_KEY || PK) || !CONTRACT || !BASEURI) {
    throw new Error('RPC_URL, PRIVATE_KEY/PK, CONTRACT, BASEURI are required');
  }
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY || PK, provider);
  const abi = ["function setBaseURI(string)"]; 
  const c = new ethers.Contract(CONTRACT, abi, wallet);
  console.log('Setting baseURI on', CONTRACT, 'to', BASEURI);
  const tx = await c.setBaseURI(BASEURI);
  console.log('Tx:', tx.hash);
  await tx.wait();
  console.log('Done');
}

main().catch((e) => { console.error(e); process.exit(1); });

