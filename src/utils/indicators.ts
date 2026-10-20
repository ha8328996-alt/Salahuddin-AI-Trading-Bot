import type { 
  Candle, 
  SignalType, 
  BotRiskSettings, 
  TradingSignal, 
  MarketSymbol, 
  Timeframe, 
  SimulatedTrade,
  EvaluatedRule,
  PriceAlert
} from '../types/trading.ts';

/**
 * Exponential Moving Average (EMA)
 * Multiplier = 2 / (period + 1)
 */
export function calculateEMA(prices: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = new Array(prices.length).fill(undefined);
  if (prices.length < period) return result;

  // First EMA value is SMA of the first 'period' prices
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEma = sum / period;
  result[period - 1] = Number(prevEma.toFixed(4));

  const multiplier = 2 / (period + 1);

  for (let i = period; i < prices.length; i++) {
    const currentPrice = prices[i];
    const currentEma = (currentPrice - prevEma) * multiplier + prevEma;
    result[i] = Number(currentEma.toFixed(4));
    prevEma = currentEma;
  }

  return result;
}

/**
 * Relative Strength Index (RSI) using Wilder's smoothing
 */
export function calculateRSI(prices: number[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = new Array(prices.length).fill(undefined);
  if (prices.length <= period) return result;

  let gains = 0;
  let losses = 0;

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  if (avgLoss === 0) {
    result[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    result[period] = Number((100 - 100 / (1 + rs)).toFixed(2));
  }

  // Wilder's smoothing for subsequent periods
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = Number((100 - 100 / (1 + rs)).toFixed(2));
    }
  }

  return result;
}

/**
 * Generate synthetic OHLC history for a symbol with realistic volatility & micro-trends
 */
