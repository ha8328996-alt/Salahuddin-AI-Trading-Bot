import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEMA, calculateRSI, evaluateTradeState, evaluatePriceAlerts } from './indicators.ts';
import type { SimulatedTrade, PriceAlert } from '../types/trading.ts';

test('calculateEMA computes accurate exponential moving average', () => {
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const ema5 = calculateEMA(prices, 5);
  // first 4 elements should be undefined
  assert.equal(ema5[0], undefined);
  assert.equal(ema5[3], undefined);
  // 5th element is SMA of [10, 11, 12, 13, 14] = 60 / 5 = 12
  assert.equal(ema5[4], 12);
  // Next EMA: multiplier = 2 / (5 + 1) = 0.33333
  // (15 - 12) * 0.33333 + 12 = 13.0
  assert.ok(ema5[5]! > 12.5 && ema5[5]! < 13.5);
});

test('calculateRSI returns values within 0 and 100 for fluctuating data', () => {
  const prices = [
    44, 44.5, 45, 43.5, 44, 45.2, 46, 45.5, 46.5, 47, 46, 45, 44.5, 44.8, 45.5, 46.2, 47.1
  ];
  const rsi = calculateRSI(prices, 14);
  assert.equal(rsi[13], undefined);
  assert.ok(rsi[14] !== undefined);
  assert.ok(rsi[14]! >= 0 && rsi[14]! <= 100);
});

test('evaluateTradeState closes BUY trade when Take Profit is reached', () => {
  const mockTrade: SimulatedTrade = {
    id: 'test-1',
    symbol: 'BTC/USD',
    market: 'crypto',
    side: 'BUY',
    entryPrice: 60000,
    currentPrice: 60000,
    stopLoss: 59000,
    takeProfit: 62000,
    quantity: 1,
    lots: 1,
    margin: 600,
    openedAt: Date.now(),
    status: 'OPEN',
    pnl: 0,
    pnlPercent: 0,
  };

  const result = evaluateTradeState(mockTrade, 62500);
  assert.equal(result.event, 'TAKE_PROFIT');
  assert.equal(result.updatedTrade.status, 'CLOSED');
  assert.equal(result.updatedTrade.exitReason, 'TAKE_PROFIT');
  assert.equal(result.updatedTrade.pnl, 2000); // (62000 - 60000) * 1
});

test('evaluateTradeState closes BUY trade when Stop Loss is breached', () => {
  const mockTrade: SimulatedTrade = {
    id: 'test-2',
    symbol: 'BTC/USD',
    market: 'crypto',
    side: 'BUY',
    entryPrice: 60000,
    currentPrice: 60000,
    stopLoss: 59000,
    takeProfit: 62000,
    quantity: 1,
    lots: 1,
    margin: 600,
    openedAt: Date.now(),
    status: 'OPEN',
    pnl: 0,
    pnlPercent: 0,
  };

  const result = evaluateTradeState(mockTrade, 58800);
  assert.equal(result.event, 'STOP_LOSS');
  assert.equal(result.updatedTrade.status, 'CLOSED');
  assert.equal(result.updatedTrade.exitReason, 'STOP_LOSS');
  assert.equal(result.updatedTrade.pnl, -1000); // (59000 - 60000) * 1
});

test('evaluateTradeState updates floating PnL for active SELL trade', () => {
  const mockTrade: SimulatedTrade = {
    id: 'test-3',
    symbol: 'ETH/USD',
    market: 'crypto',
    side: 'SELL',
    entryPrice: 2500,
    currentPrice: 2500,
    stopLoss: 2600,
    takeProfit: 2300,
    quantity: 2,
    lots: 2,
    margin: 500,
    openedAt: Date.now(),
    status: 'OPEN',
    pnl: 0,
    pnlPercent: 0,
  };

  const result = evaluateTradeState(mockTrade, 2450);
  assert.equal(result.updatedTrade.status, 'OPEN');
  assert.equal(result.updatedTrade.pnl, 100); // (2500 - 2450) * 2 = 100 profit
  assert.equal(result.updatedTrade.pnlPercent, 2);
});

test('evaluatePriceAlerts triggers ABOVE alert when price crosses target', () => {
  const alerts: PriceAlert[] = [
    {
      id: 'a1',
      symbol: 'XAU/USD',
      targetPrice: 2700,
      condition: 'ABOVE',
      createdPrice: 2680,
      createdAt: Date.now(),
      triggered: false,
      label: 'Resistance Test',
    },
    {
      id: 'a2',
      symbol: 'XAU/USD',
      targetPrice: 2750,
      condition: 'ABOVE',
      createdPrice: 2680,
      createdAt: Date.now(),
      triggered: false,
    },
  ];

  const { updatedAlerts, newlyTriggered } = evaluatePriceAlerts(alerts, 2705, 'XAU/USD');
  assert.equal(newlyTriggered.length, 1);
  assert.equal(newlyTriggered[0].id, 'a1');
  assert.equal(newlyTriggered[0].triggered, true);

  const a1 = updatedAlerts.find(a => a.id === 'a1');
  const a2 = updatedAlerts.find(a => a.id === 'a2');
  assert.equal(a1?.triggered, true);
  assert.equal(a2?.triggered, false);
});

test('evaluatePriceAlerts triggers BELOW alert when price drops past target', () => {
  const alerts: PriceAlert[] = [
    {
      id: 'b1',
      symbol: 'BTC/USD',
      targetPrice: 65000,
      condition: 'BELOW',
      createdPrice: 67000,
      createdAt: Date.now(),
      triggered: false,
      label: 'Support breakdown',
    },
  ];

  const { updatedAlerts, newlyTriggered } = evaluatePriceAlerts(alerts, 64950, 'BTC/USD');
  assert.equal(newlyTriggered.length, 1);
  assert.equal(newlyTriggered[0].id, 'b1');
  assert.equal(updatedAlerts[0].triggered, true);
});
