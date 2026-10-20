import React, { useState, useRef, useMemo } from 'react';
import { Candle, IndicatorSettings, MarketSymbol, SimulatedTrade, TradingSignal, PriceAlert } from '../types/trading';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Bell, X } from 'lucide-react';

interface CandlestickChartProps {
  candles: Candle[];
  symbolInfo: MarketSymbol;
  indicators: IndicatorSettings;
  activeTrades: SimulatedTrade[];
  currentSignal: TradingSignal | null;
  onManualOrder?: (side: 'BUY' | 'SELL') => void;
  alerts?: PriceAlert[];
  activeTriggeredNotice?: PriceAlert | null;
  onDismissAlertNotice?: () => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  symbolInfo,
  indicators,
  activeTrades,
  currentSignal,
  onManualOrder,
  alerts = [],
  activeTriggeredNotice = null,
  onDismissAlertNotice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(60); // Zoom level: 35 (close), 60 (normal), 80 (wide)

  // Chart Dimensions
  const chartHeight = 400;
  const rsiHeight = indicators.showRsi ? 115 : 0;
  const padding = { top: 25, right: 80, bottom: 25, left: 12 };
  const width = 960; // Coordinate scale width

  // Slice visible candles according to zoom level
  const displayedCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    return candles.slice(-visibleCount);
  }, [candles, visibleCount]);

  // Price Extents for scaling
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (!displayedCandles || displayedCandles.length === 0) {
      return { minPrice: 1, maxPrice: 2, priceRange: 1 };
    }

    let min = Infinity;
    let max = -Infinity;

    displayedCandles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;

      if (indicators.showEma20 && c.ema20) {
        if (c.ema20 < min) min = c.ema20;
        if (c.ema20 > max) max = c.ema20;
      }
      if (indicators.showEma50 && c.ema50) {
        if (c.ema50 < min) min = c.ema50;
        if (c.ema50 > max) max = c.ema50;
      }
    });

    // Also include active trade or signal SL/TP if nearby
    activeTrades.forEach(t => {
      if (t.symbol === symbolInfo.symbol) {
        if (t.stopLoss < min) min = t.stopLoss;
        if (t.takeProfit > max) max = t.takeProfit;
      }
    });

    if (currentSignal && currentSignal.symbol === symbolInfo.symbol) {
      if (currentSignal.stopLossRef < min) min = currentSignal.stopLossRef;
      if (currentSignal.takeProfitRef > max) max = currentSignal.takeProfitRef;
    }

    alerts.forEach(a => {
      if (a.symbol === symbolInfo.symbol && (!a.triggered || activeTriggeredNotice?.id === a.id)) {
        if (a.targetPrice < min) min = a.targetPrice;
        if (a.targetPrice > max) max = a.targetPrice;
      }
    });

    const buffer = (max - min) * 0.08 || min * 0.01;
    const finalMin = min - buffer;
    const finalMax = max + buffer;
    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      priceRange: finalMax - finalMin || 1,
    };
  }, [displayedCandles, indicators, activeTrades, currentSignal, symbolInfo.symbol, alerts, activeTriggeredNotice]);

  // Candle calculations
  const count = displayedCandles.length;
  const chartPlotWidth = width - padding.left - padding.right;
  const candleSpacing = count > 0 ? chartPlotWidth / count : 12;
  const candleBodyWidth = Math.max(2.5, Math.min(12, candleSpacing * 0.72));

  // Coordinate mappings
  const getX = (index: number) => padding.left + index * candleSpacing + candleSpacing / 2;
  const getY = (price: number) => {
    return padding.top + (1 - (price - minPrice) / priceRange) * (chartHeight - padding.top - padding.bottom);
  };

  // RSI Coordinate mapping (0 to 100)
  const getRsiY = (rsiVal: number) => {
    const rsiPlotHeight = rsiHeight - 35;
    const topY = chartHeight + 15;
    return topY + (1 - rsiVal / 100) * rsiPlotHeight;
  };

  // Mouse Move Handler for Crosshair and Tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - svgRect.left;
    const rawY = e.clientY - svgRect.top;
    
    // Convert client coords to SVG coords
    const scaleX = width / svgRect.width;
    const scaleY = (chartHeight + rsiHeight) / svgRect.height;
    const svgX = rawX * scaleX;
    const svgY = rawY * scaleY;

    setMousePos({ x: svgX, y: svgY });

    // Determine nearest candle index
    const relX = svgX - padding.left;
    const idx = Math.floor(relX / candleSpacing);
    if (idx >= 0 && idx < displayedCandles.length) {
      setHoverIndex(idx);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  // Zoom handlers
  const handleZoomIn = () => setVisibleCount(c => Math.max(25, c - 15));
  const handleZoomOut = () => setVisibleCount(c => Math.min(candles.length, c + 15));
  const handleResetZoom = () => setVisibleCount(60);

  // Generate EMA polyline paths
  const ema20Path = useMemo(() => {
    if (!indicators.showEma20) return '';
    let path = '';
    displayedCandles.forEach((c, i) => {
      if (c.ema20 !== undefined) {
        const x = getX(i);
        const y = getY(c.ema20);
        path += `${path === '' ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    });
    return path;
  }, [displayedCandles, indicators.showEma20, minPrice, priceRange]);

  const ema50Path = useMemo(() => {
    if (!indicators.showEma50) return '';
    let path = '';
    displayedCandles.forEach((c, i) => {
      if (c.ema50 !== undefined) {
        const x = getX(i);
        const y = getY(c.ema50);
        path += `${path === '' ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    });
    return path;
  }, [displayedCandles, indicators.showEma50, minPrice, priceRange]);

  // Generate RSI polyline path
  const rsiPath = useMemo(() => {
    if (!indicators.showRsi) return '';
    let path = '';
    displayedCandles.forEach((c, i) => {
      if (c.rsi !== undefined) {
        const x = getX(i);
        const y = getRsiY(c.rsi);
        path += `${path === '' ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    });
    return path;
  }, [displayedCandles, indicators.showRsi]);

  const activeCandle = hoverIndex !== null && displayedCandles[hoverIndex] 
    ? displayedCandles[hoverIndex] 
    : displayedCandles[displayedCandles.length - 1];

  // Grid price ticks (5 intervals)
  const priceGridTicks = useMemo(() => {
    const ticks = [];
    const step = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const priceVal = minPrice + step * i;
      ticks.push(priceVal);
    }
    return ticks;
  }, [minPrice, priceRange]);

  const latestCandle = displayedCandles[displayedCandles.length - 1];
  const latestPrice = latestCandle ? latestCandle.close : symbolInfo.basePrice;

  return (
    <div className={`flex flex-col bg-[#11151D] border rounded-xl overflow-hidden shadow-2xl relative transition-all duration-300 min-w-0 w-full ${
      activeTriggeredNotice ? 'border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40' : 'border-[#1A2230]'
    }`}>
      
      {/* Top Chart Navigation & Active Data Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1A2230] bg-[#11151D] text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono tracking-wide">
              {symbolInfo.symbol}
            </span>
            <span className="text-[10px] text-[#2589FF] font-mono border border-[#2589FF]/40 bg-[#2589FF]/10 px-1.5 py-0.2 rounded font-semibold">
              Salahuddin AI Chart
            </span>
            <span className="text-[10px] text-[#7A889B] font-mono border border-[#1A2230] bg-[#080A0F] px-1.5 py-0.2 rounded">
              Simulated OHLC
            </span>
          </div>

          {activeCandle && (
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono-numbers text-slate-300">
              <span>Time: <strong className="text-white">{activeCandle.timeStr}</strong></span>
              <span>O: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#00E599]' : 'text-[#FF3B4F]'}>{activeCandle.open.toFixed(symbolInfo.precision)}</strong></span>
              <span>H: <strong className="text-white">{activeCandle.high.toFixed(symbolInfo.precision)}</strong></span>
              <span>L: <strong className="text-white">{activeCandle.low.toFixed(symbolInfo.precision)}</strong></span>
              <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#00E599]' : 'text-[#FF3B4F]'}>{activeCandle.close.toFixed(symbolInfo.precision)}</strong></span>
              <span className="hidden md:inline text-[#7A889B]">Vol: <strong className="text-slate-300">{activeCandle.volume}</strong></span>
            </div>
          )}
        </div>

        {/* Legend & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Indicator Legends */}
          <div className="flex items-center gap-2.5 text-[11px] font-mono">
            {indicators.showEma20 && (
              <span className="flex items-center gap-1 text-[#2589FF] font-medium">
                <span className="w-2.5 h-0.5 bg-[#2589FF] inline-block rounded" />
                EMA 20: {activeCandle?.ema20?.toFixed(symbolInfo.precision) ?? '--'}
              </span>
            )}
            {indicators.showEma50 && (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />
                EMA 50: {activeCandle?.ema50?.toFixed(symbolInfo.precision) ?? '--'}
              </span>
            )}
            {indicators.showRsi && (
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2.5 h-0.5 bg-purple-400 inline-block" />
                RSI 14: {activeCandle?.rsi?.toFixed(1) ?? '--'}
              </span>
            )}
          </div>

          {/* Zoom / Reset Buttons */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Zoom In (Fewer bars)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Zoom Out (More bars)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Reset Zoom to 60 bars"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Chart Surface */}
      <div className="relative w-full overflow-hidden select-none bg-[#090d14]" ref={containerRef}>
        
        {/* Subtle Visual Price Alert Notification Overlay on the Chart */}
        {activeTriggeredNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-amber-950/95 border border-amber-500/80 text-amber-200 text-xs shadow-2xl backdrop-blur-md">
            <Bell className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="font-bold text-amber-300">ALERT:</span>
              <span className="text-white font-semibold">{activeTriggeredNotice.symbol}</span>
              <span className="text-slate-300">
                {activeTriggeredNotice.condition === 'ABOVE' ? 'crossed ≥' : 'crossed ≤'} {activeTriggeredNotice.targetPrice.toFixed(symbolInfo.precision)}
              </span>
              {activeTriggeredNotice.label && (
                <span className="text-amber-400">({activeTriggeredNotice.label})</span>
              )}
            </div>
            {onDismissAlertNotice && (
              <button
                onClick={onDismissAlertNotice}
                className="ml-2 text-slate-400 hover:text-white p-0.5 rounded transition"
                title="Dismiss Notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${chartHeight + rsiHeight}`}
          className="w-full h-auto cursor-crosshair block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="chart-grid" width="48" height="40" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 40" fill="none" stroke="#172030" strokeWidth="0.6" strokeOpacity="0.4" />
            </pattern>
            {/* RSI Shaded Gradient */}
            <linearGradient id="rsi-zone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartPlotWidth}
            height={chartHeight - padding.top - padding.bottom}
            fill="#080A0F"
          />
          <rect
            x={padding.left}
            y={padding.top}
            width={chartPlotWidth}
            height={chartHeight - padding.top - padding.bottom}
            fill="url(#chart-grid)"
          />

          {/* Price Scale Grid Lines & Labels */}
          {priceGridTicks.map((price, i) => {
            const y = getY(price);
            return (
              <g key={`price-grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#172233"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - padding.right + 8}
                  y={y + 3.5}
                  fill="#627288"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="start"
                >
                  {price.toFixed(symbolInfo.precision)}
                </text>
              </g>
            );
          })}

          {/* Volume histogram at bottom of price chart */}
          {displayedCandles.map((c, i) => {
            const x = getX(i);
            const isBullish = c.close >= c.open;
            const maxVol = Math.max(...displayedCandles.map(dc => dc.volume)) || 1000;
            const volHeight = (c.volume / maxVol) * 45;
            const volY = chartHeight - padding.bottom - volHeight;

            return (
              <rect
                key={`vol-${i}`}
                x={x - candleBodyWidth / 2}
                y={volY}
                width={candleBodyWidth}
                height={volHeight}
                fill={isBullish ? '#0d9488' : '#e11d48'}
                opacity="0.18"
              />
            );
          })}

          {/* Candlestick Bars */}
          {displayedCandles.map((c, i) => {
            const x = getX(i);
            const isBullish = c.close >= c.open;
            const candleColor = isBullish ? '#00E599' : '#FF3B4F';
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

            return (
              <g key={`candle-${c.time}-${i}`} opacity={hoverIndex !== null && hoverIndex !== i ? 0.8 : 1}>
                {/* Wicks */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1.2"
                />
                {/* Candle Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={candleColor}
                  rx="1"
                />

                {/* Signal Candle Markers (BUY / SELL badges directly on the chart) */}
                {c.signalMarker === 'BUY' && (
                  <g>
                    <polygon
                      points={`${x},${lowY + 14} ${x - 5},${lowY + 22} ${x + 5},${lowY + 22}`}
                      fill="#00E599"
                    />
                    <text
                      x={x}
                      y={lowY + 31}
                      fill="#00E599"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      BUY
                    </text>
                  </g>
                )}

                {c.signalMarker === 'SELL' && (
                  <g>
                    <polygon
                      points={`${x},${highY - 14} ${x - 5},${highY - 22} ${x + 5},${highY - 22}`}
                      fill="#FF3B4F"
                    />
                    <text
                      x={x}
                      y={highY - 25}
                      fill="#FF3B4F"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      SELL
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* EMA 20 Overlay Line - Electric Blue */}
          {indicators.showEma20 && ema20Path && (
            <path
              d={ema20Path}
              fill="none"
              stroke="#2589FF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* EMA 50 Overlay Line */}
          {indicators.showEma50 && ema50Path && (
            <path
              d={ema50Path}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Signal Reference Levels: Entry, Stop-Loss, Take-Profit */}
          {currentSignal && currentSignal.symbol === symbolInfo.symbol && (
            <g key={`sig-levels-${currentSignal.id}`}>
              {/* Entry Reference Level */}
              <line
                x1={padding.left}
                y1={getY(currentSignal.price)}
                x2={width - padding.right}
                y2={getY(currentSignal.price)}
                stroke="#2589FF"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <rect
                x={width - padding.right + 3}
                y={getY(currentSignal.price) - 8}
                width="72"
                height="16"
                fill="#2589FF"
                rx="2"
              />
              <text
                x={width - padding.right + 6}
                y={getY(currentSignal.price) + 3.5}
                fill="#ffffff"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                ENTRY: {currentSignal.price.toFixed(symbolInfo.precision)}
              </text>

              {/* Take-Profit Reference Level */}
              <line
                x1={padding.left}
                y1={getY(currentSignal.takeProfitRef)}
                x2={width - padding.right}
                y2={getY(currentSignal.takeProfitRef)}
                stroke="#00E599"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <rect
                x={width - padding.right + 3}
                y={getY(currentSignal.takeProfitRef) - 8}
                width="72"
                height="16"
                fill="#00B377"
                rx="2"
              />
              <text
                x={width - padding.right + 6}
                y={getY(currentSignal.takeProfitRef) + 3.5}
                fill="#ffffff"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                TP: {currentSignal.takeProfitRef.toFixed(symbolInfo.precision)}
              </text>

              {/* Stop-Loss Reference Level */}
              <line
                x1={padding.left}
                y1={getY(currentSignal.stopLossRef)}
                x2={width - padding.right}
                y2={getY(currentSignal.stopLossRef)}
                stroke="#FF3B4F"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <rect
                x={width - padding.right + 3}
                y={getY(currentSignal.stopLossRef) - 8}
                width="72"
                height="16"
                fill="#FF3B4F"
                rx="2"
              />
              <text
                x={width - padding.right + 6}
                y={getY(currentSignal.stopLossRef) + 3.5}
                fill="#ffffff"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                SL: {currentSignal.stopLossRef.toFixed(symbolInfo.precision)}
              </text>
            </g>
          )}

          {/* Current Live Simulated Price Reference Marker */}
          {latestCandle && (
            <g>
              <line
                x1={padding.left}
                y1={getY(latestPrice)}
                x2={width - padding.right}
                y2={getY(latestPrice)}
                stroke="#2589FF"
                strokeWidth="1.4"
                strokeDasharray="2 2"
              />
              <rect
                x={width - padding.right + 3}
                y={getY(latestPrice) - 9}
                width="74"
                height="18"
                fill="#2589FF"
                rx="2"
              />
              <text
                x={width - padding.right + 7}
                y={getY(latestPrice) + 4}
                fill="#ffffff"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {latestPrice.toFixed(symbolInfo.precision)}
              </text>
            </g>
          )}

          {/* Custom Price Alert Thresholds Drawn on the Chart */}
          {alerts && alerts.filter(a => a.symbol === symbolInfo.symbol && !a.triggered).map(alert => {
            const alertY = getY(alert.targetPrice);
            return (
              <g key={`alert-threshold-${alert.id}`} className="transition-opacity duration-300">
                <line
                  x1={padding.left}
                  y1={alertY}
                  x2={width - padding.right}
                  y2={alertY}
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  strokeOpacity="0.85"
                />
                <rect
                  x={width - padding.right + 2}
                  y={alertY - 8}
                  width="78"
                  height="16"
                  fill="#78350f"
                  stroke="#f59e0b"
                  strokeWidth="0.8"
                  rx="2"
                />
                <text
                  x={width - padding.right + 5}
                  y={alertY + 3.5}
                  fill="#fef3c7"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  {alert.condition === 'ABOVE' ? '▲' : '▼'} {alert.targetPrice.toFixed(symbolInfo.precision)}
                </text>
              </g>
            );
          })}

          {/* Triggered Price Alert Glowing Beacon on the Chart */}
          {activeTriggeredNotice && activeTriggeredNotice.symbol === symbolInfo.symbol && (() => {
            const trigY = getY(activeTriggeredNotice.targetPrice);
            return (
              <g key={`triggered-alert-highlight-${activeTriggeredNotice.id}`}>
                {/* Luminous background beam */}
                <line
                  x1={padding.left}
                  y1={trigY}
                  x2={width - padding.right}
                  y2={trigY}
                  stroke="#f59e0b"
                  strokeWidth="5"
                  strokeOpacity="0.25"
                />
                {/* Core alert line */}
                <line
                  x1={padding.left}
                  y1={trigY}
                  x2={width - padding.right}
                  y2={trigY}
                  stroke="#fbbf24"
                  strokeWidth="1.8"
                  strokeDasharray="6 3"
                />
                {/* Pulsing indicator tag */}
                <rect
                  x={width - padding.right + 2}
                  y={trigY - 9}
                  width="86"
                  height="18"
                  fill="#b45309"
                  stroke="#fde68a"
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={width - padding.right + 6}
                  y={trigY + 3.5}
                  fill="#ffffff"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  ⚡ TRIGGERED
                </text>
              </g>
            );
          })()}

          {/* Time axis ticks along bottom of price chart */}
          {displayedCandles.filter((_, idx) => idx % Math.max(1, Math.floor(count / 6)) === 0).map((c, i) => {
            const originalIndex = displayedCandles.indexOf(c);
            const x = getX(originalIndex);
            return (
              <text
                key={`time-tick-${i}`}
                x={x}
                y={chartHeight - 6}
                fill="#627288"
                fontSize="9.5"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {c.timeStr}
              </text>
            );
          })}

          {/* Sub-Chart: RSI 14 Panel */}
          {indicators.showRsi && (
            <g transform={`translate(0, 0)`}>
              {/* Divider between Main Chart & RSI */}
              <line
                x1={padding.left}
                y1={chartHeight}
                x2={width - padding.right}
                y2={chartHeight}
                stroke="#1f293d"
                strokeWidth="1.5"
              />

              {/* RSI Subchart Background */}
              <rect
                x={padding.left}
                y={chartHeight + 1}
                width={chartPlotWidth}
                height={rsiHeight - 2}
                fill="#070a10"
              />

              {/* RSI Boundaries */}
              {/* Overbought 70 Line */}
              <line
                x1={padding.left}
                y1={getRsiY(70)}
                x2={width - padding.right}
                y2={getRsiY(70)}
                stroke="#f43f5e"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.7"
              />
              <text
                x={width - padding.right + 6}
                y={getRsiY(70) + 3}
                fill="#f43f5e"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                70 OB
              </text>

              {/* Median 50 Line */}
              <line
                x1={padding.left}
                y1={getRsiY(50)}
                x2={width - padding.right}
                y2={getRsiY(50)}
                stroke="#475569"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <text
                x={width - padding.right + 6}
                y={getRsiY(50) + 3}
                fill="#64748b"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                50
              </text>

              {/* Oversold 30 Line */}
              <line
                x1={padding.left}
                y1={getRsiY(30)}
                x2={width - padding.right}
                y2={getRsiY(30)}
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.7"
              />
              <text
                x={width - padding.right + 6}
                y={getRsiY(30) + 3}
                fill="#10b981"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                30 OS
              </text>

              {/* Shaded band between 30 and 70 */}
              <rect
                x={padding.left}
                y={getRsiY(70)}
                width={chartPlotWidth}
                height={getRsiY(30) - getRsiY(70)}
                fill="url(#rsi-zone)"
              />

              {/* RSI Curve */}
              {rsiPath && (
                <path
                  d={rsiPath}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* RSI Title Tag */}
              <text
                x={padding.left + 8}
                y={chartHeight + 17}
                fill="#c084fc"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                RSI 14: {latestCandle?.rsi?.toFixed(1) ?? '--'}
              </text>
            </g>
          )}

          {/* Interactive Crosshair Tracking */}
          {mousePos && hoverIndex !== null && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={chartHeight + rsiHeight - 5}
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.65"
              />

              {/* Horizontal Crosshair Line in Price Area */}
              {mousePos.y <= chartHeight && (
                <line
                  x1={padding.left}
                  y1={mousePos.y}
                  x2={width - padding.right}
                  y2={mousePos.y}
                  stroke="#94a3b8"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                  opacity="0.65"
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Quick Simulated Order Bar */}
      {onManualOrder && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#11151D] border-t border-[#1A2230] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] font-mono text-[11px]">Instant Simulated Order:</span>
            <span className="text-[11px] text-[#7A889B] font-mono">
              Auto SL: -{(symbolInfo.volatility * 100 * 1.5).toFixed(1)}% | TP: +{(symbolInfo.volatility * 100 * 3.0).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onManualOrder('BUY')}
              className="px-4 py-1.5 bg-[#2589FF] hover:bg-[#1D74DB] text-white font-bold rounded-lg shadow-sm shadow-[#2589FF]/20 transition flex items-center gap-1.5 active:scale-95 cursor-pointer text-xs"
            >
              <span>▲</span>
              <span>SIMULATE BUY</span>
            </button>
            <button
              onClick={() => onManualOrder('SELL')}
              className="px-4 py-1.5 bg-[#FF3B4F] hover:bg-[#E02E41] text-white font-bold rounded-lg shadow-sm shadow-[#FF3B4F]/20 transition flex items-center gap-1.5 active:scale-95 cursor-pointer text-xs"
            >
              <span>▼</span>
              <span>SIMULATE SELL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