export function generateRealisticCandles(
  symbolInfo: MarketSymbol,
  timeframe: Timeframe,
  count: number = 65
): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  // Determine interval in milliseconds
  let intervalMs = 60 * 1000;
  if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
  if (timeframe === '15m') intervalMs = 15 * 60 * 1000;
  if (timeframe === '30m') intervalMs = 30 * 60 * 1000;
  if (timeframe === '1h') intervalMs = 60 * 60 * 1000;
  if (timeframe === '4h') intervalMs = 4 * 60 * 60 * 1000;

  const volatility = symbolInfo.volatility || 0.003;

  // Build random walk backwards then forward to create cohesive charts
  const rawCloses: number[] = [];
  let tempPrice = symbolInfo.basePrice * (1 - volatility * 3);

  // Generate price path with small sinusoidal regime cycles
  for (let i = 0; i < count; i++) {
    const cycle = Math.sin((i / count) * Math.PI * 3.5) * (volatility * 1.8);
    const noise = (Math.random() - 0.49) * volatility;
    tempPrice = tempPrice * (1 + cycle * 0.15 + noise);
    rawCloses.push(tempPrice);
  }

  // Construct candle bars
  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * intervalMs;
    const prevBarClose = i > 0 ? candles[i - 1].close : rawCloses[0] * 0.999;
    const open = prevBarClose;
    const close = rawCloses[i];
    
    // High and Low
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    const wickHigh = maxOC + (Math.random() * 0.7 + 0.1) * (maxOC * volatility);
    const wickLow = Math.max(0.0001, minOC - (Math.random() * 0.7 + 0.1) * (minOC * volatility));

    const high = Number(wickHigh.toFixed(symbolInfo.precision));
    const low = Number(wickLow.toFixed(symbolInfo.precision));
    const normalizedOpen = Number(open.toFixed(symbolInfo.precision));
    const normalizedClose = Number(close.toFixed(symbolInfo.precision));

    const dateObj = new Date(t);
    const timeStr = timeframe === '1h' || timeframe === '4h'
      ? `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2, '0')}:00`
      : `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    const volume = Math.floor(Math.random() * 850 + 150);

    candles.push({
      time: t,
      timeStr,
      open: normalizedOpen,
      high: Math.max(high, normalizedOpen, normalizedClose),
      low: Math.min(low, normalizedOpen, normalizedClose),
      close: normalizedClose,
      volume,
    });
  }

  // Calculate EMA 20, EMA 50, and RSI across all candles
  const closes = candles.map(c => c.close);
  const ema20List = calculateEMA(closes, 20);
  const ema50List = calculateEMA(closes, 50);
  const rsiList = calculateRSI(closes, 14);

  for (let i = 0; i < candles.length; i++) {
    candles[i].ema20 = ema20List[i];
    candles[i].ema50 = ema50List[i];
    candles[i].rsi = rsiList[i];

    // Mark historical signal points where clear crossovers happened
    if (i > 22) {
      const prevEma20 = ema20List[i - 1];
      const prevEma50 = ema50List[i - 1];
      const curEma20 = ema20List[i];
      const curEma50 = ema50List[i];
      if (prevEma20 && prevEma50 && curEma20 && curEma50) {
        if (prevEma20 <= prevEma50 && curEma20 > curEma50) {
          candles[i].signalMarker = 'BUY';
        } else if (prevEma20 >= prevEma50 && curEma20 < curEma50) {
          candles[i].signalMarker = 'SELL';
        }
      }
    }
  }

  return candles;
}

/**
 * Advance price ticks: updates the current candle or opens a new one if time passed
 */
export function tickCandles(
  currentCandles: Candle[],
  symbolInfo: MarketSymbol,
  timeframe: Timeframe,
  forceNewBar: boolean = false
): Candle[] {
  if (currentCandles.length === 0) return currentCandles;

  const candles = [...currentCandles];
  const lastIndex = candles.length - 1;
  const lastBar = { ...candles[lastIndex] };

  // Calculate realistic micro tick movement
  const vol = (symbolInfo.volatility || 0.003) * 0.4;
  const tickDelta = (Math.random() - 0.495) * vol * lastBar.close;
  const newClose = Number((lastBar.close + tickDelta).toFixed(symbolInfo.precision));
  const newHigh = Number(Math.max(lastBar.high, newClose).toFixed(symbolInfo.precision));
  const newLow = Number(Math.min(lastBar.low, newClose).toFixed(symbolInfo.precision));

  lastBar.close = newClose;
  lastBar.high = newHigh;
  lastBar.low = newLow;
  lastBar.volume += Math.floor(Math.random() * 5 + 1);

  candles[lastIndex] = lastBar;

  if (forceNewBar) {
    const now = Date.now();
    const dateObj = new Date(now);
    const timeStr = timeframe === '1h' || timeframe === '4h'
      ? `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2, '0')}:00`
      : `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    candles.push({
      time: now,
      timeStr,
      open: newClose,
      high: newClose,
      low: newClose,
      close: newClose,
      volume: 1,
    });

    // Keep history length manageable
    if (candles.length > 80) {
      candles.shift();
    }
  }

  // Recalculate indicators for updated series
  const closes = candles.map(c => c.close);
  const ema20List = calculateEMA(closes, 20);
  const ema50List = calculateEMA(closes, 50);
  const rsiList = calculateRSI(closes, 14);

  for (let i = 0; i < candles.length; i++) {
    candles[i].ema20 = ema20List[i];
    candles[i].ema50 = ema50List[i];
    candles[i].rsi = rsiList[i];
  }

  return candles;
}

/**
 * Transparent AI Signal Evaluator with clear BUY, SELL, HOLD rules
 */
