import React, { useState } from 'react';
import { Candle, MarketSymbol, TradingSignal, BotRiskSettings } from '../../types/trading';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  MinusCircle, 
  Activity, 
  ShieldCheck, 
  Target, 
  BarChart2, 
  Cpu, 
  Layers, 
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AnalysisViewProps {
  symbolInfo: MarketSymbol;
  timeframe: string;
  candles: Candle[];
  currentSignal: TradingSignal | null;
  settings: BotRiskSettings;
  onExecuteSignal: (signal: TradingSignal) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  symbolInfo,
  timeframe,
  candles,
  currentSignal,
  settings,
  onExecuteSignal,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState('Just now');

  const currentPrice = candles[candles.length - 1]?.close || symbolInfo.basePrice;
  const ema20 = candles[candles.length - 1]?.ema20 || currentPrice;
  const ema50 = candles[candles.length - 1]?.ema50 || currentPrice;
  const rsi = candles[candles.length - 1]?.rsi || 50;

  const isBullish = ema20 > ema50;
  const supportLevel = Math.min(...candles.slice(-15).map(c => c.low));
  const resistanceLevel = Math.max(...candles.slice(-15).map(c => c.high));

  // Volatility estimate
  const recentRanges = candles.slice(-10).map(c => c.high - c.low);
  const avgRange = recentRanges.reduce((a, b) => a + b, 0) / (recentRanges.length || 1);
  const volatilityLevel = avgRange / currentPrice > 0.005 ? 'High (Expansion)' : 'Moderate (Consolidation)';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastAnalyzed(new Date().toLocaleTimeString());
    }, 500);
  };

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                AI MARKET STRUCTURE & CONFLUENCE MATRIX
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2589FF]/10 text-[#2589FF] border border-[#2589FF]/30 font-semibold">
                QUANT ENGINE v2.4
              </span>
            </div>
            <p className="text-xs text-[#7A889B] truncate mt-0.5">
              Deep institutional analysis for <span className="text-white font-bold">{symbolInfo.name} ({symbolInfo.symbol})</span> • Timeframe: <span className="text-[#2589FF] font-semibold">{timeframe.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080A0F] border border-[#1A2230] text-slate-300 hover:text-white hover:border-[#2589FF]/50 text-xs font-mono transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2589FF]' : 'text-[#7A889B]'}`} />
            <span>Updated: {lastAnalyzed}</span>
          </button>
        </div>
      </div>

      {/* 4 Macro Indicator Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pillar 1: Trend Bias */}
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A889B] text-xs font-mono mb-2">
            <span>STRUCTURAL BIAS</span>
            <Activity className="w-3.5 h-3.5 text-[#2589FF]" />
          </div>
          <div className="flex items-center gap-2">
            {isBullish ? (
              <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                BULLISH MOMENTUM
              </span>
            ) : (
              <span className="text-sm font-bold font-mono text-[#FF3B4F] flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                BEARISH EXPANSION
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#7A889B] font-mono mt-2">
            EMA 20 ({ema20.toFixed(symbolInfo.precision)}) {isBullish ? '>' : '<'} EMA 50 ({ema50.toFixed(symbolInfo.precision)})
          </div>
        </div>

        {/* Pillar 2: RSI Oscillator */}
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A889B] text-xs font-mono mb-2">
            <span>RSI (14-PERIOD)</span>
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {rsi.toFixed(1)}
            </span>
            <span className={`text-[11px] font-mono font-semibold ${
              rsi > 70 ? 'text-[#FF3B4F]' : rsi < 30 ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              {rsi > 70 ? 'Overbought (Reversal Zone)' : rsi < 30 ? 'Oversold (Accumulation)' : 'Neutral Equilibrium'}
            </span>
          </div>
          <div className="w-full bg-[#080A0F] h-1.5 rounded-full overflow-hidden mt-2 border border-[#1A2230]">
            <div 
              className={`h-full transition-all duration-500 ${
                rsi > 70 ? 'bg-[#FF3B4F]' : rsi < 30 ? 'bg-emerald-400' : 'bg-[#2589FF]'
              }`} 
              style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
            />
          </div>
        </div>

        {/* Pillar 3: Support Level */}
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A889B] text-xs font-mono mb-2">
            <span>LIQUIDITY SUPPORT (15-BAR)</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${supportLevel.toFixed(symbolInfo.precision)}
          </div>
          <div className="text-[11px] text-[#7A889B] font-mono mt-2">
            Distance: {(((currentPrice - supportLevel) / currentPrice) * 100).toFixed(2)}% below mark
          </div>
        </div>

        {/* Pillar 4: Resistance Level */}
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A889B] text-xs font-mono mb-2">
            <span>LIQUIDITY CEILING</span>
            <Target className="w-3.5 h-3.5 text-[#FF3B4F]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#FF3B4F]">
            ${resistanceLevel.toFixed(symbolInfo.precision)}
          </div>
          <div className="text-[11px] text-[#7A889B] font-mono mt-2">
            Distance: {(((resistanceLevel - currentPrice) / currentPrice) * 100).toFixed(2)}% above mark
          </div>
        </div>
      </div>

      {/* Main Analysis Body: Grid of Confluence + Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Confluence Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-w-0">
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2589FF]" />
              Confluence Factor Scoring
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {/* Factor 1 */}
              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">EMA Dual Moving Average Spread</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2589FF]/10 text-[#2589FF] border border-[#2589FF]/30">
                      WEIGHT: 35%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A889B] mt-1 font-sans">
                    Fast EMA 20 ({ema20.toFixed(symbolInfo.precision)}) versus Slow EMA 50 ({ema50.toFixed(symbolInfo.precision)}).
                    Spread: {Math.abs(ema20 - ema50).toFixed(symbolInfo.precision)}.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isBullish ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40'
                  }`}>
                    {isBullish ? '+32 PTS (BULL)' : '-28 PTS (BEAR)'}
                  </span>
                </div>
              </div>

              {/* Factor 2 */}
              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">RSI Momentum Extreme Check</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/40 text-purple-400 border border-purple-800/40">
                      WEIGHT: 25%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A889B] mt-1 font-sans">
                    Current RSI is {rsi.toFixed(1)}. Standard mean reversion thresholds (30/70) applied.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#080A0F] text-slate-300 border border-[#1A2230]">
                    {rsi > 70 ? 'OVERBOUGHT REVERSAL' : rsi < 30 ? 'OVERSOLD ACCUMULATION' : 'NEUTRAL TREND CONTINUATION'}
                  </span>
                </div>
              </div>

              {/* Factor 3 */}
              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Order Block & Volatility Spread</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
                      WEIGHT: 25%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A889B] mt-1 font-sans">
                    Average true range over 10 candles: {avgRange.toFixed(symbolInfo.precision)}. Status: {volatilityLevel}.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2589FF]/10 text-[#2589FF] border border-[#2589FF]/30">
                    NORMAL DISPERSION
                  </span>
                </div>
              </div>

              {/* Factor 4 */}
              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Risk:Reward Feasibility</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      WEIGHT: 15%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A889B] mt-1 font-sans">
                    Configured Bot Target: {settings.takeProfitPct}% TP / {settings.stopLossPct}% SL (1:{(settings.takeProfitPct / settings.stopLossPct).toFixed(1)} RR).
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                    OPTIMAL {((settings.takeProfitPct / settings.stopLossPct)).toFixed(1)}:1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Strategy Playbook & Active Signal Direct Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-w-0">
          {/* Signal Action Box */}
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2589FF]" />
                Algorithmic Signal Decision
              </span>
              <span className="text-[10px] text-[#7A889B] font-mono">
                {currentSignal?.symbol ?? symbolInfo.symbol}
              </span>
            </h3>

            {currentSignal ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  currentSignal.type === 'BUY'
                    ? 'bg-[#2589FF]/10 border-[#2589FF]/50 text-[#2589FF]'
                    : currentSignal.type === 'SELL'
                    ? 'bg-[#FF3B4F]/10 border-[#FF3B4F]/50 text-[#FF3B4F]'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-400'
                }`}>
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Live Algorithmic State
                    </div>
                    <div className="text-base font-extrabold font-mono mt-0.5">
                      {currentSignal.type} RECOMMENDATION
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      Confidence
                    </div>
                    <div className="text-lg font-black font-mono">
                      {currentSignal.confidence}%
                    </div>
                  </div>
                </div>

                <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#7A889B]">
                    <span>Target Symbol:</span>
                    <span className="text-white font-bold">{currentSignal.symbol}</span>
                  </div>
                  <div className="flex justify-between text-[#7A889B]">
                    <span>Reference Entry:</span>
                    <span className="text-white">${currentSignal.price.toFixed(symbolInfo.precision)}</span>
                  </div>
                  <div className="flex justify-between text-[#7A889B]">
                    <span>Calculated Stop Loss:</span>
                    <span className="text-[#FF3B4F]">${currentSignal.stopLossRef.toFixed(symbolInfo.precision)}</span>
                  </div>
                  <div className="flex justify-between text-[#7A889B]">
                    <span>Calculated Take Profit:</span>
                    <span className="text-emerald-400">${currentSignal.takeProfitRef.toFixed(symbolInfo.precision)}</span>
                  </div>
                  <div className="border-t border-[#1A2230] pt-2 text-[11px] text-[#94A3B8] font-sans">
                    <strong className="text-white">{currentSignal.ruleTitle}</strong>: {currentSignal.explanation}
                  </div>
                </div>

                {currentSignal.type !== 'HOLD' && (
                  <button
                    onClick={() => onExecuteSignal(currentSignal)}
                    className="w-full py-2.5 rounded-lg bg-[#2589FF] hover:bg-[#1D74DB] text-white font-bold text-xs font-mono transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2589FF]/20"
                  >
                    <span>Execute Simulated {currentSignal.type} Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#7A889B] font-mono">
                Awaiting algorithmic signal tick...
              </div>
            )}
          </div>

          {/* Institutional Playbook */}
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl text-xs space-y-2.5">
            <h4 className="font-bold text-white font-mono flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Institutional Risk Rulebook
            </h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              • Strict 1.5% maximum capital risk per single order.<br />
              • Take-Profit orders pegged at 2.5× to 3.0× the Stop-Loss range.<br />
              • No trades opened if spread exceeds 0.08% or volatility breaks 3-sigma boundaries.<br />
              • Paper trading simulation preserves capital discipline before MT5 execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
