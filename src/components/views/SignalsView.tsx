import React, { useState, useMemo } from 'react';
import { TradingSignal, MarketSymbol, BotRiskSettings } from '../../types/trading';
import { 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  MinusCircle, 
  Filter, 
  Search, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BarChart2,
  Clock,
  Layers
} from 'lucide-react';

interface SignalsViewProps {
  currentSignal: TradingSignal | null;
  signalHistory: TradingSignal[];
  selectedSymbol: MarketSymbol;
  settings: BotRiskSettings;
  onExecuteSignal: (signal: TradingSignal) => void;
  onSymbolChange: (symbol: MarketSymbol) => void;
}

export const SignalsView: React.FC<SignalsViewProps> = ({
  currentSignal,
  signalHistory,
  selectedSymbol,
  settings,
  onExecuteSignal,
}) => {
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(50);

  const filteredSignals = useMemo(() => {
    return signalHistory.filter(sig => {
      const matchSym = filterSymbol === 'ALL' || sig.symbol.includes(filterSymbol);
      const matchType = filterType === 'ALL' || sig.type === filterType;
      const matchConf = sig.confidence >= minConfidence;
      return matchSym && matchType && matchConf;
    });
  }, [signalHistory, filterSymbol, filterType, minConfidence]);

  const buyCount = signalHistory.filter(s => s.type === 'BUY').length;
  const sellCount = signalHistory.filter(s => s.type === 'SELL').length;
  const holdCount = signalHistory.filter(s => s.type === 'HOLD').length;

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF] shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                ALGORITHMIC TRADING SIGNALS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-semibold">
                QUANT FEED ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#7A889B] truncate mt-0.5">
              Deterministic multi-indicator confluence triggers • Non-fabricated institutional paper signals
            </p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-[#080A0F] border border-[#1A2230] text-emerald-400 font-bold">
            BUY: {buyCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#080A0F] border border-[#1A2230] text-[#FF3B4F] font-bold">
            SELL: {sellCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#080A0F] border border-[#1A2230] text-amber-400 font-bold">
            HOLD: {holdCount}
          </span>
        </div>
      </div>

      {/* Hero Active Signal Banner */}
      {currentSignal && (
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left Signal Info */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`p-3.5 rounded-xl shrink-0 ${
                currentSignal.type === 'BUY'
                  ? 'bg-[#2589FF] text-white shadow-lg shadow-[#2589FF]/30'
                  : currentSignal.type === 'SELL'
                  ? 'bg-[#FF3B4F] text-white shadow-lg shadow-[#FF3B4F]/30'
                  : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}>
                {currentSignal.type === 'BUY' ? (
                  <TrendingUp className="w-6 h-6 stroke-2" />
                ) : currentSignal.type === 'SELL' ? (
                  <TrendingDown className="w-6 h-6 stroke-2" />
                ) : (
                  <MinusCircle className="w-6 h-6 stroke-2" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080A0F] border border-[#1A2230] text-[#7A889B]">
                    LATEST SIGNAL TICK
                  </span>
                  <span className="text-xs font-mono text-[#7A889B]">
                    {new Date(currentSignal.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {currentSignal.type} {currentSignal.symbol}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    currentSignal.type === 'BUY'
                      ? 'bg-[#2589FF]/15 text-[#2589FF] border border-[#2589FF]/40'
                      : currentSignal.type === 'SELL'
                      ? 'bg-[#FF3B4F]/15 text-[#FF3B4F] border border-[#FF3B4F]/40'
                      : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                  }`}>
                    {currentSignal.confidence}% Confidence
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] font-sans mt-1">
                  <strong className="text-white">{currentSignal.ruleTitle}</strong>: {currentSignal.explanation}
                </p>
              </div>
            </div>

            {/* Price Levels & Quick Execute */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="grid grid-cols-3 gap-2 bg-[#080A0F] p-2.5 rounded-xl border border-[#1A2230] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#7A889B] block">ENTRY</span>
                  <span className="font-bold text-white">${currentSignal.price.toFixed(selectedSymbol.precision)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#FF3B4F] block">STOP LOSS</span>
                  <span className="font-bold text-[#FF3B4F]">${currentSignal.stopLossRef.toFixed(selectedSymbol.precision)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">TAKE PROFIT</span>
                  <span className="font-bold text-emerald-400">${currentSignal.takeProfitRef.toFixed(selectedSymbol.precision)}</span>
                </div>
              </div>

              {currentSignal.type !== 'HOLD' && (
                <button
                  onClick={() => onExecuteSignal(currentSignal)}
                  className="px-4 py-3 rounded-xl bg-[#2589FF] hover:bg-[#1D74DB] text-white font-mono font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2589FF]/25 shrink-0"
                >
                  <span>Execute {currentSignal.type}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Filter and Historical Signal Log Table */}
      <div className="bg-[#11151D] border border-[#1A2230] rounded-xl overflow-hidden shadow-2xl">
        {/* Table Filter Toolbar */}
        <div className="p-3 bg-[#0E1420] border-b border-[#1A2230] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#7A889B]">
              <Filter className="w-3.5 h-3.5 text-[#2589FF]" />
              <span>Filter Signals:</span>
            </div>

            {/* Symbol Filter */}
            <select
              value={filterSymbol}
              onChange={e => setFilterSymbol(e.target.value)}
              className="bg-[#080A0F] border border-[#1A2230] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2589FF]"
            >
              <option value="ALL">All Symbols</option>
              <option value="XAUUSD">XAUUSD (Gold)</option>
              <option value="BTCUSD">BTCUSD</option>
              <option value="ETHUSD">ETHUSD</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
            </select>

            {/* Direction Filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#080A0F] border border-[#1A2230] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2589FF]"
            >
              <option value="ALL">All Actions</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
              <option value="HOLD">HOLD Only</option>
            </select>

            {/* Confidence Slider */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#7A889B] bg-[#080A0F] px-2.5 py-1 rounded-lg border border-[#1A2230]">
              <span>Min Conf:</span>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={minConfidence}
                onChange={e => setMinConfidence(Number(e.target.value))}
                className="w-20 accent-[#2589FF] cursor-pointer"
              />
              <span className="text-[#2589FF] font-bold">{minConfidence}%</span>
            </div>
          </div>

          <span className="text-xs text-[#7A889B] font-mono self-end sm:self-auto">
            Showing {filteredSignals.length} of {signalHistory.length} signals
          </span>
        </div>

        {/* Table Container with forced horizontal scroll wrapper */}
        <div className="overflow-x-auto p-2">
          {filteredSignals.length === 0 ? (
            <div className="text-center py-12 text-[#7A889B] text-xs font-mono">
              No signals match the selected filter criteria.
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-xs font-mono-numbers">
              <thead>
                <tr className="border-b border-[#1A2230] text-[#7A889B] text-[11px] font-mono">
                  <th className="pb-2.5 pl-2">Time</th>
                  <th className="pb-2.5">Symbol</th>
                  <th className="pb-2.5">Signal</th>
                  <th className="pb-2.5">Entry Ref</th>
                  <th className="pb-2.5">Stop Loss</th>
                  <th className="pb-2.5">Take Profit</th>
                  <th className="pb-2.5">Confidence</th>
                  <th className="pb-2.5 pr-2">Strategy Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2230]">
                {filteredSignals.map(sig => (
                  <tr key={sig.id} className="hover:bg-[#1A2230]/50 transition">
                    <td className="py-2.5 pl-2 text-[#7A889B] text-[11px]">
                      {new Date(sig.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 font-bold text-white">
                      {sig.symbol}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sig.type === 'BUY'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : sig.type === 'SELL'
                          ? 'bg-[#FF3B4F]/10 text-[#FF3B4F] border border-[#FF3B4F]/40'
                          : 'bg-amber-950/30 text-amber-400 border border-amber-800/30'
                      }`}>
                        {sig.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-white font-semibold">
                      ${sig.price.toFixed(selectedSymbol.precision)}
                    </td>
                    <td className="py-2.5 text-[#FF3B4F]">
                      ${sig.stopLossRef.toFixed(selectedSymbol.precision)}
                    </td>
                    <td className="py-2.5 text-emerald-400">
                      ${sig.takeProfitRef.toFixed(selectedSymbol.precision)}
                    </td>
                    <td className="py-2.5 font-bold text-[#2589FF]">
                      {sig.confidence}%
                    </td>
                    <td className="py-2.5 pr-2 text-[#94A3B8] text-[11px] max-w-[320px] truncate">
                      <strong className="text-white">{sig.ruleTitle}</strong>: {sig.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