export function evaluateTradingSignal(
  candles: Candle[],
  symbolInfo: MarketSymbol,
  timeframe: Timeframe,
  settings: BotRiskSettings
): TradingSignal {
  const currentPrice = candles[candles.length - 1]?.close || symbolInfo.basePrice;
  const slDist = currentPrice * (settings.stopLossPct / 100);
  const tpDist = currentPrice * (settings.takeProfitPct / 100);

  const defaultSignal: TradingSignal = {
    id: `sig-${Date.now()}`,
    timestamp: Date.now(),
    symbol: symbolInfo.symbol,
    timeframe,
    type: 'HOLD',
    price: currentPrice,
    stopLossRef: Number((currentPrice - slDist).toFixed(symbolInfo.precision)),
    takeProfitRef: Number((currentPrice + tpDist).toFixed(symbolInfo.precision)),
    confidence: 50,
    ruleTitle: 'Neutral Market Consolidation',
    explanation: 'Technical indicators do not exhibit sufficient directional confluence; preserving capital.',
    reasoning: [
      'Insufficient candle history for algorithmic confluence.',
      'Awaiting clearer EMA & RSI directional breakout.'
    ],
    rulesEvaluated: [
      { name: 'EMA Alignment', condition: 'EMA20 > EMA50 for BUY, < for SELL', passed: false, details: 'In range' },
      { name: 'RSI Momentum', condition: '30 < RSI < 70 trending', passed: true, details: 'Neutral' },
    ],
    origin: 'rule_based',
    indicatorsSnapshot: {
      ema20: currentPrice,
      ema50: currentPrice,
      rsi: 50,
      trend: 'NEUTRAL'
    }
  };

  if (!candles || candles.length < 25) {
    return defaultSignal;
  }

  const current = candles[candles.length - 1];
  const previous = candles[candles.length - 2];

  const ema20 = current.ema20 ?? current.close;
  const ema50 = current.ema50 ?? current.close;
  const rsi = current.rsi ?? 50;

  const prevEma20 = previous.ema20 ?? previous.close;
  const prevEma50 = previous.ema50 ?? previous.close;
  const prevRsi = previous.rsi ?? 50;

  const isEmaBullish = ema20 > ema50;
  const isEmaGoldenCross = prevEma20 <= prevEma50 && ema20 > ema50;
  const isEmaDeathCross = prevEma20 >= prevEma50 && ema20 < ema50;
  const emaDiffPct = ((ema20 - ema50) / ema50) * 100;

  const isRsiOversold = rsi < 32;
  const isRsiOverbought = rsi > 68;
  const isRsiExitingOversold = prevRsi <= 30 && rsi > 30;
  const isRsiExitingOverbought = prevRsi >= 70 && rsi < 70;

  let type: SignalType = 'HOLD';
  let confidence = 50;
  let ruleTitle = 'Consolidation / Range Bound';
  let explanation = '';
  const reasoning: string[] = [];
  const rulesEvaluated: EvaluatedRule[] = [];

  const trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 
    isEmaBullish && emaDiffPct > 0.05 ? 'BULLISH' :
    !isEmaBullish && emaDiffPct < -0.05 ? 'BEARISH' : 'NEUTRAL';

  // Strategy 1: Multi-Factor AI Engine
  if (settings.strategy === 'multi_factor_ai') {
    let score = 0; // -100 to +100

    // Factor 1: EMA alignment (weight 35)
    const emaPassed = Math.abs(ema20 - ema50) > (current.close * 0.0003);
    if (ema20 > ema50) {
      score += 25;
      if (current.close > ema20) score += 10;
      reasoning.push(`EMA 20 (${ema20.toFixed(2)}) is above EMA 50 (${ema50.toFixed(2)}) indicating bullish structure.`);
      rulesEvaluated.push({
        name: 'EMA 20/50 Structural Alignment',
        condition: 'EMA 20 > EMA 50 (Bullish trend)',
        passed: true,
        details: `Spread: +${emaDiffPct.toFixed(3)}%`
      });
    } else {
      score -= 25;
      if (current.close < ema20) score -= 10;
      reasoning.push(`EMA 20 (${ema20.toFixed(2)}) is below EMA 50 (${ema50.toFixed(2)}) confirming downward pressure.`);
      rulesEvaluated.push({
        name: 'EMA 20/50 Structural Alignment',
        condition: 'EMA 20 < EMA 50 (Bearish trend)',
        passed: true,
        details: `Spread: ${emaDiffPct.toFixed(3)}%`
      });
    }

    // Factor 2: RSI Momentum (weight 35)
    if (rsi > 50 && rsi < 68) {
      score += 20;
      reasoning.push(`RSI is in healthy expansion territory at ${rsi.toFixed(1)} with no overbought exhaustion.`);
      rulesEvaluated.push({
        name: 'RSI Flow Filter',
        condition: '50 < RSI < 68 (Upside velocity)',
        passed: true,
        details: `RSI: ${rsi.toFixed(1)}`
      });
    } else if (rsi >= 68) {
      score -= 15;
      reasoning.push(`RSI is stretched near overbought at ${rsi.toFixed(1)} — risk of mean-reversion pullback.`);
      rulesEvaluated.push({
        name: 'RSI Overbought Guard',
        condition: 'RSI >= 68 (Exhaustion warning)',
        passed: false,
        details: `RSI: ${rsi.toFixed(1)}`
      });
    } else if (rsi < 50 && rsi > 32) {
      score -= 20;
      reasoning.push(`RSI is below median at ${rsi.toFixed(1)}, reflecting lingering seller dominance.`);
      rulesEvaluated.push({
        name: 'RSI Flow Filter',
        condition: '32 < RSI < 50 (Downside velocity)',
        passed: true,
        details: `RSI: ${rsi.toFixed(1)}`
      });
    } else if (rsi <= 32) {
      score += 20;
      reasoning.push(`RSI oversold at ${rsi.toFixed(1)} — potential bullish reversal bounce zone.`);
      rulesEvaluated.push({
        name: 'RSI Oversold Guard',
        condition: 'RSI <= 32 (Reversal setup)',
        passed: true,
        details: `RSI: ${rsi.toFixed(1)}`
      });
    }

    // Factor 3: Price Action Wick & Rejection (weight 30)
    const body = Math.abs(current.close - current.open);
    const upperWick = current.high - Math.max(current.close, current.open);
    const lowerWick = Math.min(current.close, current.open) - current.low;

    if (lowerWick > body * 1.2 && lowerWick > upperWick) {
      score += 20;
      reasoning.push(`Bullish wick rejection formed off low ${current.low.toFixed(2)}, showing dip buyers stepping in.`);
      rulesEvaluated.push({
        name: 'Candle Wick Support',
        condition: 'Lower wick > Body * 1.2',
        passed: true,
        details: `Wick: ${lowerWick.toFixed(2)}`
      });
    } else if (upperWick > body * 1.2 && upperWick > lowerWick) {
      score -= 20;
      reasoning.push(`Bearish upper rejection pin at high ${current.high.toFixed(2)}, showing overhead supply.`);
      rulesEvaluated.push({
        name: 'Candle Wick Resistance',
        condition: 'Upper wick > Body * 1.2',
        passed: true,
        details: `Wick: ${upperWick.toFixed(2)}`
      });
    } else {
      rulesEvaluated.push({
        name: 'Candle Wick Confirmation',
        condition: 'Extreme wick rejection',
        passed: false,
        details: 'Balanced candle'
      });
    }

    // Decision Mapping
    if (score >= 40) {
      type = 'BUY';
      confidence = Math.min(94, 60 + Math.round(score * 0.35));
      ruleTitle = 'AI Multi-Factor Bullish Confluence';
      explanation = `Bullish confluence triggered by EMA 20 structural dominance (+${emaDiffPct.toFixed(2)}%) and healthy RSI expansion (${rsi.toFixed(1)}).`;
      reasoning.push(`Confluence Score: +${score}/100. Target RR ratio 1:${(settings.takeProfitPct / settings.stopLossPct).toFixed(1)}`);
    } else if (score <= -40) {
      type = 'SELL';
      confidence = Math.min(94, 60 + Math.round(Math.abs(score) * 0.35));
      ruleTitle = 'AI Multi-Factor Bearish Confluence';
      explanation = `Bearish breakdown confirmed by downward EMA alignment and persistent selling pressure below median RSI.`;
      reasoning.push(`Confluence Score: ${score}/100. Target RR ratio 1:${(settings.takeProfitPct / settings.stopLossPct).toFixed(1)}`);
    } else {
      type = 'HOLD';
      confidence = 50 + Math.round(Math.abs(score) * 0.2);
      ruleTitle = 'Indecision Neutral Zone';
      explanation = `Indicators remain within neutral boundary bands (score ${score}/100); awaiting higher-probability directional expansion.`;
      reasoning.push(`Confluence Score ${score} is inside neutral band (-40 to +40). Preserve capital until setup confirms.`);
    }
  }

  // Strategy 2: EMA Crossover
  else if (settings.strategy === 'ema_crossover') {
    rulesEvaluated.push({
      name: 'EMA 20 Cross 50',
      condition: 'Fast moving average crosses slow moving average',
      passed: isEmaGoldenCross || isEmaDeathCross || Math.abs(emaDiffPct) > 0.1,
      details: `EMA20: ${ema20.toFixed(2)} | EMA50: ${ema50.toFixed(2)}`
    });

    if (isEmaGoldenCross || (isEmaBullish && current.close > ema20 && rsi > 45 && rsi < 72)) {
      type = 'BUY';
      confidence = isEmaGoldenCross ? 91 : 76;
      ruleTitle = isEmaGoldenCross ? 'Golden Cross: EMA 20 Cross Above EMA 50' : 'EMA 20 Dynamic Trend Support';
      explanation = `Fast EMA 20 (${ema20.toFixed(2)}) is positioned above Slow EMA 50 (${ema50.toFixed(2)}), verifying sustained upward momentum.`;
      reasoning.push(`Fast EMA 20 (${ema20.toFixed(2)}) is positioned above Slow EMA 50 (${ema50.toFixed(2)}).`);
      reasoning.push(`Price is sustaining above trend filter at ${current.close.toFixed(2)}.`);
      reasoning.push(`RSI sits at ${rsi.toFixed(1)}, validating upside velocity.`);
    } else if (isEmaDeathCross || (!isEmaBullish && current.close < ema20 && rsi < 55 && rsi > 28)) {
      type = 'SELL';
      confidence = isEmaDeathCross ? 91 : 76;
      ruleTitle = isEmaDeathCross ? 'Death Cross: EMA 20 Cross Below EMA 50' : 'EMA 20 Dynamic Trend Resistance';
      explanation = `Fast EMA 20 (${ema20.toFixed(2)}) is positioned below Slow EMA 50 (${ema50.toFixed(2)}), confirming downward trend bias.`;
      reasoning.push(`Fast EMA 20 (${ema20.toFixed(2)}) is below Slow EMA 50 (${ema50.toFixed(2)}).`);
      reasoning.push(`Price is rejected beneath moving average resistance at ${current.close.toFixed(2)}.`);
      reasoning.push(`RSI stands at ${rsi.toFixed(1)}, confirming downward trajectory.`);
    } else {
      type = 'HOLD';
      confidence = 55;
      ruleTitle = 'EMA Equilibrium / Awaiting Cross';
      explanation = `Moving averages are parallel or consolidating without a clean separation edge.`;
      reasoning.push(`EMA spread is ${Math.abs(emaDiffPct).toFixed(3)}%, which is below the minimum breakout threshold.`);
      reasoning.push(`Hold state active to prevent whipsaw losses.`);
    }
  }

  // Strategy 3: RSI Mean Reversion
  else if (settings.strategy === 'rsi_mean_reversion') {
    rulesEvaluated.push({
      name: 'RSI Extreme Trigger',
      condition: 'RSI <= 30 (Oversold) or RSI >= 70 (Overbought)',
      passed: isRsiOversold || isRsiOverbought || isRsiExitingOversold || isRsiExitingOverbought,
      details: `RSI: ${rsi.toFixed(1)}`
    });

    if (isRsiOversold || isRsiExitingOversold) {
      type = 'BUY';
      confidence = isRsiExitingOversold ? 88 : 78;
      ruleTitle = isRsiExitingOversold ? 'RSI Oversold Recovery (> 30)' : 'RSI Deep Oversold Reversal Zone (< 30)';
      explanation = `RSI reached an extreme oversold reading of ${rsi.toFixed(1)}; probabilistic mean-reversion favors an upward correction.`;
      reasoning.push(`RSI printed extreme reading of ${rsi.toFixed(1)} (Threshold: <= 30).`);
      reasoning.push(`Mean reversion probability exceeds 70% toward EMA 20 target (${ema20.toFixed(2)}).`);
      reasoning.push(`Stop-loss configured at ${settings.stopLossPct}% to guard against runaway selloffs.`);
    } else if (isRsiOverbought || isRsiExitingOverbought) {
      type = 'SELL';
      confidence = isRsiExitingOverbought ? 88 : 78;
      ruleTitle = isRsiExitingOverbought ? 'RSI Overbought Rejection (< 70)' : 'RSI Deep Overbought Exhaustion (> 70)';
      explanation = `RSI registered an elevated reading of ${rsi.toFixed(1)}; buyer momentum is exhausted, indicating high likelihood of pullback.`;
      reasoning.push(`RSI registered elevated reading of ${rsi.toFixed(1)} (Threshold: >= 70).`);
      reasoning.push(`Buyer exhaustion detected; probability favors pullback toward mean.`);
      reasoning.push(`Take-profit target anchored at ${settings.takeProfitPct}% return.`);
    } else {
      type = 'HOLD';
      confidence = 60;
      ruleTitle = 'RSI Within Safe Median Band (30-70)';
      explanation = `RSI at ${rsi.toFixed(1)} is inside normal range; mean reversion algorithm requires extreme threshold breach.`;
      reasoning.push(`RSI is hovering at ${rsi.toFixed(1)}, well between 30 and 70 thresholds.`);
      reasoning.push(`Mean reversion strategy strictly trades outer extremes; waiting for trigger.`);
    }
  }

  // Strategy 4: Breakout Momentum
  else {
    const highestHigh20 = Math.max(...candles.slice(-20).map(c => c.high));
    const lowestLow20 = Math.min(...candles.slice(-20).map(c => c.low));
    const isBreakout = current.close >= highestHigh20 * 0.998;
    const isBreakdown = current.close <= lowestLow20 * 1.002;

    rulesEvaluated.push({
      name: '20-Period Channel Range',
      condition: 'Price breaks out of 20-bar high/low band',
      passed: isBreakout || isBreakdown,
      details: `High: ${highestHigh20.toFixed(2)} | Low: ${lowestLow20.toFixed(2)}`
    });

    if (isBreakout && rsi > 55) {
      type = 'BUY';
      confidence = 82;
      ruleTitle = '20-Period High Volatility Breakout';
      explanation = `Price broke above the 20-period dynamic resistance channel with confirming expansion volume.`;
      reasoning.push(`Price is pressing multi-period highs at ${current.close.toFixed(2)}.`);
      reasoning.push(`RSI momentum at ${rsi.toFixed(1)} confirms expansion volume.`);
    } else if (isBreakdown && rsi < 45) {
      type = 'SELL';
      confidence = 82;
      ruleTitle = '20-Period Low Breakdown Trigger';
      explanation = `Price collapsed below the 20-period dynamic floor with negative RSI momentum confirming distribution.`;
      reasoning.push(`Price broke below range floor at ${current.close.toFixed(2)}.`);
      reasoning.push(`Bearish momentum confirmed by RSI at ${rsi.toFixed(1)}.`);
    } else {
      type = 'HOLD';
      confidence = 58;
      ruleTitle = 'Price Trapped in Range Channel';
      explanation = `Price action is oscillating between 20-period boundary channels; no directional breakout detected.`;
      reasoning.push(`Range bounds: High ${highestHigh20.toFixed(2)} | Low ${lowestLow20.toFixed(2)}.`);
      reasoning.push(`No breakout confirmed; capital preserved.`);
    }
  }

  // Calculate target reference levels
  const isBuy = type === 'BUY';
  const stopLossRef = Number((isBuy ? current.close - slDist : current.close + slDist).toFixed(symbolInfo.precision));
  const takeProfitRef = Number((isBuy ? current.close + tpDist : current.close - tpDist).toFixed(symbolInfo.precision));

  return {
    id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    symbol: symbolInfo.symbol,
    timeframe,
    type,
    price: current.close,
    stopLossRef,
    takeProfitRef,
    confidence,
    ruleTitle,
    explanation,
    reasoning,
    rulesEvaluated,
    origin: 'rule_based',
    indicatorsSnapshot: {
      ema20: Number(ema20.toFixed(symbolInfo.precision)),
      ema50: Number(ema50.toFixed(symbolInfo.precision)),
      rsi: Number(rsi.toFixed(1)),
      trend
    }
  };
}

