import React, { useState } from 'react';
import { ClientUser } from '../../types/auth';
import { ConnectionStatus, IndicatorSettings, BotRiskSettings } from '../../types/trading';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Lock, 
  Wifi, 
  Sliders, 
  Bell, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  SlidersHorizontal,
  KeyRound
} from 'lucide-react';

interface SettingsViewProps {
  clientUser: ClientUser | null;
  connectionStatus: ConnectionStatus;
  onChangeConnectionStatus: (status: ConnectionStatus) => void;
  indicators: IndicatorSettings;
  onToggleIndicator: (key: keyof IndicatorSettings) => void;
  riskSettings: BotRiskSettings;
  onUpdateRiskSettings: (settings: BotRiskSettings) => void;
  onLogout: () => void;
  onResetAccount: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  clientUser,
  connectionStatus,
  onChangeConnectionStatus,
  indicators,
  onToggleIndicator,
  riskSettings,
  onUpdateRiskSettings,
  onLogout,
  onResetAccount,
}) => {
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(riskSettings.simulationSpeed || 'normal');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveSettings = () => {
    onUpdateRiskSettings({
      ...riskSettings,
      simulationSpeed: speed,
    });
    setSuccessMsg('Terminal preferences successfully saved!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF] shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                TERMINAL SETTINGS & CLIENT CONFIGURATION
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2589FF]/10 text-[#2589FF] border border-[#2589FF]/30 font-semibold">
                SYSTEM CONFIG
              </span>
            </div>
            <p className="text-xs text-[#7A889B] truncate mt-0.5">
              Workstation preferences, data engine parameters, and authorized client credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3B4F]/10 hover:bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/40 font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Left Column: Client Credentials & Terminal Preferences (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-w-0">
          
          {/* Client Authentication Card */}
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center gap-2 border-b border-[#1A2230] pb-2.5">
              <User className="w-4 h-4 text-[#2589FF]" />
              Authorized Client Profile
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#7A889B] text-[10px] block">CLIENT NAME</span>
                  <span className="text-white font-bold">{clientUser?.name ?? 'Salahuddin'}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  VERIFIED CLIENT
                </span>
              </div>

              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#7A889B] text-[10px] block">AUTHORIZED EMAIL</span>
                  <span className="text-slate-200">{clientUser?.email ?? 'salahuddin@client.terminal'}</span>
                </div>
                <span className="text-[#7A889B] text-[10px]">Tier 1 Institutional</span>
              </div>

              <div className="bg-[#080A0F] border border-[#1A2230] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#7A889B] text-[10px] block">ACCESS TOKEN ID</span>
                  <span className="text-[#2589FF] text-[11px] truncate max-w-[240px]">
                    {clientUser?.token ?? 'salahuddin-institutional-bearer-token'}
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Data Engine & Simulation Speed */}
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center gap-2 border-b border-[#1A2230] pb-2.5">
              <Wifi className="w-4 h-4 text-[#2589FF]" />
              Data Engine & Tick Frequency
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#94A3B8] block mb-1">Market Simulation Speed:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'slow', label: 'Slow (3000ms)' },
                    { id: 'normal', label: 'Normal (1800ms)' },
                    { id: 'fast', label: 'Fast (900ms)' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSpeed(s.id as any)}
                      className={`py-2 rounded-lg border text-center transition cursor-pointer ${
                        speed === s.id
                          ? 'bg-[#2589FF]/20 border-[#2589FF] text-white font-bold'
                          : 'bg-[#080A0F] border-[#1A2230] text-[#7A889B] hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Connection Feed Mode:</label>
                <select
                  value={connectionStatus}
                  onChange={e => onChangeConnectionStatus(e.target.value as ConnectionStatus)}
                  className="w-full bg-[#080A0F] border border-[#1A2230] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#2589FF]"
                >
                  <option value="demo">High-Resolution Simulated Feed (Deterministic)</option>
                  <option value="connected">Connected Mode (Simulated Real-Time)</option>
                  <option value="disconnected">Offline / Pause Tick Execution</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full py-2.5 rounded-lg bg-[#2589FF] hover:bg-[#1D74DB] text-white font-bold transition cursor-pointer mt-2"
              >
                Save Engine Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Indicator Toggles & Account Maintenance (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-w-0">
          
          {/* Chart Overlays */}
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center gap-2 border-b border-[#1A2230] pb-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[#2589FF]" />
              Default Technical Overlays
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2230] cursor-pointer">
                <div>
                  <span className="text-white font-bold block">Exponential MA (20)</span>
                  <span className="text-[10px] text-[#7A889B]">Electric Blue short-term dynamic trend</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showEma20}
                  onChange={() => onToggleIndicator('showEma20')}
                  className="accent-[#2589FF] rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2230] cursor-pointer">
                <div>
                  <span className="text-white font-bold block">Exponential MA (50)</span>
                  <span className="text-[10px] text-[#7A889B]">Amber macro structural baseline</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showEma50}
                  onChange={() => onToggleIndicator('showEma50')}
                  className="accent-amber-500 rounded w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2230] cursor-pointer">
                <div>
                  <span className="text-white font-bold block">RSI Oscillator (14)</span>
                  <span className="text-[10px] text-[#7A889B]">Bottom momentum sub-panel (30/70)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showRsi}
                  onChange={() => onToggleIndicator('showRsi')}
                  className="accent-purple-500 rounded w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Account Reset & Maintenance */}
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl space-y-3 text-xs">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase flex items-center gap-2 border-b border-[#1A2230] pb-2.5">
              <RotateCcw className="w-4 h-4 text-[#FF3B4F]" />
              Account Maintenance
            </h3>

            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Reset simulated account balance to the default initial $50,000.00 and wipe current paper positions.
            </p>

            <button
              type="button"
              onClick={onResetAccount}
              className="w-full py-2.5 rounded-lg bg-[#080A0F] hover:bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40 font-mono font-bold transition cursor-pointer"
            >
              Reset Simulation to $50,000
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
