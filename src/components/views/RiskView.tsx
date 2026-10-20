import React, { useState } from 'react';
import { BotRiskSettings, StrategyMode, AccountStats } from '../../types/trading';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  Percent, 
  Cpu, 
  TrendingUp, 
  AlertTriangle,
  Zap
} from 'lucide-react';

interface RiskViewProps {
  settings: BotRiskSettings;
  onUpdateSettings: (newSettings: BotRiskSettings) => void;
  onResetAccount: () => void;
  stats: AccountStats;
}

export const RiskView: React.FC<RiskViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAccount,
  stats,
}) => {
  const [formData, setFormData] = useState<BotRiskSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const rrRatio = (formData.takeProfitPct / formData.stopLossPct).toFixed(1);

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                RISK MANAGEMENT & SAFEGUARD ENGINE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2589FF]/10 text-[#2589FF] border border-[#2589FF]/30 font-semibold">
                TIER 1 PROTOCOLS
              </span>
            </div>
            <p className="text-xs text-[#7A889B] truncate mt-0.5">
              Capital preservation rules • Maximum drawdown prevention • Execution parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs">
          <button
            onClick={onResetAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080A0F] border border-[#1A2230] text-slate-300 hover:text-white hover:border-[#2589FF]/50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Reset Demo Account ($50k)</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Risk Management parameters successfully applied to live simulation!</span>
        </div>
      )}

      {/* Main Grid: Settings Form (8 cols) + Risk Analysis Visualizer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <form onSubmit={handleSave} className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase flex items-center gap-2 border-b border-[#1A2230] pb-2.5">
              <Sliders className="w-4 h-4 text-[#2589FF]" />
              Execution & Exposure Parameters
            </h3>

            {/* Slider 1: Risk Per Trade */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-semibold">Risk Per Simulated Trade:</span>
                <span className="text-[#2589FF] font-bold text-sm">{formData.riskPerTradePct}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={formData.riskPerTradePct}
                onChange={e => setFormData(s => ({ ...s, riskPerTradePct: parseFloat(e.target.value) }))}
                className="w-full accent-[#2589FF] cursor-pointer"
              />
              <span className="text-[11px] text-[#7A889B] block">
                Percentage of free account equity risked on each position based on stop-loss distance.
              </span>
            </div>

            {/* Slider 2: Stop Loss */}
            <div className="space-y-1.5 pt-2 border-t border-[#1A2230]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-semibold">Stop Loss Distance:</span>
                <span className="text-[#FF3B4F] font-bold text-sm">{formData.stopLossPct}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="5.0"
                step="0.1"
                value={formData.stopLossPct}
                onChange={e => setFormData(s => ({ ...s, stopLossPct: parseFloat(e.target.value) }))}
                className="w-full accent-[#FF3B4F] cursor-pointer"
              />
              <span className="text-[11px] text-[#7A889B] block">
                Automatic stop-loss liquidation distance below market entry price.
              </span>
            </div>

            {/* Slider 3: Take Profit */}
            <div className="space-y-1.5 pt-2 border-t border-[#1A2230]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-semibold">Take Profit Target:</span>
                <span className="text-emerald-400 font-bold text-sm">{formData.takeProfitPct}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.2"
                value={formData.takeProfitPct}
                onChange={e => setFormData(s => ({ ...s, takeProfitPct: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-[#7A889B] block">
                Target liquidation level for locking in simulated trade profits.
              </span>
            </div>

            {/* Strategy Selection */}
            <div className="pt-2 border-t border-[#1A2230] space-y-1.5">
              <label className="text-xs font-mono font-semibold text-white block">
                Algorithmic Strategy Model:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'multi_factor_ai' as StrategyMode, label: 'Multi-Factor AI Confluence', desc: 'EMA 20/50 + RSI + Volume spread' },
                  { id: 'trend_following' as StrategyMode, label: 'Trend Following Model', desc: 'Moving average structural breakout' },
                  { id: 'mean_reversion' as StrategyMode, label: 'Mean Reversion Model', desc: 'RSI overbought/oversold bouncing' },
                  { id: 'breakout' as StrategyMode, label: 'Volatility Range Breakout', desc: 'Key support & resistance expansion' },
                ].map(strat => (
                  <button
                    key={strat.id}
                    type="button"
                    onClick={() => setFormData(s => ({ ...s, strategy: strat.id }))}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      formData.strategy === strat.id
                        ? 'bg-[#2589FF]/15 border-[#2589FF]/60 text-white'
                        : 'bg-[#080A0F] border-[#1A2230] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono">{strat.label}</div>
                    <div className="text-[10px] text-[#7A889B] mt-0.5">{strat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Execution Toggles */}
            <div className="pt-2 border-t border-[#1A2230] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#080A0F] border border-[#1A2230] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoExecute}
                  onChange={e => setFormData(s => ({ ...s, autoExecute: e.target.checked }))}
                  className="accent-[#2589FF] rounded w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Auto-Execute Signals</span>
                  <span className="text-[10px] text-[#7A889B]">Automatically open trades when BUY/SELL triggers</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#080A0F] border border-[#1A2230] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trailingStop}
                  onChange={e => setFormData(s => ({ ...s, trailingStop: e.target.checked }))}
                  className="accent-[#2589FF] rounded w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Trailing Stop Protection</span>
                  <span className="text-[10px] text-[#7A889B]">Trail stop loss level as trade moves into profit</span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2589FF] hover:bg-[#1D74DB] text-white font-mono font-bold text-xs transition cursor-pointer shadow-lg shadow-[#2589FF]/20"
            >
              Apply Risk Management Settings
            </button>
          </div>
        </form>

        {/* Right: Risk/Reward Metric & Institutional Standards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-w-0">
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2589FF]" />
              Risk / Reward Ratio
            </h3>

            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-4 text-center">
              <div className="text-[11px] text-[#7A889B] font-mono uppercase">Calculated Ratio</div>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                1 : {rrRatio}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">
                Risking {formData.stopLossPct}% to gain {formData.takeProfitPct}%
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1A2230] text-[#7A889B]">
                <span>Breakeven Win Rate:</span>
                <span className="text-white font-bold">
                  {((formData.stopLossPct / (formData.stopLossPct + formData.takeProfitPct)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A2230] text-[#7A889B]">
                <span>Max Concurrent Trades:</span>
                <span className="text-white font-bold">{formData.maxConcurrentTrades}</span>
              </div>
              <div className="flex justify-between py-1 text-[#7A889B]">
                <span>Current Account Margin:</span>
                <span className="text-emerald-400 font-bold">{stats.marginLevelPct}%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl text-xs space-y-2">
            <h4 className="font-bold text-white font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Institutional Drawdown Safeguard
            </h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Salahuddin AI enforces automated position sizing so that no single simulated trade can exceed {formData.riskPerTradePct}% of equity. Even during consecutive market shocks, the account preserves runway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
