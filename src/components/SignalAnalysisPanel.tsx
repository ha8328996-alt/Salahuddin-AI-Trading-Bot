import React from 'react';
import { TradingSignal, BotRiskSettings } from '../types/trading';
import { 
  TrendingUp, 
  TrendingDown, 
  MinusCircle, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Sparkles, 
  Target, 
  ShieldAlert,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface SignalAnalysisPanelProps {
  currentSignal: TradingSignal | null;
  settings: BotRiskSettings;
  onExecuteSignal: (signal: TradingSignal) => void;
}

export const SignalAnalysisPanel: React.FC<SignalAnalysisPanelProps> = ({
  currentSignal,
  settings,
  onExecuteSignal,
}) => {
  const signalType = currentSignal?.type || 'HOLD';

  const badgeConfig = {
    BUY: {
      border: 'border-[#2589FF]/60',
      bg: 'bg-[#2589FF]/10',
      tagBg: 'bg-[#2589FF] text-white font-bold',
      textColor: 'text-[#2589FF]',
      icon: TrendingUp,
      title: 'BULLISH BUY SETUP',
      barColor: 'bg-[#2589FF]',
    },
    SELL: {
      border: 'border-[#FF3B4F]/60',
      bg: 'bg-[#FF3B4F]/10',
      tagBg: 'bg-[#FF3B4F] text-white font-bold',
      textColor: 'text-[#FF3B4F]',
      icon: TrendingDown,
      title: 'BEARISH SELL SETUP',
      barColor: 'bg-[#FF3B4F]',
    },
    HOLD: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      tagBg: 'bg-amber-500 text-slate-950 font-bold',
      textColor: 'text-amber-400',
      icon: MinusCircle,
      title: 'NEUTRAL HOLD (CAPITAL PRESERVATION)',
      barColor: 'bg-amber-500',
    },
  }[signalType];

  const IconComponent = badgeConfig.icon;

  const rrRatio = currentSignal && Math.abs(currentSignal.price - currentSignal.stopLossRef) > 0
    ? (Math.abs(currentSignal.takeProfitRef - currentSignal.price) / Math.abs(currentSignal.price - currentSignal.stopLossRef)).toFixed(1)
    : '2.5';

  return (
    <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-2xl flex flex-col gap-3.5 font-sans select-none min-w-0 w-full">
      
      {/* Header: Origin distinction & Symbol Timeframe */}
      <div className="flex items-center justify-between border-b border-[#1A2230] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono tracking-wide">
              AI SIGNAL ENGINE
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-[#7A889B] font-mono">
              <span className="text-[#2589FF]">Confluence Model</span>
              <span>•</span>
              <span className="text-slate-300">{currentSignal?.symbol ?? '--'} ({currentSignal?.timeframe ?? '--'})</span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080A0F] border border-[#1A2230] text-[#7A889B]">
          {currentSignal ? new Date(currentSignal.timestamp).toLocaleTimeString() : '--:--'}
        </span>
      </div>

      {/* Main Signal Banner */}
      <div className={`rounded-xl border p-3.5 ${badgeConfig.bg} ${badgeConfig.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${badgeConfig.tagBg} shadow-sm`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-mono tracking-wide text-white">{signalType}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#080A0F] text-[#2589FF] font-mono border border-[#1A2230] font-semibold">
                  Score: {currentSignal?.confidence ?? 50}%
                </span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
                {currentSignal?.ruleTitle || 'Scanning real-time ticks...'}
              </div>
            </div>
          </div>

          {signalType !== 'HOLD' && currentSignal && (
            <button
              onClick={() => onExecuteSignal(currentSignal)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-lg ${
                signalType === 'BUY'
                  ? 'bg-[#2589FF] hover:bg-[#1D74DB] shadow-[#2589FF]/20'
                  : 'bg-[#FF3B4F] hover:bg-[#E02E41] shadow-[#FF3B4F]/20'
              }`}
            >
              Simulate {signalType}
            </button>
          )}
        </div>

        {/* Model Confluence Score Meter */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-mono text-[#7A889B] mb-1">
            <span>Algorithmic Confluence Rating</span>
            <span className="text-white font-bold">{currentSignal?.confidence ?? 50}% / 100%</span>
          </div>
          <div className="w-full bg-[#080A0F] rounded-full h-1.5 overflow-hidden border border-[#1A2230]">
            <div
              className={`h-full transition-all duration-300 ${badgeConfig.barColor}`}
              style={{ width: `${currentSignal?.confidence ?? 50}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reference Levels: Entry, Stop-Loss, Take-Profit */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono-numbers text-xs">
        <div className="bg-[#080A0F] p-2.5 rounded-lg border border-[#1A2230]">
          <div className="text-[10px] text-[#7A889B] uppercase font-mono tracking-wider">Entry Ref</div>
          <div className="text-xs font-bold text-white mt-0.5">
            {currentSignal?.price ? currentSignal.price.toFixed(2) : '--'}
          </div>
        </div>
        <div className="bg-[#080A0F] p-2.5 rounded-lg border border-[#FF3B4F]/30">
          <div className="text-[10px] text-[#FF3B4F] uppercase font-mono tracking-wider">Stop-Loss</div>
          <div className="text-xs font-bold text-[#FF3B4F] mt-0.5">
            {currentSignal?.stopLossRef ? currentSignal.stopLossRef.toFixed(2) : '--'}
          </div>
        </div>
        <div className="bg-[#080A0F] p-2.5 rounded-lg border border-emerald-500/30">
          <div className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">Take-Profit</div>
          <div className="text-xs font-bold text-emerald-400 mt-0.5">
            {currentSignal?.takeProfitRef ? currentSignal.takeProfitRef.toFixed(2) : '--'}
          </div>
        </div>
      </div>

      {/* Rules Actually Evaluated (Clean Institutional Table) */}
      <div className="bg-[#080A0F] border border-[#1A2230] rounded-lg p-3">
        <div className="text-[11px] font-semibold text-slate-200 mb-2 flex items-center justify-between font-mono">
          <span>Evaluated Indicator Matrix:</span>
          <span className="text-[10px] text-[#7A889B]">Target R:R 1:{rrRatio}</span>
        </div>

        <div className="space-y-2 text-[11px]">
          {/* EMA Trend */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2230]">
            <span className="text-[#94A3B8]">EMA Trend (20 vs 50):</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                currentSignal?.indicatorsSnapshot.trend === 'BULLISH'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : currentSignal?.indicatorsSnapshot.trend === 'BEARISH'
                  ? 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40'
                  : 'bg-[#1A2230] text-[#7A889B]'
              }`}>
                {currentSignal?.indicatorsSnapshot.trend ?? 'NEUTRAL'}
              </span>
              <span className="text-[10px] text-[#7A889B]">
                ({currentSignal?.indicatorsSnapshot.ema20.toFixed(2)} / {currentSignal?.indicatorsSnapshot.ema50.toFixed(2)})
              </span>
            </div>
          </div>

          {/* RSI Reading */}
          <div className="flex items-center justify-between py-1 border-b border-[#1A2230]">
            <span className="text-[#94A3B8]">RSI (14) Momentum:</span>
            <span className="font-mono text-white">
              {currentSignal?.indicatorsSnapshot.rsi.toFixed(1) ?? '--'}
              <span className="text-[10px] text-[#7A889B] ml-1">
                {(currentSignal?.indicatorsSnapshot.rsi ?? 50) > 68 ? '(Overbought)' :
                 (currentSignal?.indicatorsSnapshot.rsi ?? 50) < 32 ? '(Oversold)' : '(Neutral Zone)'}
              </span>
            </span>
          </div>

          {/* Rule Breakdown List */}
          {currentSignal?.rulesEvaluated.map((rule, idx) => (
            <div key={idx} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[210px]">
                {rule.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2589FF] shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#7A889B] shrink-0" />
                )}
                <span className="truncate">{rule.name}</span>
              </div>
              <span className="font-mono text-[10px] text-[#7A889B] shrink-0">
                {rule.details}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Concise Rule Explanation */}
      <div className="bg-[#080A0F] border border-[#1A2230] rounded-lg p-3 text-[11px] text-[#94A3B8] leading-relaxed">
        <div className="font-semibold text-white mb-1 font-mono text-[10px] uppercase text-[#2589FF]">
          Algorithmic Rationale:
        </div>
        <p>
          {currentSignal?.explanation || 'Signal rules evaluate structural moving average alignment and RSI velocity thresholds.'}
        </p>
      </div>

      {/* Risk Warning Disclaimer */}
      <div className="bg-[#FF3B4F]/5 border border-[#FF3B4F]/30 rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-[#94A3B8]">
        <AlertTriangle className="w-3.5 h-3.5 text-[#FF3B4F] shrink-0 mt-0.5" />
        <span>
          <strong className="text-white">Risk Advisory:</strong> Simulated educational setup for Salahuddin. Real market conditions carry substantial capital risk. Signals demonstrate rule confluence.
        </span>
      </div>

    </div>
  );
};
