import React, { useState } from 'react';
import { BotRiskSettings, StrategyMode } from '../types/trading';
import { X, ShieldAlert, Sliders, Check, RotateCcw } from 'lucide-react';

interface RiskSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BotRiskSettings;
  onSaveSettings: (settings: BotRiskSettings) => void;
  onResetAccount: () => void;
}

export const RiskSettingsModal: React.FC<RiskSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAccount,
}) => {
  const [localSettings, setLocalSettings] = useState<BotRiskSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const riskRewardRatio = (localSettings.takeProfitPct / localSettings.stopLossPct).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none font-sans">
      <div className="bg-[#11151D] border border-[#1A2230] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A2230] bg-[#0E1420]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#080A0F] border border-[#2589FF]/40 rounded-lg text-[#2589FF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide font-mono">
                RISK MANAGEMENT & ALGORITHM GUARDRAILS
              </h3>
              <p className="text-[11px] text-[#7A889B]">
                Configure simulated execution guardrails and risk limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A889B] hover:text-white hover:bg-[#1A2230] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Strategy Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-white mb-1.5 uppercase font-mono tracking-wider">
              Strategy Algorithm
            </label>
            <select
              value={localSettings.strategy}
              onChange={e => setLocalSettings({ ...localSettings, strategy: e.target.value as StrategyMode })}
              className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-[#2589FF] focus:outline-none"
            >
              <option value="multi_factor_ai" className="bg-[#11151D]">AI Multi-Factor Confluence (EMA + RSI + Price Action)</option>
              <option value="ema_crossover" className="bg-[#11151D]">EMA 20 / EMA 50 Golden & Death Cross</option>
              <option value="rsi_mean_reversion" className="bg-[#11151D]">RSI 14 Mean Reversion (30/70 Overbought/Oversold)</option>
              <option value="breakout_momentum" className="bg-[#11151D]">20-Period High/Low Breakout Momentum</option>
            </select>
          </div>

          {/* Risk per trade percentage */}
          <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-white font-semibold">
                Risk Per Trade (% of Account Equity)
              </label>
              <span className="font-mono font-bold text-[#2589FF] bg-[#11151D] px-2 py-0.5 rounded border border-[#1A2230]">
                {localSettings.riskPerTradePct}%
              </span>
            </div>
            <p className="text-[11px] text-[#7A889B] mb-2">
              Determines position size sizing formula based on demo balance and stop loss distance.
            </p>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={localSettings.riskPerTradePct}
              onChange={e => setLocalSettings({ ...localSettings, riskPerTradePct: parseFloat(e.target.value) })}
              className="w-full accent-[#2589FF] h-1.5 bg-[#11151D] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#7A889B] font-mono mt-1">
              <span>0.5% (Conservative)</span>
              <span>2.5% (Balanced)</span>
              <span>5.0% (Aggressive)</span>
            </div>
          </div>

          {/* Stop Loss & Take Profit Dual Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Stop Loss */}
            <div className="bg-[#080A0F] border border-[#FF3B4F]/30 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#FF3B4F] font-semibold">Stop Loss (% distance)</label>
                <span className="font-mono font-bold text-[#FF3B4F] bg-[#11151D] px-2 py-0.5 rounded border border-[#FF3B4F]/40">
                  {localSettings.stopLossPct}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={localSettings.stopLossPct}
                onChange={e => setLocalSettings({ ...localSettings, stopLossPct: parseFloat(e.target.value) })}
                className="w-full accent-[#FF3B4F] h-1.5 bg-[#11151D] rounded-lg cursor-pointer my-2"
              />
              <p className="text-[10px] text-[#7A889B]">
                Auto-liquidates simulated trade if price moves adversely against entry.
              </p>
            </div>

            {/* Take Profit */}
            <div className="bg-[#080A0F] border border-emerald-500/30 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-emerald-400 font-semibold">Take Profit (% target)</label>
                <span className="font-mono font-bold text-emerald-400 bg-[#11151D] px-2 py-0.5 rounded border border-emerald-500/40">
                  {localSettings.takeProfitPct}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.2"
                value={localSettings.takeProfitPct}
                onChange={e => setLocalSettings({ ...localSettings, takeProfitPct: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 h-1.5 bg-[#11151D] rounded-lg cursor-pointer my-2"
              />
              <p className="text-[10px] text-[#7A889B]">
                Target reward-to-risk ratio: <strong>1:{riskRewardRatio}</strong>
              </p>
            </div>
          </div>

          {/* Simulation Speed & Concurrent Trades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white mb-1.5 uppercase font-mono tracking-wider">
                Simulation Tick Frequency
              </label>
              <select
                value={localSettings.simulationSpeed}
                onChange={e => setLocalSettings({ ...localSettings, simulationSpeed: e.target.value as any })}
                className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-[#2589FF] focus:outline-none"
              >
                <option value="slow">Relaxed (1 tick / 2.5s)</option>
                <option value="normal">Standard (1 tick / 1.0s)</option>
                <option value="fast">High-Velocity (1 tick / 380ms)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white mb-1.5 uppercase font-mono tracking-wider">
                Max Concurrent Trades
              </label>
              <select
                value={localSettings.maxConcurrentTrades}
                onChange={e => setLocalSettings({ ...localSettings, maxConcurrentTrades: parseInt(e.target.value) })}
                className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-[#2589FF] focus:outline-none"
              >
                <option value={1}>1 Position Max (Strict Risk)</option>
                <option value={3}>3 Positions (Balanced)</option>
                <option value={5}>5 Positions (Portfolio Spread)</option>
              </select>
            </div>
          </div>

          {/* Auto-execution toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#080A0F] border border-[#1A2230] rounded-xl">
            <div>
              <div className="text-xs font-semibold text-white">Automate Simulated Orders</div>
              <div className="text-[11px] text-[#7A889B]">
                Automatically triggers paper-trading orders whenever high-confidence (≥70%) signals occur.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLocalSettings({ ...localSettings, autoExecute: !localSettings.autoExecute })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                localSettings.autoExecute ? 'bg-[#2589FF]' : 'bg-[#1A2230]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  localSettings.autoExecute ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Account Reset Action */}
          <div className="flex items-center justify-between p-3.5 bg-[#FF3B4F]/5 border border-[#FF3B4F]/20 rounded-xl">
            <div>
              <div className="text-xs font-semibold text-white">Reset Simulated Balance</div>
              <div className="text-[11px] text-[#7A889B]">
                Restores demo balance to $50,000 and purges open paper positions.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetAccount();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF3B4F]/10 hover:bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/30 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Balance</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[#1A2230] bg-[#0E1420]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#7A889B] hover:text-white hover:bg-[#1A2230] rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#2589FF] hover:bg-[#1D74DB] rounded-lg shadow-sm shadow-[#2589FF]/20 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Guardrails</span>
          </button>
        </div>
      </div>
    </div>
  );
};
