import React from 'react';
import { 
  LayoutDashboard, 
  CandlestickChart, 
  Cpu, 
  Radio, 
  Wallet, 
  History, 
  ShieldCheck, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';

export type SidebarSection = 
  | 'overview' 
  | 'charts' 
  | 'analysis' 
  | 'signals' 
  | 'papertrading' 
  | 'history' 
  | 'risk' 
  | 'settings';

interface SidebarNavProps {
  activeSection: SidebarSection;
  onSelectSection: (section: SidebarSection) => void;
  openPositionsCount: number;
  activeSignalsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  onSelectSection,
  openPositionsCount,
  activeSignalsCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'overview' as SidebarSection,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      tooltip: 'Full Trading Workstation Overview',
    },
    {
      id: 'charts' as SidebarSection,
      label: 'Live Charts',
      icon: CandlestickChart,
      badge: 'LIVE',
      badgeColor: 'text-[#2589FF] bg-[#2589FF]/10 border-[#2589FF]/30',
      tooltip: 'Interactive Candlestick & Indicator Chart',
    },
    {
      id: 'analysis' as SidebarSection,
      label: 'AI Market Analysis',
      icon: Cpu,
      badge: 'AI',
      badgeColor: 'text-teal-400 bg-teal-950/40 border-teal-800/40',
      tooltip: 'Quantitative AI Trend & Confluence Analysis',
    },
    {
      id: 'signals' as SidebarSection,
      label: 'Trading Signals',
      icon: Radio,
      badge: activeSignalsCount > 0 ? `${activeSignalsCount}` : null,
      badgeColor: 'text-[#2589FF] bg-[#2589FF]/10 border-[#2589FF]/30',
      tooltip: 'Algorithmic BUY / SELL / HOLD Signals',
    },
    {
      id: 'papertrading' as SidebarSection,
      label: 'Paper Trading',
      icon: Wallet,
      badge: openPositionsCount > 0 ? `${openPositionsCount}` : null,
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      tooltip: 'Simulated Order Execution & Position Manager',
    },
    {
      id: 'history' as SidebarSection,
      label: 'Trade History',
      icon: History,
      badge: null,
      tooltip: 'Closed Simulation Orders & Performance Ledger',
    },
    {
      id: 'risk' as SidebarSection,
      label: 'Risk Management',
      icon: ShieldCheck,
      badge: null,
      tooltip: 'Stop Loss, Take Profit & Exposure Controls',
    },
    {
      id: 'settings' as SidebarSection,
      label: 'Settings',
      icon: Settings,
      badge: null,
      tooltip: 'System Configuration & Terminal Preferences',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside 
        className={`bg-[#11151D] border-r border-[#1A2230] flex flex-col shrink-0 select-none ${
          // Mobile state: fixed drawer overlay
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 flex shadow-2xl animate-fadeIn'
            : 'hidden md:flex'
        } ${
          // Desktop state: stable width
          isCollapsed ? 'md:w-16' : 'md:w-56'
        }`}
      >
        {/* Header section of sidebar */}
        <div className="h-12 border-b border-[#1A2230] px-3 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#2589FF] shrink-0" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase truncate">
              {(!isCollapsed || isMobileOpen) ? 'Navigation' : ''}
            </span>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className={`hidden md:block p-1.5 rounded-lg text-[#7A889B] hover:text-white hover:bg-[#1A2230] transition cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close toggle */}
          {isMobileOpen && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#7A889B] hover:text-white hover:bg-[#1A2230] transition cursor-pointer"
              aria-label="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const showFull = !isCollapsed || isMobileOpen;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={!showFull ? `${item.label} - ${item.tooltip}` : undefined}
                className={`w-full flex items-center rounded-lg text-xs font-medium transition-all group cursor-pointer relative ${
                  !showFull ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#2589FF]/15 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                    : 'text-[#94A3B8] hover:text-slate-100 hover:bg-[#1A2230]/70 border border-transparent'
                }`}
              >
                {/* Active Blue Left Accent Marker */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2589FF] rounded-r-full shadow-[0_0_8px_#2589FF]" />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#2589FF]' : 'text-[#7A889B] group-hover:text-slate-200'
                    }`}
                  />
                  {showFull && (
                    <span className={`truncate text-xs ${isActive ? 'font-semibold text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </div>

                {showFull && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Client Badge / Status */}
        <div className="p-2 border-t border-[#1A2230] bg-[#0C1017]">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2230]">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#7A889B]">CLIENT ACCESS</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  VERIFIED
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate font-mono">
                Salahuddin
              </div>
              <div className="text-[10px] text-[#7A889B] truncate font-mono">
                Tier 1 • Institutional
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-1" title="Client: Salahuddin (Authorized)">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
