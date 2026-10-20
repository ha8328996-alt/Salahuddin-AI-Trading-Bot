import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MarketType, 
  Timeframe, 
  MarketSymbol, 
  Candle, 
  IndicatorSettings, 
  BotRiskSettings, 
  SimulatedTrade, 
  TradingSignal, 
  AccountStats,
  ConnectionStatus,
  StrategyMode,
  PriceAlert
} from './types/trading';
import { ClientUser } from './types/auth';
import { getStoredSession, clearSession } from './utils/auth';
import { AVAILABLE_SYMBOLS } from './data/symbols';
import { 
  generateRealisticCandles, 
  tickCandles, 
  evaluateTradingSignal, 
  evaluateTradeState,
  evaluatePriceAlerts
} from './utils/indicators';
import { LoginScreen } from './components/LoginScreen';
import { HeaderBar } from './components/HeaderBar';
import { SidebarNav, SidebarSection } from './components/SidebarNav';
import { MarketToolbar } from './components/MarketToolbar';
import { CandlestickChart } from './components/CandlestickChart';
import { SignalAnalysisPanel } from './components/SignalAnalysisPanel';
import { BottomTerminalTabs } from './components/BottomTerminalTabs';
import { RiskSettingsModal } from './components/RiskSettingsModal';
import { AiAnalysisCard } from './components/AiAnalysisCard';
import { AnalysisView } from './components/views/AnalysisView';
import { SignalsView } from './components/views/SignalsView';
import { PaperTradingView } from './components/views/PaperTradingView';
import { TradeHistoryView } from './components/views/TradeHistoryView';
import { RiskView } from './components/views/RiskView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  // 0. Client Authentication & Access Gate (Session Protected)
  const [clientUser, setClientUser] = useState<ClientUser | null>(() => getStoredSession());

  // 1. Connection & Market State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('demo');
  const [currentMarket, setCurrentMarket] = useState<MarketType>('forex');
  const [selectedSymbol, setSelectedSymbol] = useState<MarketSymbol>(AVAILABLE_SYMBOLS[0]); // XAUUSD
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');

  // 2. Chart & Candle Data
  const [candles, setCandles] = useState<Candle[]>(() => 
    generateRealisticCandles(AVAILABLE_SYMBOLS[0], '5m', 65)
  );
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const tickCountRef = useRef<number>(0);

  // 3. Navigation Sidebar State & Responsive Drawer
  const [activeNavSection, setActiveNavSection] = useState<SidebarSection>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // 4. Indicator Configuration
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showEma20: true,
    showEma50: true,
    showRsi: true,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
  });

  // 5. Bot & Risk Settings
  const [riskSettings, setRiskSettings] = useState<BotRiskSettings>({
    riskPerTradePct: 1.5,
    stopLossPct: 1.2,
    takeProfitPct: 3.0,
    strategy: 'multi_factor_ai',
    autoExecute: true,
    simulationSpeed: 'normal',
    maxConcurrentTrades: 3,
    trailingStop: false,
  });

  // 6. Simulation Engine Control
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // 7. Paper Trading Account & Orders
  const [balance, setBalance] = useState<number>(50000);
  const [activeTrades, setActiveTrades] = useState<SimulatedTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<SimulatedTrade[]>([]);

  // 8. Signals & Audit Feed
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(null);
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>([]);
  const lastSignalTriggerTime = useRef<number>(0);

  // 9. Custom Price Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlertNotice, setTriggeredAlertNotice] = useState<PriceAlert | null>(null);

  // Sync activeNavSection with window.location.hash for browser back/forward and bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as SidebarSection;
      const validSections: SidebarSection[] = [
        'overview', 
        'charts', 
        'analysis', 
        'signals', 
        'papertrading', 
        'history', 
        'risk', 
        'settings'
      ];
      if (validSections.includes(hash)) {
        setActiveNavSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    clearSession();
    setClientUser(null);
  }, []);

  // Alert callbacks
  const handleAddAlert = useCallback((targetPrice: number, condition: 'ABOVE' | 'BELOW', label?: string) => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      symbol: selectedSymbol.symbol,
      targetPrice,
      condition,
      createdPrice: candles[candles.length - 1]?.close || selectedSymbol.basePrice,
      createdAt: Date.now(),
      triggered: false,
      label,
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, [selectedSymbol.symbol, candles, selectedSymbol.basePrice]);

  const handleRemoveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const handleTestTriggerAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const triggeredAlert: PriceAlert = {
          ...a,
          triggered: true,
          triggeredAt: Date.now(),
        };
        setTriggeredAlertNotice(triggeredAlert);
        return triggeredAlert;
      }
      return a;
    }));
  }, []);

  const handleResetAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, triggered: false, triggeredAt: undefined } : a));
  }, []);

  // Auto-dismiss alert notification banner after 6 seconds
  useEffect(() => {
    if (triggeredAlertNotice) {
      const timer = setTimeout(() => {
        setTriggeredAlertNotice(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [triggeredAlertNotice]);

  // Symbol change handler
  const handleSymbolChange = useCallback((newSymbol: MarketSymbol) => {
    setSelectedSymbol(newSymbol);
    setCurrentMarket(newSymbol.market);
    const newCandles = generateRealisticCandles(newSymbol, timeframe, 65);
    setCandles(newCandles);
    setPriceDelta(0);
    const initialSignal = evaluateTradingSignal(newCandles, newSymbol, timeframe, riskSettings);
    setCurrentSignal(initialSignal);
  }, [timeframe, riskSettings]);

  // Timeframe change handler
  const handleTimeframeChange = useCallback((newTf: Timeframe) => {
    setTimeframe(newTf);
    const newCandles = generateRealisticCandles(selectedSymbol, newTf, 65);
    setCandles(newCandles);
    const initialSignal = evaluateTradingSignal(newCandles, selectedSymbol, newTf, riskSettings);
    setCurrentSignal(initialSignal);
  }, [selectedSymbol, riskSettings]);

  // Strategy change handler
  const handleStrategyChange = useCallback((newStrategy: StrategyMode) => {
    setRiskSettings(prev => ({ ...prev, strategy: newStrategy }));
    if (candles.length > 0) {
      const updatedSignal = evaluateTradingSignal(candles, selectedSymbol, timeframe, {
        ...riskSettings,
        strategy: newStrategy,
      });
      setCurrentSignal(updatedSignal);
    }
  }, [candles, selectedSymbol, timeframe, riskSettings]);

  // Open a simulated trade (Manual or Automated)
  const openSimulatedTrade = useCallback((
    side: 'BUY' | 'SELL', 
    signalRef?: TradingSignal,
    customQty?: number,
    customSl?: number,
    customTp?: number
  ) => {
    if (candles.length === 0) return;
    const currentPrice = candles[candles.length - 1].close;

    if (activeTrades.length >= riskSettings.maxConcurrentTrades) {
      return;
    }

    // Sizing lot quantity based on risk % and stop loss distance
    const riskDollarAmount = balance * (riskSettings.riskPerTradePct / 100);
    const slDist = currentPrice * (riskSettings.stopLossPct / 100);
    const tpDist = currentPrice * (riskSettings.takeProfitPct / 100);

    const isBuy = side === 'BUY';
    const stopLoss = customSl ?? Number((isBuy ? currentPrice - slDist : currentPrice + slDist).toFixed(selectedSymbol.precision));
    const takeProfit = customTp ?? Number((isBuy ? currentPrice + tpDist : currentPrice - tpDist).toFixed(selectedSymbol.precision));

    // Quantity / Lot size
    const perUnitRisk = Math.abs(currentPrice - stopLoss) || 1;
    let quantity = customQty ?? Math.max(0.1, Number((riskDollarAmount / perUnitRisk).toFixed(2)));
    if (!customQty && selectedSymbol.market === 'crypto' && selectedSymbol.id === 'BTCUSD') {
      quantity = Math.max(0.01, Number((riskDollarAmount / perUnitRisk).toFixed(3)));
    }

    const marginRequired = Number(((currentPrice * quantity) / 20).toFixed(2)); // simulated 20:1 leverage

    const newTrade: SimulatedTrade = {
      id: `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      symbol: selectedSymbol.symbol,
      market: selectedSymbol.market,
      side,
      entryPrice: currentPrice,
      currentPrice,
      stopLoss,
      takeProfit,
      quantity,
      lots: quantity,
      margin: marginRequired,
      openedAt: Date.now(),
      status: 'OPEN',
      pnl: 0,
      pnlPercent: 0,
      signalRule: signalRef?.ruleTitle || 'Manual Paper Order',
    };

    setActiveTrades(prev => [newTrade, ...prev]);
  }, [candles, activeTrades.length, riskSettings, balance, selectedSymbol]);

  // Close an active trade manually
  const closeTradeManually = useCallback((tradeId: string) => {
    setActiveTrades(prevTrades => {
      const trade = prevTrades.find(t => t.id === tradeId);
      if (!trade) return prevTrades;

      const currentPrice = candles[candles.length - 1]?.close || trade.currentPrice;
      const { updatedTrade } = evaluateTradeState(trade, currentPrice, selectedSymbol.pipSize);
      
      const closedTrade: SimulatedTrade = {
        ...updatedTrade,
        status: 'CLOSED',
        exitPrice: currentPrice,
        closedAt: Date.now(),
        exitReason: 'MANUAL_CLOSE',
      };

      setBalance(b => Number((b + closedTrade.pnl).toFixed(2)));
      setTradeHistory(h => [closedTrade, ...h]);

      return prevTrades.filter(t => t.id !== tradeId);
    });
  }, [candles, selectedSymbol.pipSize]);

  // Close all active trades
  const handleCloseAllTrades = useCallback(() => {
    setActiveTrades(prevTrades => {
      if (prevTrades.length === 0) return prevTrades;
      const currentPrice = candles[candles.length - 1]?.close || selectedSymbol.basePrice;
      const closedList: SimulatedTrade[] = prevTrades.map(trade => {
        const { updatedTrade } = evaluateTradeState(trade, currentPrice, selectedSymbol.pipSize);
        return {
          ...updatedTrade,
          status: 'CLOSED',
          exitPrice: currentPrice,
          closedAt: Date.now(),
          exitReason: 'MANUAL_CLOSE',
        };
      });

      const totalPnl = closedList.reduce((acc, t) => acc + t.pnl, 0);
      setBalance(b => Number((b + totalPnl).toFixed(2)));
      setTradeHistory(h => [...closedList, ...h]);

      return [];
    });
  }, [candles, selectedSymbol]);

  // Reset demo balance
  const handleResetAccount = useCallback(() => {
    setBalance(50000);
    setActiveTrades([]);
    setTradeHistory([]);
  }, []);

  // Main Simulation Tick Loop
  useEffect(() => {
    if (!isSimRunning || connectionStatus === 'disconnected') return;

    let intervalMs = 1200;
    if (riskSettings.simulationSpeed === 'slow') intervalMs = 2500;
    if (riskSettings.simulationSpeed === 'fast') intervalMs = 450;

    const timer = setInterval(() => {
      tickCountRef.current += 1;
      const forceNewBar = tickCountRef.current % 18 === 0;

      setCandles(prevCandles => {
        const prevClose = prevCandles[prevCandles.length - 1]?.close || selectedSymbol.basePrice;
        const updated = tickCandles(prevCandles, selectedSymbol, timeframe, forceNewBar);
        const newClose = updated[updated.length - 1]?.close || prevClose;
        setPriceDelta(Number((newClose - prevClose).toFixed(selectedSymbol.precision)));

        // 1. Update Open Trades PnL & Check Stop Loss / Take Profit
        setActiveTrades(prevTrades => {
          const remaining: SimulatedTrade[] = [];
          const justClosed: SimulatedTrade[] = [];

          prevTrades.forEach(t => {
            if (t.symbol === selectedSymbol.symbol) {
              const { updatedTrade, event } = evaluateTradeState(t, newClose, selectedSymbol.pipSize);
              if (event || updatedTrade.status === 'CLOSED') {
                justClosed.push(updatedTrade);
              } else {
                remaining.push(updatedTrade);
              }
            } else {
              remaining.push(t);
            }
          });

          if (justClosed.length > 0) {
            justClosed.forEach(c => {
              setBalance(b => Number((b + c.pnl).toFixed(2)));
            });
            setTradeHistory(h => [...justClosed, ...h]);
          }

          return remaining;
        });

        // 2. Check Custom Price Alert Thresholds for the active symbol
        setAlerts(prevAlerts => {
          const { updatedAlerts, newlyTriggered } = evaluatePriceAlerts(
            prevAlerts,
            newClose,
            selectedSymbol.symbol
          );
          if (newlyTriggered.length > 0) {
            setTriggeredAlertNotice(newlyTriggered[0]);
          }
          return updatedAlerts;
        });

        // 3. Evaluate Signals periodically (every 4 ticks)
        if (tickCountRef.current % 4 === 0) {
          const sig = evaluateTradingSignal(updated, selectedSymbol, timeframe, riskSettings);
          setCurrentSignal(sig);

          // Append to audit feed if signal flipped or 15s elapsed
          const now = Date.now();
          if (now - lastSignalTriggerTime.current > 15000) {
            setSignalHistory(sh => [sig, ...sh.slice(0, 49)]);
            lastSignalTriggerTime.current = now;

            // Auto-execution if enabled
            if (
              riskSettings.autoExecute && 
              (sig.type === 'BUY' || sig.type === 'SELL') &&
              sig.confidence >= 70
            ) {
              openSimulatedTrade(sig.type, sig);
            }
          }
        }

        return updated;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimRunning, connectionStatus, riskSettings, selectedSymbol, timeframe, openSimulatedTrade]);

  // Calculate Account Statistics
  const accountStats: AccountStats = useMemo(() => {
    const unrealizedPnl = activeTrades.reduce((acc, t) => acc + t.pnl, 0);
    const marginUsed = activeTrades.reduce((acc, t) => acc + t.margin, 0);
    const equity = Number((balance + unrealizedPnl).toFixed(2));
    const freeMargin = Math.max(0, equity - marginUsed);
    const marginLevelPct = marginUsed > 0 ? (equity / marginUsed) * 100 : 999;

    const totalTrades = tradeHistory.length;
    const winningTrades = tradeHistory.filter(t => t.pnl > 0).length;
    const losingTrades = tradeHistory.filter(t => t.pnl < 0).length;
    const winRatePct = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const grossProfit = tradeHistory.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(tradeHistory.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.0 : 0;

    return {
      initialBalance: 50000,
      balance,
      equity,
      unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
      realizedPnl: Number((balance - 50000).toFixed(2)),
      marginUsed,
      freeMargin,
      marginLevelPct: Number(marginLevelPct.toFixed(1)),
      totalTrades,
      winningTrades,
      losingTrades,
      winRatePct,
      profitFactor,
    };
  }, [balance, activeTrades, tradeHistory]);

  // Sidebar navigation handler
  const handleSelectNavSection = useCallback((section: SidebarSection) => {
    setActiveNavSection(section);
    window.location.hash = section;
    setIsMobileSidebarOpen(false);
  }, []);

  const latestPrice = candles[candles.length - 1]?.close || selectedSymbol.basePrice;

  // If user is not authenticated, strictly show the client login screen!
  if (!clientUser) {
    return <LoginScreen onLoginSuccess={setClientUser} />;
  }

  return (
    <div className="h-screen bg-[#080A0F] text-slate-100 flex flex-col font-sans selection:bg-[#2589FF]/30 selection:text-white overflow-hidden">
      
      {/* 1. TOP HEADER: Product logo, Connection status, Quick market tag, Financials, Notifications & Client Profile */}
      <HeaderBar
        stats={accountStats}
        isSimRunning={isSimRunning}
        onToggleSim={() => setIsSimRunning(r => !r)}
        onResetAccount={handleResetAccount}
        openPositionsCount={activeTrades.length}
        selectedMarket={currentMarket}
        selectedSymbol={selectedSymbol}
        timeframe={timeframe}
        connectionStatus={connectionStatus}
        onChangeConnectionStatus={setConnectionStatus}
        clientUser={clientUser}
        onLogout={handleLogout}
        alerts={alerts}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* 2. MARKET CONTROL BAR: Market switcher, Searchable Symbol Selector, Timeframes, Strategy, Indicators, Price Alert */}
      <MarketToolbar
        currentMarket={currentMarket}
        onMarketChange={setCurrentMarket}
        selectedSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        indicators={indicators}
        onToggleIndicator={(key) => setIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
        currentStrategy={riskSettings.strategy}
        onStrategyChange={handleStrategyChange}
        currentPrice={latestPrice}
        priceDelta={priceDelta}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        autoExecute={riskSettings.autoExecute}
        onToggleAutoExecute={() => setRiskSettings(s => ({ ...s, autoExecute: !s.autoExecute }))}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onRemoveAlert={handleRemoveAlert}
        onTestTriggerAlert={handleTestTriggerAlert}
        onResetAlert={handleResetAlert}
      />

      {/* 3. WORKSTATION BODY: Left Sidebar Navigation + Main Institutional Content Area */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        
        {/* Left Sidebar Navigation */}
        <SidebarNav
          activeSection={activeNavSection}
          onSelectSection={handleSelectNavSection}
          openPositionsCount={activeTrades.length}
          activeSignalsCount={signalHistory.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Workstation Workspace */}
        <main className="flex-1 min-w-0 p-2.5 sm:p-3 overflow-y-auto overflow-x-hidden w-full">
          <div className="max-w-[1880px] mx-auto min-w-0 w-full">
            
            {/* View layout switches predictably based on active sidebar route */}
            {activeNavSection === 'charts' && (
              // Maximized Chart View
              <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
                <CandlestickChart
                  candles={candles}
                  symbolInfo={selectedSymbol}
                  indicators={indicators}
                  activeTrades={activeTrades}
                  currentSignal={currentSignal}
                  onManualOrder={(side) => openSimulatedTrade(side, currentSignal || undefined)}
                  alerts={alerts}
                  activeTriggeredNotice={triggeredAlertNotice}
                  onDismissAlertNotice={() => setTriggeredAlertNotice(null)}
                />

                <BottomTerminalTabs
                  openTrades={activeTrades}
                  tradeHistory={tradeHistory}
                  signalHistory={signalHistory}
                  onCloseTrade={closeTradeManually}
                  selectedSymbol={selectedSymbol}
                  settings={riskSettings}
                  onUpdateSettings={(newSettings) => setRiskSettings(s => ({ ...s, ...newSettings }))}
                  isSimRunning={isSimRunning}
                  onToggleSim={() => setIsSimRunning(r => !r)}
                />
              </div>
            )}

            {activeNavSection === 'analysis' && (
              <AnalysisView
                symbolInfo={selectedSymbol}
                timeframe={timeframe}
                candles={candles}
                currentSignal={currentSignal}
                settings={riskSettings}
                onExecuteSignal={(sig) => openSimulatedTrade(sig.type === 'SELL' ? 'SELL' : 'BUY', sig)}
              />
            )}

            {activeNavSection === 'signals' && (
              <SignalsView
                currentSignal={currentSignal}
                signalHistory={signalHistory}
                selectedSymbol={selectedSymbol}
                settings={riskSettings}
                onExecuteSignal={(sig) => openSimulatedTrade(sig.type === 'SELL' ? 'SELL' : 'BUY', sig)}
                onSymbolChange={handleSymbolChange}
              />
            )}

            {activeNavSection === 'papertrading' && (
              <PaperTradingView
                stats={accountStats}
                openTrades={activeTrades}
                tradeHistory={tradeHistory}
                selectedSymbol={selectedSymbol}
                currentPrice={latestPrice}
                onOpenTrade={(side, qty, sl, tp) => openSimulatedTrade(side, undefined, qty, sl, tp)}
                onCloseTrade={closeTradeManually}
                onCloseAllTrades={handleCloseAllTrades}
                isSimRunning={isSimRunning}
                onToggleSim={() => setIsSimRunning(r => !r)}
              />
            )}

            {activeNavSection === 'history' && (
              <TradeHistoryView
                tradeHistory={tradeHistory}
                selectedSymbol={selectedSymbol}
                onClearHistory={() => setTradeHistory([])}
              />
            )}

            {activeNavSection === 'risk' && (
              <RiskView
                settings={riskSettings}
                onUpdateSettings={(newSettings) => setRiskSettings(newSettings)}
                onResetAccount={handleResetAccount}
                stats={accountStats}
              />
            )}

            {activeNavSection === 'settings' && (
              <SettingsView
                clientUser={clientUser}
                connectionStatus={connectionStatus}
                onChangeConnectionStatus={setConnectionStatus}
                indicators={indicators}
                onToggleIndicator={(key) => setIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
                riskSettings={riskSettings}
                onUpdateRiskSettings={(newSettings) => setRiskSettings(newSettings)}
                onLogout={handleLogout}
                onResetAccount={handleResetAccount}
              />
            )}

            {activeNavSection === 'overview' && (
              // Standard & Overview Institutional 12-Column Grid
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-w-0 w-full animate-fadeIn">
                
                {/* Main Visual Centerpiece: Candlestick Chart + Bottom Workspace (8 of 12 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-3 min-w-0">
                  <CandlestickChart
                    candles={candles}
                    symbolInfo={selectedSymbol}
                    indicators={indicators}
                    activeTrades={activeTrades}
                    currentSignal={currentSignal}
                    onManualOrder={(side) => openSimulatedTrade(side, currentSignal || undefined)}
                    alerts={alerts}
                    activeTriggeredNotice={triggeredAlertNotice}
                    onDismissAlertNotice={() => setTriggeredAlertNotice(null)}
                  />

                  {/* Bottom Terminal Panels: Open Positions, Trade Ledger, Signal History, Performance Metrics */}
                  <BottomTerminalTabs
                    openTrades={activeTrades}
                    tradeHistory={tradeHistory}
                    signalHistory={signalHistory}
                    onCloseTrade={closeTradeManually}
                    selectedSymbol={selectedSymbol}
                    settings={riskSettings}
                    onUpdateSettings={(newSettings) => setRiskSettings(s => ({ ...s, ...newSettings }))}
                    isSimRunning={isSimRunning}
                    onToggleSim={() => setIsSimRunning(r => !r)}
                  />
                </div>

                {/* Right Intelligence Column (4 of 12 cols): Signal Analysis Panel + AI Market Structure Playbook */}
                <div className="lg:col-span-4 flex flex-col gap-3 min-w-0">
                  {/* Signal Analysis Panel */}
                  <SignalAnalysisPanel
                    currentSignal={currentSignal}
                    settings={riskSettings}
                    onExecuteSignal={(sig) => openSimulatedTrade(sig.type === 'SELL' ? 'SELL' : 'BUY', sig)}
                  />

                  {/* AI Technical Market Structure & Strategy Playbook */}
                  <AiAnalysisCard
                    symbolInfo={selectedSymbol}
                    timeframe={timeframe}
                    candles={candles}
                    currentSignal={currentSignal}
                    settings={riskSettings}
                  />
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* Settings & Risk Management Modal (for quick modal access from toolbar) */}
      <RiskSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={riskSettings}
        onSaveSettings={(newSettings) => setRiskSettings(newSettings)}
        onResetAccount={handleResetAccount}
      />

      {/* Minimal Status Footer */}
      <footer className="border-t border-[#1A2230] bg-[#080A0F] px-4 py-2 text-[11px] text-[#7A889B] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 select-none shrink-0 min-w-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isSimRunning ? 'bg-[#2589FF]' : 'bg-[#FF3B4F]'}`} />
          <span className="text-white font-bold truncate">SALAHUDDIN AI TRADING BOT</span>
          <span className="text-[#1A2230] hidden sm:inline">|</span>
          <span className="truncate">CLIENT: SALAHUDDIN</span>
          <span className="text-[#1A2230] hidden sm:inline">|</span>
          <span className="text-emerald-400 font-semibold">AUTHORIZED</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-[#7A889B] truncate max-w-full">
          Simulated paper-trading terminal for Salahuddin. Non-fabricated algorithmic feed. No live MT5 execution.
        </div>
      </footer>
    </div>
  );
}
