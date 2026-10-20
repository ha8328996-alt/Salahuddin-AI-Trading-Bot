import React, { useState, useEffect, useRef } from 'react';
import { AccountStats, ConnectionStatus, MarketType, MarketSymbol, Timeframe, PriceAlert } from '../types/trading';
import { ClientUser } from '../types/auth';
import { 
  Play, 
  Square, 
  Activity, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  Wifi, 
  WifiOff,
  Bell,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Clock,
  Menu
} from 'lucide-react';

interface HeaderBarProps {
  stats: AccountStats;
  isSimRunning: boolean;
  onToggleSim: () => void;
  onResetAccount: () => void;
  openPositionsCount: number;
  selectedMarket: MarketType;
  selectedSymbol: MarketSymbol;
  timeframe: Timeframe;
  connectionStatus: ConnectionStatus;
  onChangeConnectionStatus: (status: ConnectionStatus) => void;
  clientUser: ClientUser | null;
  onLogout: () => void;
  alerts: PriceAlert[];
  onOpenAlertsModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  stats,
  isSimRunning,
  onToggleSim,
  onResetAccount,
  openPositionsCount,
  selectedMarket,
  selectedSymbol,
  timeframe,
  connectionStatus,
  onChangeConnectionStatus,
  clientUser,
  onLogout,
  alerts,
  onOpenAlertsModal,
  onToggleMobileSidebar,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isProfitable = stats.unrealizedPnl >= 0;
  const triggeredAlerts = alerts.filter(a => a.triggered);
  const activeAlerts = alerts.filter(a => !a.triggered);

  const connectionBadge = {
    demo: {
      label: 'Simulated Feed',
      dotColor: 'bg-emerald-400',
      textColor: 'text-emerald-400',
      bgColor: 'bg-[#11151D] border-emerald-500/30',
      icon: Wifi,
    },
    connected: {
      label: 'Demo Connected',
      dotColor: 'bg-[#2589FF]',
      textColor: 'text-[#2589FF]',
      bgColor: 'bg-[#11151D] border-[#2589FF]/30',
      icon: Wifi,
    },
    disconnected: {
      label: 'Disconnected',
      dotColor: 'bg-[#FF3B4F]',
      textColor: 'text-[#FF3B4F]',
      bgColor: 'bg-[#11151D] border-[#FF3B4F]/40',
      icon: WifiOff,
    },
  }[connectionStatus];

  const ConnectionIcon = connectionBadge.icon;

  return (
    <header className="border-b border-[#1A2230] bg-[#11151D] sticky top-0 z-40 px-2.5 sm:px-3 py-2 text-xs select-none min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        
        {/* Top/Left Row: Mobile Hamburger, Brand Logo, Status Badges & Quick Market Indicator */}
        <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-3 flex-wrap min-w-0">
          
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Hamburger Menu Toggle Button */}
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="p-1.5 rounded-lg bg-[#080A0F] border border-[#1A2230] text-[#7A889B] hover:text-white md:hidden cursor-pointer shrink-0 transition"
                aria-label="Toggle Navigation Drawer"
                title="Navigation Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Professional text logo 'SALAHUDDIN AI' */}
            <div className="flex items-center bg-[#080A0F] border border-[#2589FF]/40 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-sm shadow-[#2589FF]/10 shrink-0">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white font-mono">
                SALAHUDDIN
              </span>
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#2589FF] font-mono ml-1 sm:ml-1.5">
                AI
              </span>
            </div>

            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-wide text-slate-100 truncate">
                  Salahuddin Trading Terminal
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#080A0F] text-[#2589FF] font-mono border border-[#1A2230] font-semibold hidden md:inline">
                  CLIENT EDITION
                </span>
              </div>
              <div className="text-[10px] text-[#7A889B] font-mono truncate hidden md:block">
                Salahuddin AI Trading Bot • Quantitative Intelligence
              </div>
            </div>
          </div>

