echo "🔨 Compiling smart contracts..."
npx hardhat compile

echo "🚢 Deploying Alp#!/bin/bash

echo "🚀 Starting Alpaca Trading Pal Deployment to 0G Galileo Testnet..."
echo "================================================"

if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found. Please copy .env.example to .env.local and fill in your values."
    exit 1
fi

source .env.local

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env.local"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Compiling smart contracts..."
npx hardhat compile

echo "🚢 Deploying AlpacaNFT contract to 0G Galileo Testnet..."
CONTRACT_OUTPUT=$(npx hardhat run contracts/deploy/01-deploy-alpaca.ts --network 0gTestnet 2>&1)
CONTRACT_ADDRESS=$(echo "$CONTRACT_OUTPUT" | grep "AlpacaNFT deployed to:" | awk '{print $4}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Contract deployment failed"
    echo "$CONTRACT_OUTPUT"
    exit 1
fi

echo "✅ Contract deployed at: $CONTRACT_ADDRESS"

echo "📝 Updating contract address in environment file..."
if grep -q "NEXT_PUBLIC_ALPACA_NFT_ADDRESS=" .env.local; then
    sed -i.bak "s/NEXT_PUBLIC_ALPACA_NFT_ADDRESS=.*/NEXT_PUBLIC_ALPACA_NFT_ADDRESS=$CONTRACT_ADDRESS/" .env.local
else
    echo "NEXT_PUBLIC_ALPACA_NFT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local
fi

echo "📝 Updating contract address in addresses.ts..."
cat > lib/contracts/addresses.ts << EOF
export const CONTRACT_ADDRESSES = {
  ALPACA_NFT: "$CONTRACT_ADDRESS",
  STORAGE_FLOW: "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628",
  STORAGE_MARKET: "0x53191725d260221bBa307D8EeD6e2Be8DD265e19",
  DA_ENTRANCE: "0xE75A073dA5bb7b0eC622170Fd268f35E675a957B",
};

export const NETWORK = {
  chainId: 16601,
  name: "0G-Galileo-Testnet",
  rpcUrl: "https://evmrpc-testnet.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
};
EOF

echo "🔍 Verifying contract on 0G Chain Explorer..."
npx hardhat verify --network 0gTestnet $CONTRACT_ADDRESS || echo "⚠️ Contract verification failed (this is optional)"

echo "🎨 Building frontend..."
npm run build

echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo "📋 Contract Address: $CONTRACT_ADDRESS"
echo "🔗 Explorer: https://chainscan-galileo.0g.ai/address/$CONTRACT_ADDRESS"
echo "🌐 Faucet: https://faucet.0g.ai"
echo ""
echo "📌 Next Steps:"
echo "1. Get test OG tokens from the faucet"
echo "2. Run 'npm run dev' to start the application"
echo "3. Connect your wallet and mint your first Alpaca!"
echo "================================================"