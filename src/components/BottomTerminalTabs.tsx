import React, { useState, useMemo } from 'react';
import { SimulatedTrade, TradingSignal, MarketSymbol, BotRiskSettings } from '../types/trading';
import { AVAILABLE_SYMBOLS } from '../data/symbols';
import { 
  Layers, 
  History, 
  Radio, 
  Sliders, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Filter,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Percent,
  DollarSign,
  ShieldCheck,
  X
} from 'lucide-react';

interface BottomTerminalTabsProps {
  openTrades: SimulatedTrade[];
  tradeHistory: SimulatedTrade[];
  signalHistory: TradingSignal[];
  onCloseTrade: (tradeId: string) => void;
  selectedSymbol: MarketSymbol;
  settings: BotRiskSettings;
  onUpdateSettings: (newSettings: Partial<BotRiskSettings>) => void;
  isSimRunning: boolean;
  onToggleSim: () => void;
}

export const BottomTerminalTabs: React.FC<BottomTerminalTabsProps> = ({
  openTrades,
  tradeHistory,
  signalHistory,
  onCloseTrade,
  selectedSymbol,
  settings,
  onUpdateSettings,
  isSimRunning,
  onToggleSim,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'signals' | 'metrics' | 'risk_controls' | 'rules'>('positions');

  // Signal History Filters
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Filtered signal history
  const filteredSignals = useMemo(() => {
    return signalHistory.filter(sig => {
      const matchSymbol = symbolFilter === 'ALL' || sig.symbol.replace('/', '') === symbolFilter.replace('/', '') || sig.symbol.includes(symbolFilter);
      const matchType = typeFilter === 'ALL' || sig.type === typeFilter;
      return matchSymbol && matchType;
    });
  }, [signalHistory, symbolFilter, typeFilter]);

  // Derived Performance Metrics strictly based on recorded simulation results
  const performanceMetrics = useMemo(() => {
    const total = tradeHistory.length;
    const wins = tradeHistory.filter(t => t.pnl > 0);
    const losses = tradeHistory.filter(t => t.pnl < 0);
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const totalPnL = tradeHistory.reduce((acc, t) => acc + t.pnl, 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : grossProfit > 0 ? 99.0 : 0;
    const bestTrade = wins.length > 0 ? Math.max(...wins.map(w => w.pnl)) : 0;
    const worstTrade = losses.length > 0 ? Math.min(...losses.map(l => l.pnl)) : 0;
    const avgTrade = total > 0 ? totalPnL / total : 0;

    return {
      total,
      wins: wins.length,
      losses: losses.length,
      winRate: winRate.toFixed(1),
      totalPnL: totalPnL.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      grossLoss: grossLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      bestTrade: bestTrade.toFixed(2),
      worstTrade: worstTrade.toFixed(2),
      avgTrade: avgTrade.toFixed(2),
    };
  }, [tradeHistory]);

  return (
    <div className="bg-[#11151D] border border-[#1A2230] rounded-xl overflow-hidden shadow-2xl mt-3 select-none">
      
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-[#1A2230] bg-[#0E1420] px-2.5 py-1.5 overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* Tab 1: Positions */}
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-[#2589FF]/20 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2230] border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Open Orders</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#080A0F] text-[#2589FF] font-mono border border-[#1A2230]">
              {openTrades.length}
            </span>
          </button>

          {/* Tab 2: Trade History */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#2589FF]/20 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2230] border border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Trade Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#080A0F] text-[#7A889B] font-mono border border-[#1A2230]">
              {tradeHistory.length}
            </span>
          </button>

          {/* Tab 3: Signal History */}
          <button
            onClick={() => setActiveTab('signals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'signals'
                ? 'bg-[#2589FF]/20 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2230] border border-transparent'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Signal Audit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#080A0F] text-[#7A889B] font-mono border border-[#1A2230]">
              {signalHistory.length}
            </span>
          </button>

          {/* Tab 4: Performance Metrics */}
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-[#2589FF]/20 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2230] border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Performance Metrics</span>
          </button>

          {/* Tab 5: Risk Controls */}
          <button
            onClick={() => setActiveTab('risk_controls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'risk_controls'
                ? 'bg-[#2589FF]/20 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2230] border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Simulation Guardrails</span>
          </button>

          {/* Tab 6: Rules Matrix */}
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-[#2589FF]/20 text-white border border-[#2589FF]/50 shadow-sm shadow-[#2589FF]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2230] border border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2589FF]" />
            <span>Confluence Matrix</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#7A889B] hidden lg:inline px-2 py-0.5 rounded bg-[#080A0F] border border-[#1A2230]">
          SIMULATED PAPER TRADING • NO REAL CAPITAL AT RISK
        </span>
      </div>

      {/* Tab 1: Simulated Open Positions */}
      {activeTab === 'positions' && (
        <div className="overflow-x-auto min-h-[160px] max-h-[260px] p-2">
          {openTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#7A889B] text-xs">
              <Layers className="w-7 h-7 stroke-1 text-[#7A889B] mb-2" />
              <p className="font-semibold text-white">No simulated positions currently open.</p>
              <p className="text-[11px] text-[#7A889B] mt-0.5">
                Execute a trade via the chart order bar or enable Auto-Execution in Risk Controls.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[680px] text-left text-xs font-mono-numbers">
              <thead>
                <tr className="border-b border-[#1A2230] text-[#7A889B] text-[11px] font-mono">
                  <th className="pb-2 pl-2">Time</th>
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Entry Price</th>
                  <th className="pb-2">Mark Price</th>
                  <th className="pb-2">Stop Loss</th>
                  <th className="pb-2">Take Profit</th>
                  <th className="pb-2 text-right">Simulated P/L</th>
                  <th className="pb-2 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2230]">
                {openTrades.map(trade => {
                  const isProfit = trade.pnl >= 0;
                  const isBuy = trade.side === 'BUY';
                  return (
                    <tr key={trade.id} className="hover:bg-[#1A2230]/50 transition">
                      <td className="py-2.5 pl-2 text-[#7A889B] text-[11px]">
                        {new Date(trade.openedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 font-bold text-white">
                        {trade.symbol}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {trade.quantity}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {trade.entryPrice.toFixed(selectedSymbol.precision)}
                      </td>
                      <td className="py-2.5 font-bold text-white">
                        {trade.currentPrice.toFixed(selectedSymbol.precision)}
                      </td>
                      <td className="py-2.5 text-[#FF3B4F]">
                        {trade.stopLoss.toFixed(selectedSymbol.precision)}
                      </td>
                      <td className="py-2.5 text-emerald-400">
                        {trade.takeProfit.toFixed(selectedSymbol.precision)}
                      </td>
                      <td className={`py-2.5 text-right font-bold ${
                        isProfit ? 'text-emerald-400' : 'text-[#FF3B4F]'
                      }`}>
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <button
                          onClick={() => onCloseTrade(trade.id)}
                          className="px-2.5 py-1 rounded bg-[#FF3B4F]/10 hover:bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/40 text-[10px] font-bold transition cursor-pointer"
                        >
                          Close Order
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Trade History */}
      {activeTab === 'history' && (
        <div className="overflow-x-auto min-h-[160px] max-h-[260px] p-2">
          {tradeHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#7A889B] text-xs">
              <History className="w-7 h-7 stroke-1 text-[#7A889B] mb-2" />
              <p className="font-semibold text-white">No historical trades recorded yet.</p>
              <p className="text-[11px] text-[#7A889B] mt-0.5">
                Closed simulated trades and triggered exits will be logged here.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[680px] text-left text-xs font-mono-numbers">
              <thead>
                <tr className="border-b border-[#1A2230] text-[#7A889B] text-[11px] font-mono">
                  <th className="pb-2 pl-2">Closed Time</th>
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Entry</th>
                  <th className="pb-2">Exit</th>
                  <th className="pb-2">Exit Reason</th>
                  <th className="pb-2 text-right">Realized PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2230]">
                {tradeHistory.map(trade => {
                  const isProfit = trade.pnl >= 0;
                  return (
                    <tr key={trade.id} className="hover:bg-[#1A2230]/50 transition">
                      <td className="py-2.5 pl-2 text-[#7A889B] text-[11px]">
                        {trade.closedAt ? new Date(trade.closedAt).toLocaleTimeString() : '--'}
                      </td>
                      <td className="py-2.5 font-bold text-white">{trade.symbol}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.side === 'BUY' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">{trade.entryPrice.toFixed(selectedSymbol.precision)}</td>
                      <td className="py-2.5 text-white">{trade.exitPrice?.toFixed(selectedSymbol.precision) ?? '--'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          trade.exitReason === 'TAKE_PROFIT' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold'
                            : trade.exitReason === 'STOP_LOSS'
                            ? 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40 font-bold'
                            : 'bg-[#080A0F] text-[#7A889B] border border-[#1A2230]'
                        }`}>
                          {trade.exitReason || 'MANUAL_CLOSE'}
                        </span>
                      </td>
                      <td className={`py-2.5 text-right font-bold ${
                        isProfit ? 'text-emerald-400' : 'text-[#FF3B4F]'
                      }`}>
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Signal History */}
      {activeTab === 'signals' && (
        <div className="p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1A2230] flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[#7A889B] font-mono text-[11px]">
                <Filter className="w-3.5 h-3.5 text-[#2589FF]" />
                <span>Filters:</span>
              </div>

              {/* Symbol Filter */}
              <select
                value={symbolFilter}
                onChange={e => setSymbolFilter(e.target.value)}
                className="bg-[#080A0F] border border-[#1A2230] text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#2589FF]"
              >
                <option value="ALL">All Symbols</option>
                <option value="XAUUSD">XAUUSD (Gold)</option>
                <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                <option value="ETHUSD">ETHUSD (Ethereum)</option>
                <option value="EURUSD">EURUSD</option>
                <option value="GBPUSD">GBPUSD</option>
              </select>

              {/* Signal Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-[#080A0F] border border-[#1A2230] text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#2589FF]"
              >
                <option value="ALL">All Signals</option>
                <option value="BUY">BUY Only</option>
                <option value="SELL">SELL Only</option>
                <option value="HOLD">HOLD Only</option>
              </select>
            </div>

            <span className="text-[11px] text-[#7A889B] font-mono">
              Showing {filteredSignals.length} of {signalHistory.length} logged
            </span>
          </div>

          <div className="overflow-x-auto min-h-[160px] max-h-[260px]">
            {filteredSignals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#7A889B] text-xs">
                <AlertCircle className="w-7 h-7 stroke-1 text-[#7A889B] mb-2" />
                <p className="font-semibold text-white">No signals match current filter criteria.</p>
              </div>
            ) : (
              <table className="w-full min-w-[680px] text-left text-xs font-mono-numbers">
                <thead>
                  <tr className="border-b border-[#1A2230] text-[#7A889B] text-[11px] font-mono">
                    <th className="pb-2 pl-2">Timestamp</th>
                    <th className="pb-2">Symbol</th>
                    <th className="pb-2">Timeframe</th>
                    <th className="pb-2">Signal</th>
                    <th className="pb-2">Ref Price</th>
                    <th className="pb-2">Confluence</th>
                    <th className="pb-2">Reason / Rule Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2230]">
                  {filteredSignals.slice().reverse().map(sig => {
                    const isBuy = sig.type === 'BUY';
                    const isSell = sig.type === 'SELL';
                    return (
                      <tr key={sig.id} className="hover:bg-[#1A2230]/50 transition">
                        <td className="py-2.5 pl-2 text-[#7A889B] text-[11px]">
                          {new Date(sig.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 font-bold text-white">{sig.symbol}</td>
                        <td className="py-2.5 text-[#7A889B] font-mono">{sig.timeframe}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy ? 'bg-[#2589FF]/20 text-[#2589FF] border border-[#2589FF]/50' :
                            isSell ? 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40' :
                            'bg-[#080A0F] text-amber-400 border border-[#1A2230]'
                          }`}>
                            {sig.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-white font-semibold">
                          {sig.price.toFixed(selectedSymbol.precision)}
                        </td>
                        <td className="py-2.5 font-bold text-[#2589FF]">
                          {sig.confidence}%
                        </td>
                        <td className="py-2.5 text-[#94A3B8] text-[11px] max-w-[340px] truncate">
                          <strong className="text-white">{sig.ruleTitle}</strong>: {sig.explanation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Performance Metrics */}
      {activeTab === 'metrics' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3">
              <div className="text-[10px] font-mono text-[#7A889B] uppercase">Total Closed Orders</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{performanceMetrics.total}</div>
              <div className="text-[10px] text-[#7A889B] font-mono mt-0.5">
                {performanceMetrics.wins} Wins • {performanceMetrics.losses} Losses
              </div>
            </div>

            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3">
              <div className="text-[10px] font-mono text-[#7A889B] uppercase">Win Rate (Simulated)</div>
              <div className="text-xl font-bold font-mono text-[#2589FF] mt-1">{performanceMetrics.winRate}%</div>
              <div className="text-[10px] text-[#7A889B] font-mono mt-0.5">
                Deterministic rule outcomes
              </div>
            </div>

            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3">
              <div className="text-[10px] font-mono text-[#7A889B] uppercase">Profit Factor</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{performanceMetrics.profitFactor}</div>
              <div className="text-[10px] text-[#7A889B] font-mono mt-0.5">
                Gross Profit / Gross Loss
              </div>
            </div>

            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3">
              <div className="text-[10px] font-mono text-[#7A889B] uppercase">Net Realized PnL</div>
              <div className={`text-xl font-bold font-mono mt-1 ${
                Number(performanceMetrics.totalPnL) >= 0 ? 'text-emerald-400' : 'text-[#FF3B4F]'
              }`}>
                ${performanceMetrics.totalPnL}
              </div>
              <div className="text-[10px] text-[#7A889B] font-mono mt-0.5">
                Avg Trade: ${performanceMetrics.avgTrade}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3 flex items-center justify-between">
              <span className="text-[#94A3B8]">Best Recorded Trade:</span>
              <span className="text-emerald-400 font-bold">+${performanceMetrics.bestTrade}</span>
            </div>
            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3 flex items-center justify-between">
              <span className="text-[#94A3B8]">Worst Recorded Trade:</span>
              <span className="text-[#FF3B4F] font-bold">${performanceMetrics.worstTrade}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Trade Simulation & Risk Controls */}
      {activeTab === 'risk_controls' && (
        <div className="p-4 text-xs space-y-4 max-h-[280px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Risk per trade */}
            <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-white font-semibold">Risk Per Trade (% Equity)</label>
                <span className="font-mono font-bold text-[#2589FF] bg-[#11151D] px-2 py-0.5 rounded border border-[#1A2230]">
                  {settings.riskPerTradePct}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={settings.riskPerTradePct}
                onChange={e => onUpdateSettings({ riskPerTradePct: parseFloat(e.target.value) })}
                className="w-full accent-[#2589FF] h-1.5 bg-[#11151D] rounded cursor-pointer my-2"
              />
              <p className="text-[10px] text-[#7A889B]">
                Sizing guardrail: automatically sizes simulated lot quantity to cap single-trade loss at {settings.riskPerTradePct}%.
              </p>
            </div>

            {/* Stop Loss distance */}
            <div className="bg-[#080A0F] border border-[#FF3B4F]/30 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#FF3B4F] font-semibold">Stop Loss (% Distance)</label>
                <span className="font-mono font-bold text-[#FF3B4F] bg-[#11151D] px-2 py-0.5 rounded border border-[#FF3B4F]/40">
                  {settings.stopLossPct}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={settings.stopLossPct}
                onChange={e => onUpdateSettings({ stopLossPct: parseFloat(e.target.value) })}
                className="w-full accent-[#FF3B4F] h-1.5 bg-[#11151D] rounded cursor-pointer my-2"
              />
              <p className="text-[10px] text-[#7A889B]">
                Safety trigger: auto-liquidates paper position if price moves against entry by {settings.stopLossPct}%.
              </p>
            </div>

            {/* Take Profit distance */}
            <div className="bg-[#080A0F] border border-emerald-500/30 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-emerald-400 font-semibold">Take Profit (% Target)</label>
                <span className="font-mono font-bold text-emerald-400 bg-[#11151D] px-2 py-0.5 rounded border border-emerald-500/40">
                  {settings.takeProfitPct}%
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={settings.takeProfitPct}
                onChange={e => onUpdateSettings({ takeProfitPct: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 h-1.5 bg-[#11151D] rounded cursor-pointer my-2"
              />
              <p className="text-[10px] text-[#7A889B]">
                Target R:R: 1:{(settings.takeProfitPct / settings.stopLossPct).toFixed(1)} based on current configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Rules Matrix */}
      {activeTab === 'rules' && (
        <div className="p-4 text-xs space-y-3 max-h-[280px] overflow-y-auto">
          <div className="bg-[#080A0F] border border-[#1A2230] rounded-xl p-3.5">
            <h4 className="text-sm font-bold text-white font-mono mb-2">
              Salahuddin AI Strategy Decision Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[#94A3B8]">
              <div className="p-2.5 rounded-lg bg-[#11151D] border border-[#1A2230]">
                <strong className="text-white block mb-1">1. Moving Average Confluence</strong>
                EMA 20 &gt; EMA 50 indicates bullish structure; EMA 20 &lt; EMA 50 indicates bearish structure.
              </div>
              <div className="p-2.5 rounded-lg bg-[#11151D] border border-[#1A2230]">
                <strong className="text-white block mb-1">2. RSI Momentum Filtration</strong>
                RSI &gt; 52 reinforces bullish setups; RSI &lt; 48 reinforces bearish setups. Extreme bounds (&gt;70 / &lt;30) trigger mean reversion alerts.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
