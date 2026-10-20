import React, { useState, useMemo } from 'react';
import { SimulatedTrade, MarketSymbol } from '../../types/trading';
import { 
  History, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Trash2,
  Calendar
} from 'lucide-react';

interface TradeHistoryViewProps {
  tradeHistory: SimulatedTrade[];
  selectedSymbol: MarketSymbol;
  onClearHistory?: () => void;
}

export const TradeHistoryView: React.FC<TradeHistoryViewProps> = ({
  tradeHistory,
  selectedSymbol,
  onClearHistory,
}) => {
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL');
  const [exitReasonFilter, setExitReasonFilter] = useState<string>('ALL');

  const filteredHistory = useMemo(() => {
    return tradeHistory.filter(t => {
      const matchSym = symbolFilter === 'ALL' || t.symbol.includes(symbolFilter);
      const matchReason = exitReasonFilter === 'ALL' || t.exitReason === exitReasonFilter;
      return matchSym && matchReason;
    });
  }, [tradeHistory, symbolFilter, exitReasonFilter]);

  const stats = useMemo(() => {
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

    return {
      total,
      wins: wins.length,
      losses: losses.length,
      winRate: winRate.toFixed(1),
      totalPnL: totalPnL.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      bestTrade: bestTrade.toFixed(2),
      worstTrade: worstTrade.toFixed(2),
    };
  }, [tradeHistory]);

  const handleExportCSV = () => {
    if (tradeHistory.length === 0) return;
    const headers = ['TradeID', 'OpenedAt', 'ClosedAt', 'Symbol', 'Side', 'Quantity', 'EntryPrice', 'ExitPrice', 'ExitReason', 'PnL'];
    const rows = tradeHistory.map(t => [
      t.id,
      new Date(t.openedAt).toISOString(),
      t.closedAt ? new Date(t.closedAt).toISOString() : '',
      t.symbol,
      t.side,
      t.quantity,
      t.entryPrice,
      t.exitPrice ?? '',
      t.exitReason ?? '',
      t.pnl
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salahuddin_trade_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF] shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                TRADE HISTORY & AUDIT LEDGER
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2589FF]/10 text-[#2589FF] border border-[#2589FF]/30 font-semibold">
                SIMULATION RECORDS
              </span>
            </div>
            <p className="text-xs text-[#7A889B] truncate mt-0.5">
              Comprehensive performance record of closed simulated orders and algorithmic exits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs">
          {tradeHistory.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080A0F] border border-[#1A2230] text-slate-200 hover:text-white hover:border-[#2589FF]/50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#2589FF]" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Total Orders</span>
          <span className="text-base sm:text-lg font-bold text-white mt-1 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-[#7A889B]">{stats.wins} W / {stats.losses} L</span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Win Rate</span>
          <span className="text-base sm:text-lg font-bold text-[#2589FF] mt-1 block">
            {stats.winRate}%
          </span>
          <span className="text-[10px] text-[#7A889B]">Closed trades</span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Net PnL</span>
          <span className={`text-base sm:text-lg font-bold mt-1 block ${Number(stats.totalPnL) >= 0 ? 'text-emerald-400' : 'text-[#FF3B4F]'}`}>
            ${stats.totalPnL}
          </span>
          <span className="text-[10px] text-[#7A889B]">Realized</span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Profit Factor</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 mt-1 block">
            {stats.profitFactor}
          </span>
          <span className="text-[10px] text-[#7A889B]">Gross W / L</span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Best Trade</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 mt-1 block">
            +${stats.bestTrade}
          </span>
          <span className="text-[10px] text-[#7A889B]">Single gain</span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Worst Trade</span>
          <span className="text-base sm:text-lg font-bold text-[#FF3B4F] mt-1 block">
            ${stats.worstTrade}
          </span>
          <span className="text-[10px] text-[#7A889B]">Controlled SL</span>
        </div>
      </div>

      {/* Trade Ledger Table */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl overflow-hidden shadow-2xl">
        {/* Filter Bar */}
        <div className="p-3 bg-[#0E1420] border-b border-[#1A2230] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#7A889B]">
              <Filter className="w-3.5 h-3.5 text-[#2589FF]" />
              <span>Filters:</span>
            </div>

            <select
              value={symbolFilter}
              onChange={e => setSymbolFilter(e.target.value)}
              className="bg-[#080A0F] border border-[#1A2230] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2589FF]"
            >
              <option value="ALL">All Symbols</option>
              <option value="XAUUSD">XAUUSD (Gold)</option>
              <option value="BTCUSD">BTCUSD</option>
              <option value="ETHUSD">ETHUSD</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
            </select>

            <select
              value={exitReasonFilter}
              onChange={e => setExitReasonFilter(e.target.value)}
              className="bg-[#080A0F] border border-[#1A2230] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2589FF]"
            >
              <option value="ALL">All Exit Types</option>
              <option value="TAKE_PROFIT">Take Profit Only</option>
              <option value="STOP_LOSS">Stop Loss Only</option>
              <option value="MANUAL_CLOSE">Manual Closes</option>
            </select>
          </div>

          <span className="text-xs text-[#7A889B] font-mono self-end sm:self-auto">
            Showing {filteredHistory.length} of {tradeHistory.length} records
          </span>
        </div>

        {/* Responsive Table with horizontal scroll wrapper */}
        <div className="overflow-x-auto p-2">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-[#7A889B] text-xs font-mono">
              <History className="w-8 h-8 stroke-1 mx-auto mb-2 text-[#7A889B]" />
              <p className="text-white font-semibold">No historical trades found.</p>
              <p className="text-[11px] text-[#7A889B] mt-1">
                Completed simulated orders will appear here automatically.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left text-xs font-mono-numbers">
              <thead>
                <tr className="border-b border-[#1A2230] text-[#7A889B] text-[11px] font-mono">
                  <th className="pb-2.5 pl-2">Closed Time</th>
                  <th className="pb-2.5">Symbol</th>
                  <th className="pb-2.5">Side</th>
                  <th className="pb-2.5">Volume</th>
                  <th className="pb-2.5">Entry Price</th>
                  <th className="pb-2.5">Exit Price</th>
                  <th className="pb-2.5">Exit Trigger</th>
                  <th className="pb-2.5 pr-2 text-right">Realized PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2230]">
                {filteredHistory.map(trade => {
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
                      <td className="py-2.5 text-slate-300">{trade.quantity}</td>
                      <td className="py-2.5 text-slate-300">${trade.entryPrice.toFixed(selectedSymbol.precision)}</td>
                      <td className="py-2.5 text-white">${trade.exitPrice?.toFixed(selectedSymbol.precision) ?? '--'}</td>
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
                      <td className={`py-2.5 pr-2 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-[#FF3B4F]'}`}>
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