          {/* Quick Market & Timeframe indicator tag */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080A0F] border border-[#1A2230]">
              <span className="text-[#7A889B]">ACTIVE:</span>
              <span className="font-bold text-white">{selectedSymbol.symbol}</span>
              <span className="text-[#2589FF] font-semibold">[{timeframe.toUpperCase()}]</span>
            </div>
          </div>

          {/* Connection Status: Demo / Disconnected / Connected */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono ${connectionBadge.bgColor} ${connectionBadge.textColor}`}>
              <ConnectionIcon className="w-3.5 h-3.5 shrink-0" />
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSimRunning ? connectionBadge.dotColor : 'bg-[#7A889B]'}`} />
              <span className="hidden xs:inline truncate">{connectionBadge.label}</span>
            </div>

            <select
              value={connectionStatus}
              onChange={(e) => onChangeConnectionStatus(e.target.value as ConnectionStatus)}
              className="bg-[#080A0F] border border-[#1A2230] text-[#94A3B8] text-[10px] sm:text-[11px] rounded-lg px-1.5 sm:px-2 py-1 focus:outline-none cursor-pointer hover:border-[#2589FF]/50 transition"
              title="Connection Mode"
            >
              <option value="demo">Demo Feed</option>
              <option value="connected">Connected (Demo)</option>
              <option value="disconnected">Offline / Pause</option>
            </select>
          </div>

          {/* Engine Latency & Clock */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-[#7A889B] shrink-0">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#080A0F] border border-[#1A2230]">
              <Activity className="w-3 h-3 text-[#2589FF]" />
              <span>LATENCY: 14ms</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#080A0F] border border-[#1A2230] text-slate-300">
              {timeStr}
            </span>
          </div>

          {/* Simulation Start / Stop Controls */}
          <button
            onClick={onToggleSim}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-semibold text-xs tracking-wide transition shadow-sm cursor-pointer shrink-0 ${
              isSimRunning
                ? 'bg-[#080A0F] hover:bg-[#1A2230] text-[#FF3B4F] border border-[#FF3B4F]/40'
                : 'bg-[#2589FF] hover:bg-[#1D74DB] text-white shadow-[#2589FF]/20'
            }`}
            title={isSimRunning ? 'Pause Market Simulation' : 'Resume Market Simulation'}
          >
            {isSimRunning ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Portfolio Metrics, Notifications, and Client Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-between lg:justify-end min-w-0">
          
          {/* Quick Account Financials */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] bg-[#080A0F] px-2 sm:px-3 py-1 rounded-lg border border-[#1A2230] shrink-0">
            <div className="flex flex-col">
              <span className="text-[#7A889B] text-[8px] sm:text-[9px] uppercase tracking-wider">Equity</span>
              <span className="font-bold text-white font-mono-numbers">
                ${stats.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-4 sm:h-5 w-px bg-[#1A2230]" />

            <div className="flex flex-col">
              <span className="text-[#7A889B] text-[8px] sm:text-[9px] uppercase tracking-wider">PnL</span>
              <span className={`font-bold font-mono-numbers ${isProfitable ? 'text-emerald-400' : 'text-[#FF3B4F]'}`}>
                {isProfitable ? '+' : ''}${stats.unrealizedPnl.toFixed(2)}
              </span>
            </div>

            <div className="h-4 sm:h-5 w-px bg-[#1A2230] hidden xs:block" />

            <div className="hidden xs:flex flex-col">
              <span className="text-[#7A889B] text-[8px] sm:text-[9px] uppercase tracking-wider">Orders</span>
              <span className="font-bold text-[#2589FF] font-mono-numbers">
                {openPositionsCount}
              </span>
            </div>
          </div>

          {/* Reset Demo Account button */}
          <button
            onClick={onResetAccount}
            className="p-1.5 rounded-lg bg-[#080A0F] border border-[#1A2230] text-[#7A889B] hover:text-white hover:border-[#2589FF]/50 transition cursor-pointer shrink-0"
            title="Reset Simulation Balance ($50,000)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Notifications / Alerts Popover */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(prev => !prev)}
              className={`p-1.5 rounded-lg border transition cursor-pointer relative ${
                triggeredAlerts.length > 0 
                  ? 'bg-[#FF3B4F]/10 border-[#FF3B4F]/50 text-[#FF3B4F]' 
                  : 'bg-[#080A0F] border-[#1A2230] text-[#94A3B8] hover:text-white hover:border-[#2589FF]/50'
              }`}
              title="Price Alerts & Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {(triggeredAlerts.length > 0 || activeAlerts.length > 0) && (
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  triggeredAlerts.length > 0 ? 'bg-[#FF3B4F] animate-ping' : 'bg-[#2589FF]'
                }`} />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-[#11151D] border border-[#1A2230] rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#1A2230] pb-2 mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                    <Bell className="w-3.5 h-3.5 text-[#2589FF]" />
                    <span>ALERTS & NOTICES</span>
                  </div>
                  <span className="text-[10px] text-[#7A889B] font-mono">
                    {alerts.length} Total
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[#7A889B]">
                      No active price alerts set
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                          alert.triggered
                            ? 'bg-[#FF3B4F]/10 border-[#FF3B4F]/40 text-[#FF3B4F]'
                            : 'bg-[#080A0F] border-[#1A2230] text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            <span>{alert.symbol}</span>
                            <span className="text-[10px] text-[#7A889B]">
                              {alert.condition === 'ABOVE' ? '≥' : '≤'} ${alert.targetPrice}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#7A889B]">
                            {alert.triggered ? 'TRIGGERED' : 'ARMED / ACTIVE'}
                          </div>
                        </div>
                        {alert.triggered ? (
                          <span className="px-1.5 py-0.5 rounded bg-[#FF3B4F] text-white text-[9px] font-bold">
                            HIT
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#2589FF]" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {onOpenAlertsModal && (
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      onOpenAlertsModal();
                    }}
                    className="w-full mt-2 py-1.5 rounded-lg bg-[#080A0F] hover:bg-[#1A2230] border border-[#1A2230] text-[11px] text-[#2589FF] font-semibold transition cursor-pointer"
                  >
                    Manage Price Alerts →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Client Profile Menu (Salahuddin) */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-lg bg-[#080A0F] border border-[#1A2230] hover:border-[#2589FF]/50 transition cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-md bg-[#2589FF]/20 border border-[#2589FF]/40 text-[#2589FF] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                S
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight font-mono truncate max-w-[90px]">
                  {clientUser?.name || 'Salahuddin'}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono leading-tight flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Client
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#7A889B] shrink-0" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-[#11151D] border border-[#1A2230] rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
                <div className="border-b border-[#1A2230] pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2589FF]/20 border border-[#2589FF]/50 text-[#2589FF] flex items-center justify-center font-bold text-sm font-mono shrink-0">
                      S
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white font-mono truncate">
                        {clientUser?.name || 'Salahuddin'}
                      </div>
                      <div className="text-[10px] text-[#7A889B] font-mono truncate">
                        {clientUser?.email || 'salahuddin@client.terminal'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#080A0F] border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Tier 1 Institutional Private</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#94A3B8]">
                  <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#1A2230] text-[11px] font-mono">
                    <span className="text-[#7A889B]">Client ID:</span>
                    <span className="text-slate-200">{clientUser?.clientId || 'SLH-2026-X941'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#1A2230] text-[11px] font-mono">
                    <span className="text-[#7A889B]">Session:</span>
                    <span className="text-[#2589FF]">AUTHENTICATED</span>
                  </div>
                </div>

                <div className="border-t border-[#1A2230] mt-2.5 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#FF3B4F]/10 hover:bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out & Lock Terminal</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
