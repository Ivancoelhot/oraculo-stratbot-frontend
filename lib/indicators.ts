export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  out.push(prev);
  for (let i=1;i<values.length;i++) {
    const v = values[i] * k + prev * (1 - k);
    out.push(v);
    prev = v;
  }
  return out;
}

export function rsi(values: number[], period=14): number[] {
  let gains = 0, losses = 0;
  for (let i=1;i<=period;i++) {
    const diff = values[i] - values[i-1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains/period, avgLoss = losses/period;
  const out: number[] = Array(period).fill(50);
  for (let i=period+1;i<values.length;i++) {
    const diff = values[i] - values[i-1];
    const gain = Math.max(0, diff);
    const loss = Math.max(0, -diff);
    avgGain = (avgGain*(period-1)+gain)/period;
    avgLoss = (avgLoss*(period-1)+loss)/period;
    const rs = avgLoss === 0 ? 100 : avgGain/avgLoss;
    const r = 100 - (100/(1+rs));
    out.push(r);
  }
  return out;
}

export function macd(values: number[], fast=12, slow=26, signal=9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = emaFast.map((v, i) => v - (emaSlow[i] ?? v));
  const signalLine = ema(macdLine, signal);
  const hist = macdLine.map((v, i) => v - (signalLine[i] ?? v));
  return { macdLine, signalLine, hist };
}

export function parabolicSAR(candles: Candle[], afStep=0.02, afMax=0.2) {
  // Simplified PSAR
  const psar:number[] = [];
  let isUp = true;
  let af = afStep;
  let ep = candles[0].high;
  let sar = candles[0].low;

  for (let i=0;i<candles.length;i++) {
    const c = candles[i];
    sar = sar + af * (ep - sar);
    if (isUp) {
      if (c.low < sar) { isUp = false; sar = ep; ep = c.low; af = afStep; }
      else if (c.high > ep) { ep = c.high; af = Math.min(af+afStep, afMax); }
    } else {
      if (c.high > sar) { isUp = true; sar = ep; ep = c.high; af = afStep; }
      else if (c.low < ep) { ep = c.low; af = Math.min(af+afStep, afMax); }
    }
    psar.push(sar);
  }
  return psar;
}

export function volumeSurge(volumes: number[], lookback=20, multiplier=2) {
  const out:boolean[] = [];
  for (let i=0;i<volumes.length;i++) {
    if (i<lookback) { out.push(false); continue; }
    const window = volumes.slice(i-lookback, i);
    const avg = window.reduce((a,b)=>a+b,0)/window.length;
    out.push(volumes[i] >= multiplier*avg);
  }
  return out;
}
