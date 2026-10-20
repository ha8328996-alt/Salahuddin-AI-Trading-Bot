import React from 'react';
import { TradingSignal, BotRiskSettings, StrategyMode } from '../types/trading';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  MinusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Bot,
  BrainCircuit,
  Compass
} from 'lucide-react';

interface SignalRadarPanelProps {
  currentSignal: TradingSignal | null;
  settings: BotRiskSettings;
  onUpdateSettings: (newSettings: Partial<BotRiskSettings>) => void;
  onExecuteSignal: (signal: TradingSignal) => void;
  isSimRunning: boolean;
}

export const SignalRadarPanel: React.FC<SignalRadarPanelProps> = ({
  currentSignal,
  settings,
  onUpdateSettings,
  onExecuteSignal,
  isSimRunning,
}) => {
  const signalType = currentSignal?.type || 'HOLD';

  const badgeConfig = {
    BUY: {
      bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400',
      pill: 'bg-emerald-500 text-slate-950',
      icon: TrendingUp,
      title: 'BULLISH BUY SIGNAL',
      glow: 'shadow-emerald-900/30',
      barColor: 'bg-emerald-500',
    },
    SELL: {
      bg: 'bg-rose-950/70 border-rose-500/50 text-rose-400',
      pill: 'bg-rose-500 text-white',
      icon: TrendingDown,
      title: 'BEARISH SELL SIGNAL',
      glow: 'shadow-rose-900/30',
      barColor: 'bg-rose-500',
    },
    HOLD: {
      bg: 'bg-amber-950/50 border-amber-500/40 text-amber-300',
      pill: 'bg-amber-500 text-slate-950',
      icon: MinusCircle,
      title: 'NEUTRAL HOLD (CAPITAL PRESERVATION)',
      glow: 'shadow-amber-900/20',
      barColor: 'bg-amber-500',
    },
  }[signalType];

  const IconComponent = badgeConfig.icon;

  const strategies: { id: StrategyMode; label: string; desc: string }[] = [
    {
      id: 'multi_factor_ai',
      label: 'AI Multi-Factor Confluence',
      desc: 'Blends EMA trend, RSI momentum & candle rejection',
    },
    {
      id: 'ema_crossover',
      label: 'EMA 20/50 Crossover',
      desc: 'Golden/Death Cross trend-following model',
    },
    {
      id: 'rsi_mean_reversion',
      label: 'RSI Mean Reversion',
      desc: 'Exhaustion & bounce at 30/70 extremes',
    },
    {
      id: 'breakout_momentum',
      label: 'Breakout Momentum',
      desc: '20-bar channel high/low expansion triggers',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Current Active Signal Card */}
      <div className={`rounded-xl border p-3.5 backdrop-blur-md shadow-xl transition-all ${badgeConfig.bg} ${badgeConfig.glow}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300">
              Real-Time Signal Radar
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
            {currentSignal ? new Date(currentSignal.timestamp).toLocaleTimeString() : '--:--'}
          </span>
        </div>

        {/* Signal Banner */}
        <div className="flex items-center justify-between mt-1 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${badgeConfig.pill} shadow-md`}>
              <IconComponent className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wide font-mono flex items-center gap-2">
                <span>{signalType}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-slate-200 border border-slate-700 font-medium">
                  {currentSignal?.confidence ?? 50}% Confidence
                </span>
              </div>
              <div className="text-xs font-medium text-slate-300">
                {currentSignal?.ruleTitle || 'Evaluating price action...'}
              </div>
            </div>
          </div>

          {/* Execute Button if signal is actionable and manual paper trading is used */}
          {signalType !== 'HOLD' && currentSignal && (
            <button
              onClick={() => onExecuteSignal(currentSignal)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition active:scale-95 flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Simulate {signalType}</span>
            </button>
          )}
        </div>

        {/* Confidence Meter Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Model Conviction</span>
            <span className="font-bold text-slate-200">{currentSignal?.confidence ?? 50}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${badgeConfig.barColor}`}
              style={{ width: `${currentSignal?.confidence ?? 50}%` }}
            />
          </div>
        </div>

        {/* Transparent Rule Explanations */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transparent Rule Rationale:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-300">
            {currentSignal?.reasoning.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-cyan-400 select-none mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategy Engine Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              Active Strategy Engine
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {strategies.find(s => s.id === settings.strategy)?.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {strategies.map(s => {
            const isSelected = settings.strategy === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onUpdateSettings({ strategy: s.id })}
                className={`text-left p-2 rounded-lg border transition ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold leading-tight">{s.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Risk & Execution Summary Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg font-mono-numbers text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-slate-200">Execution & Risk Guardrails</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${settings.autoExecute ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
            {settings.autoExecute ? 'AUTO-PILOT ON' : 'MANUAL CONFIRM'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Risk / Trade</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{settings.riskPerTradePct}%</div>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-rose-400">Stop Loss</div>
            <div className="text-xs font-bold text-rose-300 mt-0.5">-{settings.stopLossPct}%</div>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-emerald-400">Take Profit</div>
            <div className="text-xs font-bold text-emerald-300 mt-0.5">+{settings.takeProfitPct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
