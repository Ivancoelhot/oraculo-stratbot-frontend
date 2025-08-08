'use client'
import React from 'react';

type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };

export default function CandleChart({ data, height=220 }: { data: Candle[]; height?: number }) {
  if (!data || data.length === 0) return <div className="text-xs text-neutral-400">Sem dados.</div>;
  const width = 700;
  const pad = 10;
  const highs = data.map(d=>d.high);
  const lows = data.map(d=>d.low);
  const maxY = Math.max(...highs);
  const minY = Math.min(...lows);
  const scaleY = (v:number) => pad + (maxY - v) * (height - pad*2) / (maxY - minY + 1e-9);
  const candleW = Math.max(2, (width - pad*2) / data.length * 0.6);

  return (
    <svg width={width} height={height} className="bg-neutral-950 rounded-xl border border-neutral-800">
      {data.map((d, i) => {
        const x = pad + i * ((width - pad*2) / data.length);
        const yHigh = scaleY(d.high);
        const yLow = scaleY(d.low);
        const yOpen = scaleY(d.open);
        const yClose = scaleY(d.close);
        const up = d.close >= d.open;
        return (
          <g key={i}>
            <line x1={x + candleW/2} x2={x + candleW/2} y1={yHigh} y2={yLow}
              stroke={up ? '#4ade80' : '#f87171'} strokeWidth="1"/>
            <rect x={x} y={Math.min(yOpen, yClose)} width={candleW}
              height={Math.max(1, Math.abs(yClose - yOpen))}
              fill={up ? '#4ade80' : '#f87171'} />
          </g>
        );
      })}
    </svg>
  );
}
