import React, { useState } from 'react';
import { Candle, MarketSymbol, TradingSignal, BotRiskSettings } from '../types/trading';
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, ShieldCheck, Target, AlertTriangle } from 'lucide-react';

interface AiAnalysisCardProps {
  symbolInfo: MarketSymbol;
  timeframe: string;
  candles: Candle[];
  currentSignal: TradingSignal | null;
  settings: BotRiskSettings;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  symbolInfo,
  timeframe,
  candles,
  currentSignal,
  settings,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAnalyzedTime, setLastAnalyzedTime] = useState<string>('Just now');

  const currentPrice = candles[candles.length - 1]?.close || symbolInfo.basePrice;
  const ema20 = candles[candles.length - 1]?.ema20 || currentPrice;
  const ema50 = candles[candles.length - 1]?.ema50 || currentPrice;
  const rsi = candles[candles.length - 1]?.rsi || 50;

  // Synthesize market structure
  const isBullish = ema20 > ema50;
  const supportLevel = Math.min(...candles.slice(-15).map(c => c.low));
  const resistanceLevel = Math.max(...candles.slice(-15).map(c => c.high));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastAnalyzedTime(new Date().toLocaleTimeString());
    }, 600);
  };

  return (
    <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-4 shadow-2xl select-none min-w-0 w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#1A2230] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#080A0F] border border-[#2589FF]/40 text-[#2589FF]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono tracking-wide">
              MARKET STRUCTURE & TRADE PLAN
            </h3>
            <span className="text-[10px] text-[#7A889B] font-mono">
              Multi-timeframe technical confluence model
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-[11px] text-[#7A889B] hover:text-[#2589FF] transition cursor-pointer"
          title="Refresh Analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2589FF]' : ''}`} />
          <span className="font-mono text-[10px]">{lastAnalyzedTime}</span>
        </button>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Bias Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080A0F] border border-[#1A2230]">
          <span className="text-[11px] text-[#94A3B8]">Macro Structural Bias</span>
          <div className="flex items-center gap-1.5 font-bold font-mono">
            {isBullish ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                BULLISH MOMENTUM
              </span>
            ) : (
              <span className="text-[#FF3B4F] flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                BEARISH DRIFT
              </span>
            )}
          </div>
        </div>

        {/* Support & Resistance Levels */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-numbers">
          <div className="bg-[#080A0F] p-2.5 rounded-lg border border-emerald-500/30">
            <div className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">Key Support (15-Bar)</div>
            <div className="font-bold text-white mt-0.5">
              {supportLevel.toFixed(symbolInfo.precision)}
            </div>
          </div>
          <div className="bg-[#080A0F] p-2.5 rounded-lg border border-[#FF3B4F]/30">
            <div className="text-[10px] text-[#FF3B4F] uppercase font-mono tracking-wider">Key Resistance</div>
            <div className="font-bold text-white mt-0.5">
              {resistanceLevel.toFixed(symbolInfo.precision)}
            </div>
          </div>
        </div>

        {/* Algorithmic Synthesis Narrative */}
        <div className="bg-[#080A0F] border border-[#1A2230] rounded-lg p-3 text-[11px] leading-relaxed text-[#94A3B8] space-y-2">
          <div className="flex items-center gap-1.5 text-[#2589FF] font-semibold font-mono text-[10px]">
            <Target className="w-3 h-3" />
            <span>EXECUTION PLAYBOOK ({timeframe.toUpperCase()})</span>
          </div>
          <p>
            {isBullish ? (
              <>
                <strong className="text-white">{symbolInfo.symbol}</strong> is exhibiting bullish trend continuation with <strong className="text-white">EMA 20 ({ema20.toFixed(symbolInfo.precision)})</strong> maintaining a positive spread above <strong className="text-white">EMA 50 ({ema50.toFixed(symbolInfo.precision)})</strong>. RSI at <strong className="text-white">{rsi.toFixed(1)}</strong> indicates sustained buyer momentum.
              </>
            ) : (
              <>
                <strong className="text-white">{symbolInfo.symbol}</strong> is trading below its 20-period moving average with <strong className="text-white">EMA 20 ({ema20.toFixed(symbolInfo.precision)})</strong> below <strong className="text-white">EMA 50</strong>. RSI at <strong className="text-white">{rsi.toFixed(1)}</strong> highlights prevailing selling pressure.
              </>
            )}
          </p>
          <div className="pt-2 border-t border-[#1A2230] text-[10px] text-[#7A889B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Risk parameter active: SL at {settings.stopLossPct}% • TP at {settings.takeProfitPct}% (R:R 1:{(settings.takeProfitPct/settings.stopLossPct).toFixed(1)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