/**
 * Update PnL and check Stop Loss / Take Profit for open simulated trades
 */
export function evaluateTradeState(
  trade: SimulatedTrade,
  currentPrice: number,
  pipSize: number = 0.0001
): { updatedTrade: SimulatedTrade; event?: 'TAKE_PROFIT' | 'STOP_LOSS' } {
  if (trade.status === 'CLOSED') {
    return { updatedTrade: trade };
  }

  const isBuy = trade.side === 'BUY';
  let pnl = 0;
  let pnlPercent = 0;

  if (isBuy) {
    pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
    pnl = (currentPrice - trade.entryPrice) * trade.quantity;
  } else {
    pnlPercent = ((trade.entryPrice - currentPrice) / trade.entryPrice) * 100;
    pnl = (trade.entryPrice - currentPrice) * trade.quantity;
  }

  // Check Stop Loss
  let hitSL = false;
  if (isBuy && currentPrice <= trade.stopLoss) hitSL = true;
  if (!isBuy && currentPrice >= trade.stopLoss) hitSL = true;

  // Check Take Profit
  let hitTP = false;
  if (isBuy && currentPrice >= trade.takeProfit) hitTP = true;
  if (!isBuy && currentPrice <= trade.takeProfit) hitTP = true;

  if (hitTP) {
    return {
      updatedTrade: {
        ...trade,
        currentPrice,
        status: 'CLOSED',
        exitPrice: trade.takeProfit,
        closedAt: Date.now(),
        pnl: Number(((isBuy ? trade.takeProfit - trade.entryPrice : trade.entryPrice - trade.takeProfit) * trade.quantity).toFixed(2)),
        pnlPercent: Number(((isBuy ? (trade.takeProfit - trade.entryPrice) : (trade.entryPrice - trade.takeProfit)) / trade.entryPrice * 100).toFixed(2)),
        exitReason: 'TAKE_PROFIT',
      },
      event: 'TAKE_PROFIT',
    };
  }

  if (hitSL) {
    return {
      updatedTrade: {
        ...trade,
        currentPrice,
        status: 'CLOSED',
        exitPrice: trade.stopLoss,
        closedAt: Date.now(),
        pnl: Number(((isBuy ? trade.stopLoss - trade.entryPrice : trade.entryPrice - trade.stopLoss) * trade.quantity).toFixed(2)),
        pnlPercent: Number(((isBuy ? (trade.stopLoss - trade.entryPrice) : (trade.entryPrice - trade.stopLoss)) / trade.entryPrice * 100).toFixed(2)),
        exitReason: 'STOP_LOSS',
      },
      event: 'STOP_LOSS',
    };
  }

  return {
    updatedTrade: {
      ...trade,
      currentPrice,
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
    },
  };
}

/**
 * Evaluates active price alert thresholds against current price
 */
export function evaluatePriceAlerts(
  alerts: PriceAlert[],
  currentPrice: number,
  symbol: string
): { updatedAlerts: PriceAlert[]; newlyTriggered: PriceAlert[] } {
  const newlyTriggered: PriceAlert[] = [];
  const updatedAlerts = alerts.map(alert => {
    if (alert.symbol === symbol && !alert.triggered) {
      const isCrossed =
        (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice);

      if (isCrossed) {
        const triggeredAlert: PriceAlert = {
          ...alert,
          triggered: true,
          triggeredAt: Date.now(),
        };
        newlyTriggered.push(triggeredAlert);
        return triggeredAlert;
      }
    }
    return alert;
  });

  return { updatedAlerts, newlyTriggered };
}
