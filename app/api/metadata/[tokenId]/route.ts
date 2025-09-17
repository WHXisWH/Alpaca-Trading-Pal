import { NextRequest, NextResponse } from 'next/server';
import Web3 from 'web3';
import { ALPACA_NFT_ABI } from '@/lib/contracts/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

const web3 = new Web3("https://rpc.ankr.com/0g_galileo_testnet_evm");
// Convert address to proper checksum format to avoid Web3 validation errors
const contractAddress = web3.utils.toChecksumAddress(CONTRACT_ADDRESSES.ALPACA_NFT);
function getContract(abi: any) {
  return new web3.eth.Contract(abi as any, contractAddress);
}

const contract = getContract(ALPACA_NFT_ABI as any);

const LEGACY_GETALPACA_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getAlpaca',
    outputs: [
      {
        components: [
          { name: 'name', type: 'string' },
          { name: 'riskAppetite', type: 'uint8' },
          { name: 'learningSpeed', type: 'uint8' },
          { name: 'preferredMarket', type: 'uint8' },
          { name: 'level', type: 'uint256' },
          { name: 'experience', type: 'uint256' },
          { name: 'modelURI', type: 'string' },
          { name: 'performanceURI', type: 'string' },
          { name: 'totalTrades', type: 'uint256' },
          { name: 'totalPnL', type: 'int256' },
          { name: 'wins', type: 'uint256' },
          { name: 'birthTime', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getWinRate',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const RISK_NAMES = ["Conservative", "Moderate", "Aggressive"];
const SPEED_NAMES = ["Steady", "Normal", "Fast"];
const MARKET_NAMES = ["Crypto", "Forex", "Stocks"];

function getAlpacaImage(riskAppetite: number): string {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://alpaca-trading-pal.vercel.app';
    
  switch(riskAppetite) {
    case 0: return `${baseUrl}/alpaca/conservative.webp`;
    case 2: return `${baseUrl}/alpaca/aggressive.webp`;
    default: return `${baseUrl}/alpaca/moderate.webp`;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const resolvedParams = await params;
    const tokenId = resolvedParams.tokenId;
    
    if (!tokenId || isNaN(Number(tokenId))) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    let alpaca: any;
    let winRate: any;
    try {
      alpaca = await contract.methods.getAlpaca(tokenId).call();
      winRate = await contract.methods.getWinRate(tokenId).call();
    } catch (e: any) {
      const msg = (e?.message || '').toString();
      const decodeErr = msg.includes('invalid codepoint') || msg.includes('missing continuation byte') || msg.includes('could not decode');
      if (!decodeErr) throw e;
      const legacy = getContract(LEGACY_GETALPACA_ABI as any);
      alpaca = await legacy.methods.getAlpaca(tokenId).call();
      winRate = await legacy.methods.getWinRate(tokenId).call();
      alpaca = { ...alpaca, evolutionStage: 0, equipmentId: 0 };
    }

    const metadata = {
      name: `${alpaca.name} #${tokenId}`,
      description: "AI Trading Companion on 0G Chain - Your intelligent NFT that learns, trades, and evolves with market experience.",
      image: getAlpacaImage(Number(alpaca.riskAppetite)),
      external_url: `https://alpaca-trading-pal.vercel.app/alpaca/${tokenId}`,
      attributes: [
        {
          trait_type: "Risk Appetite",
          value: RISK_NAMES[Number(alpaca.riskAppetite)] || "Unknown"
        },
        {
          trait_type: "Learning Speed", 
          value: SPEED_NAMES[Number(alpaca.learningSpeed)] || "Unknown"
        },
        {
          trait_type: "Preferred Market",
          value: MARKET_NAMES[Number(alpaca.preferredMarket)] || "Unknown"
        },
        {
          trait_type: "Level",
          value: Number(alpaca.level),
          display_type: "number"
        },
        {
          trait_type: "Experience",
          value: Number(alpaca.experience),
          display_type: "number"
        },
        {
          trait_type: "Total Trades",
          value: Number(alpaca.totalTrades),
          display_type: "number"
        },
        {
          trait_type: "Win Rate",
          value: Number(winRate),
          display_type: "number",
          max_value: 100
        },
        {
          trait_type: "Total P&L",
          value: Number(alpaca.totalPnL),
          display_type: "number"
        }
      ],
      properties: {
        category: "AI Trading Companion",
        blockchain: "0G Chain",
        birthTime: Number(alpaca.birthTime)
      }
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Metadata API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" }, 
      { status: 500 }
    );
  }
}
