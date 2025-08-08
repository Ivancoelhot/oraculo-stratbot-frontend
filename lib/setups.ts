import { Candle, ema, rsi, macd, parabolicSAR, volumeSurge } from './indicators';

export type SetupResult = {
  name: string;
  signal: 'buy'|'sell'|'none';
  reason: string;
  entryPrice?: number;
};

export function setupEmaConfluence(candles: Candle[]): SetupResult {
  const closes = candles.map(c=>c.close);
  const e9 = ema(closes, 9);
  const e21 = ema(closes, 21);
  const e50 = ema(closes, 50);
  const n = closes.length-1;
  const bullish = e9[n] > e21[n] && e21[n] > e50[n] && closes[n] > e9[n];
  const bearish = e9[n] < e21[n] && e21[n] < e50[n] && closes[n] < e9[n];
  if (bullish) return { name: 'EMA Confluencer Power', signal:'buy', reason:'EMA9>EMA21>EMA50 e preço acima da EMA9', entryPrice: closes[n] };
  if (bearish) return { name: 'EMA Confluencer Power', signal:'sell', reason:'EMA9<EMA21<EMA50 e preço abaixo da EMA9', entryPrice: closes[n] };
  return { name: 'EMA Confluencer Power', signal:'none', reason:'Sem confluência no momento' };
}

export function setupRsiDivergence(candles: Candle[]): SetupResult {
  const closes = candles.map(c=>c.close);
  const r = rsi(closes, 14);
  const n = closes.length-1;
  // simple check: price higher high but RSI lower high => bearish divergence; and vice versa for bullish
  const high1 = closes[n-1], high2 = closes[n];
  const r1 = r[r.length-2] ?? 50, r2 = r[r.length-1] ?? 50;
  if (high2 > high1 && r2 < r1) return { name:'RSI Divergente', signal:'sell', reason:'HH no preço com LH no RSI', entryPrice: closes[n] };
  if (high2 < high1 && r2 > r1) return { name:'RSI Divergente', signal:'buy', reason:'LH no preço com HH no RSI', entryPrice: closes[n] };
  return { name:'RSI Divergente', signal:'none', reason:'Sem divergência relevante' };
}

export function setupMacdCross(candles: Candle[]): SetupResult {
  const closes = candles.map(c=>c.close);
  const { macdLine, signalLine } = macd(closes);
  const n = macdLine.length-1;
  const prev = macdLine[n-1] - signalLine[n-1];
  const now = macdLine[n] - signalLine[n];
  if (prev <= 0 && now > 0) return { name:'MACD Cruzamento', signal:'buy', reason:'MACD cruzou acima do sinal', entryPrice: closes[closes.length-1] };
  if (prev >= 0 && now < 0) return { name:'MACD Cruzamento', signal:'sell', reason:'MACD cruzou abaixo do sinal', entryPrice: closes[closes.length-1] };
  return { name:'MACD Cruzamento', signal:'none', reason:'Sem cruzamento relevante' };
}

export function setupSarTrend(candles: Candle[]): SetupResult {
  const psar = parabolicSAR(candles);
  const n = candles.length-1;
  const isBull = candles[n].close > psar[n];
  return isBull ?
    { name:'SAR Parabólico Tendência', signal:'buy', reason:'Preço acima do PSAR', entryPrice: candles[n].close } :
    { name:'SAR Parabólico Tendência', signal:'sell', reason:'Preço abaixo do PSAR', entryPrice: candles[n].close };
}

export function setupVolumeSurge(candles: Candle[]): SetupResult {
  const vols = candles.map(c=>c.volume);
  const surge = volumeSurge(vols);
  const n = candles.length-1;
  if (surge[n]) {
    return { name:'Volume Explosivo', signal: 'buy', reason: 'Volume acima de 2x média 20', entryPrice: candles[n].close };
  }
  return { name:'Volume Explosivo', signal:'none', reason:'Sem explosão de volume' };
}

export function detectConfluence(candles: Candle[]) {
  const results = [
    setupEmaConfluence(candles),
    setupRsiDivergence(candles),
    setupMacdCross(candles),
    setupSarTrend(candles),
    setupVolumeSurge(candles),
  ];
  const active = results.filter(r => r.signal !== 'none');
  const score = active.length; // simple confluence score
  const direction = active.filter(a=>a.signal==='buy').length >= active.filter(a=>a.signal==='sell').length ? 'buy' : 'sell';
  return { results, score, direction: active.length ? direction : 'none' as const };
}

export function simulatePnL(entry:number, exit:number, invested:number) {
  const pct = (exit - entry) / entry;
  const result = invested * pct;
  return { pct, result, final: invested + result };
}
