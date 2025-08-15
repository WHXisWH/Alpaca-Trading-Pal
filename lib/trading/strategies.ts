export interface Strategy {
  id: string;
  name: string;
  rules: Rule[];
}

export interface Rule {
  condition: string;
  action: string;
  params: Record<string, any>;
}

export function parseStrategyText(text: string): Rule[] {
  const rules: Rule[] = [];
  
  if (text.includes("RSI < 30")) {
    rules.push({
      condition: "RSI_BELOW",
      action: "BUY",
      params: { threshold: 30 },
    });
  }
  
  if (text.includes("RSI > 70")) {
    rules.push({
      condition: "RSI_ABOVE",
      action: "SELL",
      params: { threshold: 70 },
    });
  }
  
  if (text.includes("20-day moving average")) {
    rules.push({
      condition: "MA_CROSS",
      action: "SIGNAL",
      params: { period: 20 },
    });
  }
  
  if (text.includes("stop loss")) {
    const match = text.match(/(\d+)%/);
    if (match) {
      rules.push({
        condition: "STOP_LOSS",
        action: "SELL",
        params: { percentage: parseInt(match[1]) },
      });
    }
  }
  
  return rules;
}

export function evaluateRules(
  rules: Rule[],
  marketData: any
): { action: string; reason: string } | null {
  for (const rule of rules) {
    switch (rule.condition) {
      case "RSI_BELOW":
        if (marketData.rsi < rule.params.threshold) {
          return { action: rule.action, reason: `RSI below ${rule.params.threshold}` };
        }
        break;
      case "RSI_ABOVE":
        if (marketData.rsi > rule.params.threshold) {
          return { action: rule.action, reason: `RSI above ${rule.params.threshold}` };
        }
        break;
    }
  }
  
  return null;
}