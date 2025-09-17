import { NextRequest, NextResponse } from 'next/server';
import { binanceClient } from '@/lib/trading/binance';
import { ZGComputeClient } from '@/lib/0g/compute';
import { zgStorageServer } from '@/lib/0g/storage-server';

// Simple per-process rate limiter and idempotency cache (best-effort on serverless)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // per IP
const rateMap: Map<string, { count: number; windowStart: number }> = new Map();

const IDEM_TTL_MS = 10 * 60_000; // 10 minutes
const idempMap: Map<string, { ts: number; result: any }> = new Map();

function clientIP(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for');
  return (xfwd?.split(',')[0] || 'unknown').trim();
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec || now - rec.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (rec.count >= RATE_LIMIT_MAX) return false;
  rec.count += 1;
  return true;
}

function validateSymbol(sym: any): string {
  if (typeof sym !== 'string') throw new Error('Invalid symbol');
  const s = sym.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!s || s.length > 20) throw new Error('Invalid symbol');
  return s;
}

function coerceNumber(n: any, name: string): number {
  const v = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(v) || v <= 0) throw new Error(`Invalid ${name}`);
  return v;
}

const zgCompute = new ZGComputeClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alpacaId, signal, symbol, symbols } = body;

    // Rate limit
    const ip = clientIP(request);
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Idempotency (best-effort)
    const idempotencyKey = request.headers.get('Idempotency-Key') || '';
    if (idempotencyKey) {
      const existing = idempMap.get(idempotencyKey);
      if (existing && Date.now() - existing.ts < IDEM_TTL_MS) {
        return NextResponse.json({ ...existing.result, idempotencyKey, cached: true });
      }
    }

    switch (action) {
      case 'getMarketData': {
        const marketData = await binanceClient.getMarketData(validateSymbol(symbol));
        return NextResponse.json({
          success: true,
          marketData,
          timestamp: Date.now()
        });
      }

      case 'getMultipleMarketData': {
        const safeSymbols = Array.isArray(symbols) ? symbols.map(validateSymbol) : undefined;
        const multipleData = await binanceClient.getMultipleMarketData(safeSymbols);
        return NextResponse.json({
          success: true,
          marketData: multipleData,
          count: multipleData.length
        });
      }

      case 'executeTradeSignal': {
        if (!alpacaId) throw new Error('alpacaId required');
        const safeSignal = {
          action: signal?.action === 'SELL' ? 'SELL' : signal?.action === 'BUY' ? 'BUY' : 'HOLD',
          symbol: validateSymbol(signal?.symbol || symbol),
          quantity: coerceNumber(signal?.quantity ?? 0.001, 'quantity'),
          price: coerceNumber(signal?.price ?? 0, 'price'),
          reason: String(signal?.reason || 'AI strategy'),
        };

        const orderResult = await binanceClient.executeTradeSignal(safeSignal as any, alpacaId);
        const tradeRecord = await binanceClient.createTradeRecord(orderResult, alpacaId);

        // Audit log to 0G Storage (best-effort)
        let audit: any = null;
        try {
          audit = await zgStorageServer.uploadKnowledge({
            type: 'performance',
            content: JSON.stringify({ idempotencyKey, ip, action: 'executeTradeSignal', safeSignal, orderResult, tradeRecord }),
            tokenId: String(alpacaId),
            metadata: { symbol: safeSignal.symbol, side: safeSignal.action, simulated: !!orderResult.simulated, mode: orderResult.mode || 'simulation' }
          });
        } catch (_) {}

        const result = {
          success: true,
          order: orderResult,
          tradeRecord,
          audit,
          message: `${safeSignal.action} order executed for Alpaca ${alpacaId}`,
          idempotencyKey: idempotencyKey || undefined,
        };
        if (idempotencyKey) idempMap.set(idempotencyKey, { ts: Date.now(), result });
        return NextResponse.json(result);
      }

      case 'generateTradingSignal': {
        // Use 0G Compute to generate trading signal
        const { marketData: currentMarket, alpacaContext } = body;
        
        await zgCompute.initialize();
        const strategy = await zgCompute.generateTradingStrategy(
          `Generate a trading signal based on current market data: ${JSON.stringify(currentMarket)}`,
          alpacaContext
        );
        
        // Parse strategy to create actual trading signal (simplified)
        const tradingSignal = {
          action: strategy.result.includes("BUY") ? "BUY" : 
                 strategy.result.includes("SELL") ? "SELL" : "HOLD",
          symbol: validateSymbol(currentMarket.symbol || "BTCUSDT"),
          quantity: 0.001,
          price: parseFloat(currentMarket.price || "0"),
          reason: "Generated by 0G AI Strategy",
          confidence: 0.8
        };

        return NextResponse.json({
          success: true,
          signal: tradingSignal,
          strategy: strategy.result,
          verified: strategy.verified
        });
      }

      case 'getBalance': {
        const balance = await binanceClient.getAccountBalance();
        return NextResponse.json({
          success: true,
          balance,
          message: "Account balance retrieved"
        });
      }

      case 'autoTrading': {
        // Start automated trading for an Alpaca
        const autoResult = await performAutoTrading(alpacaId, body.config, idempotencyKey, ip);
        return NextResponse.json({
          success: true,
          ...autoResult
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid trading action" }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Trading API error:", error);
    return NextResponse.json(
      { 
        error: "Trading operation failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const action = searchParams.get('action');

  try {
    if (action === 'marketData' && symbol) {
      const marketData = await binanceClient.getMarketData(symbol);
      return NextResponse.json({
        success: true,
        marketData
      });
    }

    if (action === 'balance') {
      const balance = await binanceClient.getAccountBalance();
      return NextResponse.json({
        success: true,
        balance
      });
    }

    return NextResponse.json({ 
      message: "Trading API",
      endpoints: {
        POST: "Execute trading operations",
        GET: "Get market data or balance (with ?action=marketData&symbol=BTCUSDT)",
        actions: [
          "getMarketData - Get single market data",
          "getMultipleMarketData - Get multiple market data",
          "executeTradeSignal - Execute a trading signal",
          "generateTradingSignal - Generate AI trading signals",
          "getBalance - Get account balance",
          "autoTrading - Start automated trading"
        ]
      },
      status: "Ready",
      demoMode: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" }, 
      { status: 500 }
    );
  }
}

async function performAutoTrading(alpacaId: string, config: any, idempotencyKey?: string, ip?: string) {
  try {
    console.log(`🤖 Starting auto trading for Alpaca ${alpacaId}`);
    
    // Get current market data
    const marketData = await binanceClient.getMarketData(validateSymbol(config.symbol || "BTCUSDT"));
    
    // Initialize 0G Compute
    await zgCompute.initialize();
    
    // Generate trading strategy
    const strategy = await zgCompute.generateTradingStrategy(
      "Analyze current market conditions and provide a trading decision",
      config.alpacaContext
    );
    
    // Simplified signal extraction (in real implementation, parse strategy more intelligently)
    const shouldBuy = strategy.result.toLowerCase().includes("buy");
    const shouldSell = strategy.result.toLowerCase().includes("sell");
    
    if (shouldBuy || shouldSell) {
      const signal = {
        action: shouldBuy ? "BUY" : "SELL" as "BUY" | "SELL",
        symbol: validateSymbol(config.symbol || "BTCUSDT"),
        quantity: config.quantity || 0.001,
        price: parseFloat(marketData.price),
        reason: "Auto-generated by AI strategy"
      };
      
      const orderResult = await binanceClient.executeTradeSignal(signal, alpacaId);
      const tradeRecord = await binanceClient.createTradeRecord(orderResult, alpacaId);
      // Audit log
      let audit: any = null;
      try {
        audit = await zgStorageServer.uploadKnowledge({
          type: 'performance',
          content: JSON.stringify({ idempotencyKey, ip, action: 'autoTrading', signal, orderResult, tradeRecord }),
          tokenId: String(alpacaId),
          metadata: { symbol: signal.symbol, side: signal.action, simulated: !!orderResult.simulated, mode: orderResult.mode || 'simulation' }
        });
      } catch (_) {}
      
      return {
        action: "trade_executed",
        signal,
        order: orderResult,
        tradeRecord,
        audit,
        strategy: strategy.result
      };
    } else {
      return {
        action: "no_trade",
        reason: "AI strategy recommended HOLD",
        marketData,
        strategy: strategy.result
      };
    }
  } catch (error) {
    console.error("Auto trading failed:", error);
    return {
      action: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
