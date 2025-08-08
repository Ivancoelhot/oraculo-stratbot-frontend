import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 1000);

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const resp = await fetch(url, { next: { revalidate: 60 } });
  const data = await resp.json();
  const candles = data.map((d:any[]) => ({
    time: Math.floor(d[0]/1000),
    open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]), volume: parseFloat(d[5])
  }));
  return NextResponse.json({ ok:true, candles });
}
