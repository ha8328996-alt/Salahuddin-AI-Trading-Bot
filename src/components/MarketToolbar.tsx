import React, { useState, useMemo } from 'react';
import { MarketType, Timeframe, MarketSymbol, IndicatorSettings, StrategyMode, PriceAlert } from '../types/trading';
import { AVAILABLE_SYMBOLS, TIMEFRAMES } from '../data/symbols';
import { 
  Search, 
  ChevronDown, 
  SlidersHorizontal, 
  Bell, 
  X, 
  Trash2, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';

interface MarketToolbarProps {
  currentMarket: MarketType;
  onMarketChange: (market: MarketType) => void;
  selectedSymbol: MarketSymbol;
  onSymbolChange: (symbol: MarketSymbol) => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  indicators: IndicatorSettings;
  onToggleIndicator: (key: keyof IndicatorSettings) => void;
  currentStrategy: StrategyMode;
  onStrategyChange: (strategy: StrategyMode) => void;
  currentPrice: number;
  priceDelta: number;
  onOpenSettingsModal: () => void;
  autoExecute: boolean;
  onToggleAutoExecute: () => void;
  alerts: PriceAlert[];
  onAddAlert: (targetPrice: number, condition: 'ABOVE' | 'BELOW', label?: string) => void;
  onRemoveAlert: (alertId: string) => void;
  onTestTriggerAlert?: (alertId: string) => void;
  onResetAlert?: (alertId: string) => void;
}

export const MarketToolbar: React.FC<MarketToolbarProps> = ({
  currentMarket,
  onMarketChange,
  selectedSymbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
  indicators,
  onToggleIndicator,
  currentStrategy,
  onStrategyChange,
  currentPrice,
  priceDelta,
  onOpenSettingsModal,
  autoExecute,
  onToggleAutoExecute,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onTestTriggerAlert,
  onResetAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Alert form state
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>(() => 
    (currentPrice * 1.005).toFixed(selectedSymbol.precision)
  );
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertLabel, setAlertLabel] = useState<string>('');

  const handleOpenAlertModal = () => {
    const defaultTarget = alertCondition === 'ABOVE' 
      ? (currentPrice * 1.005).toFixed(selectedSymbol.precision)
      : (currentPrice * 0.995).toFixed(selectedSymbol.precision);
    setAlertTargetPrice(defaultTarget);
    setIsAlertModalOpen(true);
  };

  const filteredSymbols = useMemo(() => {
    return AVAILABLE_SYMBOLS.filter(s => {
      const matchesMarket = s.market === currentMarket;
      if (!searchQuery.trim()) return matchesMarket;
      const query = searchQuery.toLowerCase();
      return (
        matchesMarket &&
        (s.id.toLowerCase().includes(query) ||
         s.name.toLowerCase().includes(query) ||
         s.symbol.toLowerCase().includes(query))
      );
    });
  }, [currentMarket, searchQuery]);

  const symbolAlerts = useMemo(() => {
    return alerts.filter(a => a.symbol === selectedSymbol.symbol);
  }, [alerts, selectedSymbol.symbol]);

  const activeAlertsCount = symbolAlerts.filter(a => !a.triggered).length;
  const isPriceUp = priceDelta >= 0;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(alertTargetPrice);
    if (!isNaN(parsedPrice) && parsedPrice > 0) {
      onAddAlert(parsedPrice, alertCondition, alertLabel.trim() || undefined);
      setAlertLabel('');
      setIsAlertModalOpen(false);
    }
  };

  const handleQuickPercent = (pct: number) => {
    const target = currentPrice * (1 + pct / 100);
    setAlertTargetPrice(target.toFixed(selectedSymbol.precision));
    setAlertCondition(pct >= 0 ? 'ABOVE' : 'BELOW');
  };

  return (
    <div className="bg-[#11151D] border-b border-[#1A2230] px-3 py-2 text-xs flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between relative select-none min-w-0 w-full">
      
      {/* Left controls: Market, Searchable Symbol Selector, Quick Chips, Timeframes */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        
        {/* Market Selector: Forex / Crypto with Electric Blue active state */}
        <div className="flex items-center bg-[#080A0F] border border-[#1A2230] rounded-lg p-0.5">
          <button
            onClick={() => {
              onMarketChange('forex');
              const firstFx = AVAILABLE_SYMBOLS.find(s => s.market === 'forex');
              if (firstFx) onSymbolChange(firstFx);
            }}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              currentMarket === 'forex'
                ? 'bg-[#2589FF] text-white shadow-sm shadow-[#2589FF]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Forex & Gold
          </button>
          <button
            onClick={() => {
              onMarketChange('crypto');
              const firstCrypto = AVAILABLE_SYMBOLS.find(s => s.market === 'crypto');
              if (firstCrypto) onSymbolChange(firstCrypto);
            }}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              currentMarket === 'crypto'
                ? 'bg-[#2589FF] text-white shadow-sm shadow-[#2589FF]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Crypto Assets
          </button>
        </div>

        {/* Searchable Symbol Selector */}
        <div className="relative">
          <div className="flex items-center bg-[#080A0F] border border-[#1A2230] rounded-lg px-2.5 py-1 gap-2 min-w-[210px] focus-within:border-[#2589FF]">
            <Search className="w-3.5 h-3.5 text-[#7A889B]" />
            <input
              type="text"
              placeholder={`Search ${currentMarket === 'forex' ? 'Forex' : 'Crypto'} (e.g. XAUUSD)...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="bg-transparent text-white text-xs focus:outline-none w-full font-mono placeholder:text-slate-600"
            />
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="text-[#7A889B] hover:text-white cursor-pointer"
              title="Toggle symbol list"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Dropdown Results */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-[#11151D] border border-[#1A2230] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-fadeIn">
              <div className="p-1.5">
                {filteredSymbols.length === 0 ? (
                  <div className="p-3 text-center text-[#7A889B] text-[11px] font-mono">
                    No symbols found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredSymbols.map(sym => (
                    <button
                      key={sym.id}
                      onClick={() => {
                        onSymbolChange(sym);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                        sym.id === selectedSymbol.id
                          ? 'bg-[#2589FF]/15 border border-[#2589FF]/40 text-white font-semibold'
                          : 'text-slate-300 hover:bg-[#1A2230] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{sym.id}</span>
                        <span className="text-[10px] text-[#7A889B] truncate max-w-[110px]">{sym.name}</span>
                      </div>
                      <span className="text-[10px] text-[#2589FF] font-mono font-medium">
                        {sym.basePrice.toFixed(sym.precision)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick symbol chips: XAUUSD, BTCUSD, ETHUSD etc. */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full">
          {AVAILABLE_SYMBOLS.filter(s => s.market === currentMarket).slice(0, 5).map(sym => (
            <button
              key={sym.id}
              onClick={() => onSymbolChange(sym)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition cursor-pointer ${
                sym.id === selectedSymbol.id
                  ? 'bg-[#2589FF]/20 border border-[#2589FF] text-white font-bold shadow-sm shadow-[#2589FF]/20'
                  : 'bg-[#080A0F] border border-[#1A2230] text-[#94A3B8] hover:text-white hover:border-[#1A2230]'
              }`}
            >
              {sym.id}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-[#1A2230] hidden md:block" />

        {/* Timeframes: 1m, 5m, 15m, 30m, 1h, 4h */}
        <div className="flex items-center bg-[#080A0F] border border-[#1A2230] rounded-lg p-0.5">
          {TIMEFRAMES.map(tf => {
            const isSelected = tf.value === timeframe;
            return (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange(tf.value)}
                className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#2589FF] text-white shadow-sm shadow-[#2589FF]/30'
                    : 'text-[#7A889B] hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right controls: Custom Price Alert button, Strategy Selector, Indicator Toggles, Live Quote */}
      <div className="flex items-center gap-2 flex-wrap justify-between xl:justify-end">
        
        {/* Custom Price Alert Button in Toolbar */}
        <div className="relative">
          <button
            onClick={handleOpenAlertModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition font-medium text-xs cursor-pointer ${
              activeAlertsCount > 0
                ? 'bg-[#FF3B4F]/10 border-[#FF3B4F]/50 text-[#FF3B4F] shadow-sm shadow-[#FF3B4F]/10'
                : 'bg-[#080A0F] hover:bg-[#1A2230] text-slate-300 hover:text-white border-[#1A2230]'
            }`}
            title="Set Custom Price Alert Threshold"
          >
            <Bell className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? 'text-[#FF3B4F] animate-pulse' : 'text-[#7A889B]'}`} />
            <span>Price Alert</span>
            {activeAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FF3B4F] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Custom Price Alert Thresholds Popover */}
          {isAlertModalOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 max-w-[calc(100vw-24px)] bg-[#11151D] border border-[#1A2230] rounded-xl shadow-2xl z-50 p-4 animate-fadeIn text-xs">
              <div className="flex items-center justify-between border-b border-[#1A2230] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#080A0F] text-[#2589FF] border border-[#2589FF]/30">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white font-mono text-xs">
                      Price Alert • {selectedSymbol.id}
                    </h4>
                    <span className="text-[10px] text-[#7A889B] font-mono">
                      Current: <strong className="text-white">{currentPrice.toFixed(selectedSymbol.precision)}</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlertModalOpen(false)}
                  className="text-[#7A889B] hover:text-white p-1 rounded hover:bg-[#1A2230]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form to create custom threshold */}
              <form onSubmit={handleCreateAlert} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-[#94A3B8] font-mono uppercase mb-1">
                    Alert Condition:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => setAlertCondition('ABOVE')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        alertCondition === 'ABOVE'
                          ? 'bg-[#2589FF]/20 border-[#2589FF] text-white'
                          : 'bg-[#080A0F] border-[#1A2230] text-[#7A889B] hover:text-white'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#2589FF]" />
                      <span>Rises Above (≥)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlertCondition('BELOW')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        alertCondition === 'BELOW'
                          ? 'bg-[#FF3B4F]/20 border-[#FF3B4F] text-[#FF3B4F]'
                          : 'bg-[#080A0F] border-[#1A2230] text-[#7A889B] hover:text-white'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5 text-[#FF3B4F]" />
                      <span>Drops Below (≤)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#94A3B8] font-mono uppercase mb-1">
                    Target Price Threshold:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#2589FF] focus:outline-none"
                    placeholder="Enter target price..."
                    required
                  />
                  {/* Quick percentage adjustment chips */}
                  <div className="flex items-center gap-1 mt-1.5 font-mono text-[10px]">
                    <span className="text-[#7A889B]">Quick:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickPercent(0.5)}
                      className="px-1.5 py-0.5 bg-[#080A0F] hover:bg-[#1A2230] border border-[#1A2230] text-[#2589FF] rounded"
                    >
                      +0.5%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPercent(1.0)}
                      className="px-1.5 py-0.5 bg-[#080A0F] hover:bg-[#1A2230] border border-[#1A2230] text-[#2589FF] rounded"
                    >
                      +1.0%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPercent(-0.5)}
                      className="px-1.5 py-0.5 bg-[#080A0F] hover:bg-[#1A2230] border border-[#1A2230] text-[#FF3B4F] rounded"
                    >
                      -0.5%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPercent(-1.0)}
                      className="px-1.5 py-0.5 bg-[#080A0F] hover:bg-[#1A2230] border border-[#1A2230] text-[#FF3B4F] rounded"
                    >
                      -1.0%
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#94A3B8] font-mono uppercase mb-1">
                    Alert Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={alertLabel}
                    onChange={(e) => setAlertLabel(e.target.value)}
                    placeholder="e.g. Resistance breakout, Support dip"
                    className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-1.5 text-white text-xs focus:border-[#2589FF] focus:outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#2589FF] hover:bg-[#1D74DB] text-white font-bold rounded-lg shadow-sm transition mt-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Set Price Alert Threshold</span>
                </button>
              </form>

              {/* Active Alerts for this Symbol */}
              {symbolAlerts.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#1A2230]">
                  <div className="text-[10px] text-[#7A889B] uppercase font-mono mb-1.5">
                    Active Symbol Alerts ({symbolAlerts.length}):
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {symbolAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between p-2 rounded-lg font-mono text-[11px] ${
                          alert.triggered
                            ? 'bg-[#FF3B4F]/10 border border-[#FF3B4F]/40 text-[#FF3B4F]'
                            : 'bg-[#080A0F] border border-[#1A2230] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alert.triggered ? 'bg-[#FF3B4F] animate-ping' : 'bg-[#2589FF]'}`} />
                          <span className="font-bold">{alert.condition === 'ABOVE' ? '▲ ≥' : '▼ ≤'}</span>
                          <span>{alert.targetPrice.toFixed(selectedSymbol.precision)}</span>
                          {alert.label && (
                            <span className="text-[10px] text-[#7A889B] truncate max-w-[85px]">
                              ({alert.label})
                            </span>
                          )}
                          {alert.triggered && (
                            <span className="text-[9px] px-1 py-0.2 bg-[#FF3B4F]/20 text-[#FF3B4F] rounded font-bold uppercase tracking-wider">
                              Triggered
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1.5">
                          {onTestTriggerAlert && !alert.triggered && (
                            <button
                              type="button"
                              onClick={() => onTestTriggerAlert(alert.id)}
                              className="text-amber-400 hover:text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5 transition cursor-pointer"
                              title="Simulate / Test Trigger Visual Alert"
                            >
                              <Zap className="w-2.5 h-2.5 fill-amber-400" />
                              <span>Test</span>
                            </button>
                          )}
                          {onResetAlert && alert.triggered && (
                            <button
                              type="button"
                              onClick={() => onResetAlert(alert.id)}
                              className="text-slate-300 hover:text-white bg-[#1A2230] hover:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5 transition cursor-pointer"
                              title="Re-arm Alert"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Re-arm</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveAlert(alert.id)}
                            className="text-[#7A889B] hover:text-[#FF3B4F] p-0.5 rounded transition cursor-pointer"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Strategy Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#080A0F] border border-[#1A2230] rounded-lg px-2.5 py-1">
          <span className="text-[10px] text-[#7A889B] uppercase font-mono">Strategy:</span>
          <select
            value={currentStrategy}
            onChange={(e) => onStrategyChange(e.target.value as StrategyMode)}
            className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="multi_factor_ai" className="bg-[#11151D]">AI Multi-Factor Confluence</option>
            <option value="ema_crossover" className="bg-[#11151D]">EMA 20/50 Crossover</option>
            <option value="rsi_mean_reversion" className="bg-[#11151D]">RSI Mean Reversion (30/70)</option>
            <option value="breakout_momentum" className="bg-[#11151D]">Breakout Momentum Channel</option>
          </select>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-1 bg-[#080A0F] border border-[#1A2230] rounded-lg p-0.5">
          <button
            onClick={() => onToggleIndicator('showEma20')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              indicators.showEma20
                ? 'bg-[#2589FF]/20 text-[#2589FF] border border-[#2589FF]/40 font-semibold'
                : 'text-[#7A889B] hover:text-white'
            }`}
            title="Toggle EMA 20 overlay"
          >
            <span className="w-1.5 h-1.5 bg-[#2589FF] rounded-full" />
            EMA 20
          </button>

          <button
            onClick={() => onToggleIndicator('showEma50')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              indicators.showEma50
                ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40 font-semibold'
                : 'text-[#7A889B] hover:text-white'
            }`}
            title="Toggle EMA 50 overlay"
          >
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            EMA 50
          </button>

          <button
            onClick={() => onToggleIndicator('showRsi')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              indicators.showRsi
                ? 'bg-purple-950/60 text-purple-300 border border-purple-600/40 font-semibold'
                : 'text-[#7A889B] hover:text-white'
            }`}
            title="Toggle RSI 14 sub-chart"
          >
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            RSI 14
          </button>
        </div>

        {/* Current Symbol Quote with Spread */}
        <div className="flex items-center gap-2 bg-[#080A0F] border border-[#1A2230] rounded-lg px-2.5 py-1 font-mono-numbers">
          <span className="text-[11px] text-[#7A889B] font-mono font-bold">{selectedSymbol.id}</span>
          <div className="text-xs font-bold text-white flex items-center gap-1">
            <span>{currentPrice.toFixed(selectedSymbol.precision)}</span>
            <span className={`text-[10px] font-semibold px-1 py-0.2 rounded ${
              isPriceUp ? 'text-emerald-400 bg-emerald-950/40' : 'text-[#FF3B4F] bg-[#FF3B4F]/10'
            }`}>
              {isPriceUp ? '+' : ''}{priceDelta.toFixed(selectedSymbol.precision)}
            </span>
          </div>
          <span className="text-[10px] text-[#7A889B] hidden sm:inline">
            Spread: {selectedSymbol.spreadPips} pips
          </span>
        </div>

        {/* Risk Settings Trigger */}
        <button
          onClick={onOpenSettingsModal}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#080A0F] hover:bg-[#1A2230] text-slate-300 hover:text-white rounded-lg border border-[#1A2230] hover:border-[#2589FF]/50 transition cursor-pointer"
          title="Open Risk Management & Execution Settings"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2589FF]" />
          <span className="text-xs font-medium">Risk Controls</span>
        </button>

      </div>
    </div>
  );
};
