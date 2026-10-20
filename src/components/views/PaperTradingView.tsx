import React, { useState } from 'react';
import { AccountStats, SimulatedTrade, MarketSymbol } from '../../types/trading';
import { 
  Wallet, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign,
  Activity,
  Trash2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface PaperTradingViewProps {
  stats: AccountStats;
  openTrades: SimulatedTrade[];
  tradeHistory: SimulatedTrade[];
  selectedSymbol: MarketSymbol;
  currentPrice: number;
  onOpenTrade: (side: 'BUY' | 'SELL', customQty?: number, customSl?: number, customTp?: number) => void;
  onCloseTrade: (tradeId: string) => void;
  onCloseAllTrades: () => void;
  isSimRunning: boolean;
  onToggleSim: () => void;
}

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  stats,
  openTrades,
  tradeHistory,
  selectedSymbol,
  currentPrice,
  onOpenTrade,
  onCloseTrade,
  onCloseAllTrades,
  isSimRunning,
  onToggleSim,
}) => {
  // Order ticket state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [useCustomSlTp, setUseCustomSlTp] = useState(false);
  const [slPercent, setSlPercent] = useState<number>(1.2);
  const [tpPercent, setTpPercent] = useState<number>(3.0);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const calculatedSl = orderSide === 'BUY'
    ? currentPrice * (1 - slPercent / 100)
    : currentPrice * (1 + slPercent / 100);

  const calculatedTp = orderSide === 'BUY'
    ? currentPrice * (1 + tpPercent / 100)
    : currentPrice * (1 - tpPercent / 100);

  const handleExecuteTicket = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenTrade(
      orderSide,
      lotSize,
      useCustomSlTp ? calculatedSl : undefined,
      useCustomSlTp ? calculatedTp : undefined
    );
    setSuccessNotice(`Simulated ${orderSide} order of ${lotSize} lots opened on ${selectedSymbol.symbol}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const isProfitable = stats.unrealizedPnl >= 0;

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF] shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                PAPER TRADING & POSITION WORKSTATION
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-semibold">
                SIMULATION TIER 1
              </span>
            </div>
            <p className="text-xs text-[#7A889B] truncate mt-0.5">
              Simulated risk-free order execution engine • Full ledger tracking & margin management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs">
          {openTrades.length > 0 && (
            <button
              onClick={onCloseAllTrades}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3B4F]/10 hover:bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/40 font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Close All Positions ({openTrades.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Financials Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Balance</span>
          <span className="text-base sm:text-lg font-bold text-white mt-1 block">
            ${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Equity</span>
          <span className="text-base sm:text-lg font-bold text-white mt-1 block">
            ${stats.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Unrealized PnL</span>
          <span className={`text-base sm:text-lg font-bold mt-1 block ${isProfitable ? 'text-emerald-400' : 'text-[#FF3B4F]'}`}>
            {isProfitable ? '+' : ''}${stats.unrealizedPnl.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Margin Used</span>
          <span className="text-base sm:text-lg font-bold text-[#2589FF] mt-1 block">
            ${stats.marginUsed.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Free Margin</span>
          <span className="text-base sm:text-lg font-bold text-slate-200 mt-1 block">
            ${stats.freeMargin.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-3">
          <span className="text-[10px] text-[#7A889B] uppercase block">Margin Level</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 mt-1 block">
            {stats.marginLevelPct}%
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Order Ticket (4 cols) + Open Positions Table (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Simulated Order Ticket */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-w-0">
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-3 flex items-center justify-between">
              <span>SIMULATED ORDER TICKET</span>
              <span className="text-[10px] text-[#2589FF] font-semibold">{selectedSymbol.symbol}</span>
            </h3>

            <form onSubmit={handleExecuteTicket} className="space-y-3 font-mono text-xs">
              {/* Buy / Sell Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#080A0F] rounded-lg border border-[#1A2230]">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 rounded-md font-bold text-xs transition cursor-pointer ${
                    orderSide === 'BUY'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50 shadow-sm shadow-emerald-950'
                      : 'text-[#7A889B] hover:text-white'
                  }`}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 rounded-md font-bold text-xs transition cursor-pointer ${
                    orderSide === 'SELL'
                      ? 'bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/50 shadow-sm shadow-[#FF3B4F]/20'
                      : 'text-[#7A889B] hover:text-white'
                  }`}
                >
                  SELL (SHORT)
                </button>
              </div>

              {/* Current Mark Price */}
              <div className="bg-[#080A0F] border border-[#1A2230] p-2.5 rounded-lg flex justify-between items-center">
                <span className="text-[#7A889B]">Current Mark Price:</span>
                <span className="text-white font-bold text-sm">
                  ${currentPrice.toFixed(selectedSymbol.precision)}
                </span>
              </div>

              {/* Lot Size / Volume */}
              <div>
                <label className="text-[11px] text-[#7A889B] block mb-1">
                  Lot Size (Standard Contracts):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={lotSize}
                    onChange={e => setLotSize(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="flex-1 bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#2589FF]"
                  />
                  <div className="flex gap-1">
                    {[0.5, 1.0, 2.0].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setLotSize(size)}
                        className={`px-2 py-1.5 rounded bg-[#080A0F] border border-[#1A2230] text-[10px] text-[#94A3B8] hover:text-white cursor-pointer ${
                          lotSize === size ? 'border-[#2589FF] text-[#2589FF]' : ''
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SL / TP Config Toggle */}
              <div className="pt-2 border-t border-[#1A2230]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomSlTp}
                      onChange={e => setUseCustomSlTp(e.target.checked)}
                      className="accent-[#2589FF] rounded"
                    />
                    <span>Custom SL & TP Targets</span>
                  </label>
                </div>

                {useCustomSlTp && (
                  <div className="space-y-2 bg-[#080A0F] p-2.5 rounded-lg border border-[#1A2230] text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#FF3B4F]">Stop Loss ({slPercent}%):</span>
                      <span className="font-bold text-[#FF3B4F]">${calculatedSl.toFixed(selectedSymbol.precision)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400">Take Profit ({tpPercent}%):</span>
                      <span className="font-bold text-emerald-400">${calculatedTp.toFixed(selectedSymbol.precision)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold font-mono text-xs transition cursor-pointer shadow-lg mt-2 ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                    : 'bg-[#FF3B4F] hover:bg-[#E02E42] text-white shadow-[#FF3B4F]/20'
                }`}
              >
                Place Simulated {orderSide} Order ({lotSize} Lot)
              </button>
            </form>
          </div>
        </div>

        {/* Right: Open Positions Table */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-[#0E1420] border-b border-[#1A2230] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2589FF]" />
                <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase">
                  Active Simulated Positions
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#080A0F] text-[#2589FF] font-mono border border-[#1A2230]">
                  {openTrades.length} Open
                </span>
              </div>
            </div>

            <div className="overflow-x-auto p-2">
              {openTrades.length === 0 ? (
                <div className="text-center py-16 text-[#7A889B] text-xs font-mono">
                  <Layers className="w-8 h-8 stroke-1 mx-auto mb-2 text-[#7A889B]" />
                  <p className="text-white font-semibold">No open simulated positions.</p>
                  <p className="text-[11px] text-[#7A889B] mt-1">
                    Use the order ticket on the left or click BUY / SELL on the chart.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[700px] text-left text-xs font-mono-numbers">
                  <thead>
                    <tr className="border-b border-[#1A2230] text-[#7A889B] text-[11px] font-mono">
                      <th className="pb-2.5 pl-2">Time</th>
                      <th className="pb-2.5">Symbol</th>
                      <th className="pb-2.5">Side</th>
                      <th className="pb-2.5">Volume</th>
                      <th className="pb-2.5">Entry</th>
                      <th className="pb-2.5">Mark</th>
                      <th className="pb-2.5">SL</th>
                      <th className="pb-2.5">TP</th>
                      <th className="pb-2.5 text-right">Simulated P/L</th>
                      <th className="pb-2.5 pr-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2230]">
                    {openTrades.map(trade => {
                      const isProfit = trade.pnl >= 0;
                      return (
                        <tr key={trade.id} className="hover:bg-[#1A2230]/50 transition">
                          <td className="py-2.5 pl-2 text-[#7A889B] text-[11px]">
                            {new Date(trade.openedAt).toLocaleTimeString()}
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
                          <td className="py-2.5 font-bold text-white">${trade.currentPrice.toFixed(selectedSymbol.precision)}</td>
                          <td className="py-2.5 text-[#FF3B4F]">${trade.stopLoss.toFixed(selectedSymbol.precision)}</td>
                          <td className="py-2.5 text-emerald-400">${trade.takeProfit.toFixed(selectedSymbol.precision)}</td>
                          <td className={`py-2.5 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-[#FF3B4F]'}`}>
                            {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                          </td>
                          <td className="py-2.5 pr-2 text-right">
                            <button
                              onClick={() => onCloseTrade(trade.id)}
                              className="px-2.5 py-1 rounded bg-[#FF3B4F]/10 hover:bg-[#FF3B4F]/20 text-[#FF3B4F] border border-[#FF3B4F]/40 text-[10px] font-bold transition cursor-pointer"
                            >
                              Close
                            </button>
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
      </div>
    </div>
  );
};
