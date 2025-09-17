#!/usr/bin/env node
// Deploy the unified AlpacaNFTOptimized contract and set baseURI
// Requires: npm i --save-dev solc
// Env: RPC_URL, PRIVATE_KEY, BASEURI (with trailing slash)

const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
  const RPC_URL = process.env.RPC_URL;
  const PK = process.env.PRIVATE_KEY || process.env.PK;
  const BASEURI = process.env.BASEURI;
  if (!RPC_URL || !PK) throw new Error('RPC_URL and PRIVATE_KEY/PK are required');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PK, provider);
  console.log('Deployer:', wallet.address);

  // Compile
  const contractPath = path.resolve(__dirname, '../contracts/AlpacaNFTOptimized.sol');
  const sources = {
    'AlpacaNFTOptimized.sol': {
      content: fs.readFileSync(contractPath, 'utf8'),
    },
  };

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  };

  // solc needs OZ imports resolved; so we expect you run with node_modules present
  function findImports(importPath) {
    try {
      const file = path.resolve(__dirname, '../node_modules', importPath);
      return { contents: fs.readFileSync(file, 'utf8') };
    } catch (e) {
      return { error: 'File not found: ' + importPath };
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  const contractName = 'AlpacaNFTOptimized';
  const artifact = output.contracts['AlpacaNFTOptimized.sol'][contractName];
  if (!artifact || !artifact.evm || !artifact.evm.bytecode || !artifact.abi) {
    console.error(JSON.stringify(output, null, 2));
    throw new Error('Compilation failed');
  }

  const factory = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode.object, wallet);
  console.log('Deploying...');
  const contract = await factory.deploy();
  const receipt = await contract.deploymentTransaction().wait();
  console.log('Contract deployed at:', contract.target);
  console.log('Tx:', receipt.hash);

  if (BASEURI) {
    console.log('Setting baseURI to:', BASEURI);
    const tx = await contract.setBaseURI(BASEURI);
    await tx.wait();
    console.log('baseURI set.');
  } else {
    console.log('BASEURI not provided. You can run set-base-uri.js later.');
  }

  // Write ABI for frontend
  const abiOut = path.resolve(__dirname, '../lib/contracts/abi.ts');
  const ts = 'export const ALPACA_NFT_ABI = ' + JSON.stringify(artifact.abi, null, 2) + ' as const;\n';
  fs.writeFileSync(abiOut, ts, 'utf8');
  console.log('Updated ABI at lib/contracts/abi.ts');
}

main().catch((e) => { console.error(e); process.exit(1); });

