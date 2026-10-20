/**
 * AI Trading Terminal - Domain Types
 */

export type MarketType = 'crypto' | 'forex';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h';

export type ConnectionStatus = 'demo' | 'disconnected' | 'connected';

export interface MarketSymbol {
  id: string;
  symbol: string;
  name: string;
  market: MarketType;
  basePrice: number;
  spreadPips: number;
  pipSize: number;
  precision: number;
  category: string;
  iconText: string;
  volatility: number;
}

export interface Candle {
  time: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  rsi?: number;
  signalMarker?: 'BUY' | 'SELL';
}

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface IndicatorSettings {
  showEma20: boolean;
  showEma50: boolean;
  showRsi: boolean;
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
}

export type StrategyMode = 
  | 'multi_factor_ai' 
  | 'ema_crossover' 
  | 'rsi_mean_reversion' 
  | 'breakout_momentum';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  createdPrice: number;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  label?: string;
}

export interface BotRiskSettings {
  riskPerTradePct: number; // e.g. 1.5%
  stopLossPct: number;     // e.g. 1.0%
  takeProfitPct: number;   // e.g. 2.5%
  strategy: StrategyMode;
  autoExecute: boolean;    // auto execute simulated orders on BUY/SELL signals
  simulationSpeed: 'slow' | 'normal' | 'fast';
  maxConcurrentTrades: number;
  trailingStop: boolean;
}

export interface EvaluatedRule {
  name: string;
  condition: string;
  passed: boolean;
  details: string;
}

export interface TradingSignal {
  id: string;
  timestamp: number;
  symbol: string;
  timeframe: Timeframe;
  type: SignalType;
  price: number; // Entry reference price
  stopLossRef: number;
  takeProfitRef: number;
  confidence: number; // Calculated confluence score (0 - 100%)
  ruleTitle: string;
  explanation: string;
  reasoning: string[];
  rulesEvaluated: EvaluatedRule[];
  origin: 'rule_based' | 'ai_analysis';
  indicatorsSnapshot: {
    ema20: number;
    ema50: number;
    rsi: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
}

export interface SimulatedTrade {
  id: string;
  symbol: string;
  market: MarketType;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  lots: number;
  margin: number;
  openedAt: number;
  closedAt?: number;
  status: 'OPEN' | 'CLOSED';
  pnl: number;
  pnlPercent: number;
  exitReason?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL_CLOSE' | 'SIGNAL_FLIP';
  signalRule?: string;
}

export interface AccountStats {
  initialBalance: number;
  balance: number;
  equity: number;
  unrealizedPnl: number;
  realizedPnl: number;
  marginUsed: number;
  freeMargin: number;
  marginLevelPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  profitFactor: number;
}
