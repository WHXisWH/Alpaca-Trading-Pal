const Web3 = require('web3');
const { ethers } = require('ethers');
const chalk = require('chalk');

const DEMO_CONFIG = {
  rpcUrl: 'https://evmrpc-testnet.0g.ai',
  explorerUrl: 'https://chainscan-galileo.0g.ai',
  contractAddress: process.env.NEXT_PUBLIC_ALPACA_NFT_ADDRESS || '',
  privateKey: process.env.PRIVATE_KEY || ''
};

async function runDemo() {
  console.log(chalk.cyan.bold('\n🦙 Alpaca Trading Pal - Wavehack Demo\n'));
  console.log(chalk.yellow('====================================================='));
  
  const provider = new ethers.providers.JsonRpcProvider(DEMO_CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(DEMO_CONFIG.privateKey, provider);
  
  console.log(chalk.green('✅ Connected to 0G Galileo Testnet'));
  console.log(chalk.white(`📍 Wallet Address: ${wallet.address}`));
  
  const balance = await provider.getBalance(wallet.address);
  console.log(chalk.white(`💰 Balance: ${ethers.utils.formatEther(balance)} OG`));
  
  console.log(chalk.yellow('\n📋 Demo Features:'));
  console.log(chalk.white('1. Mint Alpaca NFT with random traits'));
  console.log(chalk.white('2. Feed knowledge using 0G Storage'));
  console.log(chalk.white('3. Generate AI strategies with 0G Compute'));
  console.log(chalk.white('4. Execute automated trades on Binance Testnet'));
  console.log(chalk.white('5. Store performance data on 0G DA'));
  
  console.log(chalk.yellow('\n🎯 0G Integration Points:'));
  console.log(chalk.white(`- Storage Flow: 0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628`));
  console.log(chalk.white(`- DA Entrance: 0xE75A073dA5bb7b0eC622170Fd268f35E675a957B`));
  console.log(chalk.white(`- Compute (Llama): 0xf07240Efa67755B5311bc75784a061eDB47165Dd`));
  console.log(chalk.white(`- Compute (DeepSeek): 0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3`));
  
  if (DEMO_CONFIG.contractAddress) {
    console.log(chalk.green(`\n✅ AlpacaNFT Contract: ${DEMO_CONFIG.contractAddress}`));
    console.log(chalk.cyan(`🔗 View on Explorer: ${DEMO_CONFIG.explorerUrl}/address/${DEMO_CONFIG.contractAddress}`));
  } else {
    console.log(chalk.red('\n⚠️ AlpacaNFT not deployed yet. Run deploy script first.'));
  }
  
  console.log(chalk.yellow('\n📺 Demo Video Walkthrough:'));
  console.log(chalk.white('1. Connect wallet with Web3Auth'));
  console.log(chalk.white('2. Mint an Alpaca with unique traits'));
  console.log(chalk.white('3. Feed trading strategies as knowledge'));
  console.log(chalk.white('4. Watch AI generate personalized strategies'));
  console.log(chalk.white('5. Enable auto-trading and see live P&L'));
  console.log(chalk.white('6. View Alpaca on leaderboard'));
  console.log(chalk.white('7. List Alpaca on marketplace'));
  
  console.log(chalk.yellow('\n====================================================='));
  console.log(chalk.green.bold('🚀 Ready for Wavehack submission!'));
  console.log(chalk.cyan('\nVisit http://localhost:3000 to start the demo\n'));
}

runDemo().catch(console.error);