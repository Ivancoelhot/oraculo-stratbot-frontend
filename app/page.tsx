'use client'
import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import CandleChart from '../components/CandleChart';
import { Candle } from '../lib/indicators';
import { detectConfluence, simulatePnL } from '../lib/setups';

type Source = 'binance' | 'csv';

export default function Page() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [limit, setLimit] = useState(300);
  const [source, setSource] = useState<Source>('binance');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [invested, setInvested] = useState(1000);
  const [entryPrice, setEntryPrice] = useState<number|undefined>(undefined);
  const [exitPrice, setExitPrice] = useState<number|undefined>(undefined);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [waStatus, setWaStatus] = useState<string>('');

  const loadBinance = async () => {
    const r = await fetch(`/api/binance?symbol=${symbol}&interval=${interval}&limit=${limit}`, { cache:'no-store' });
    const j = await r.json();
    if (j.ok) setCandles(j.candles);
  };

  useEffect(() => {
    if (source === 'binance') loadBinance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval, limit, source]);

  const onCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (res) => {
        // Expect columns: time, open, high, low, close, volume
        const rows = res.data as any[];
        const data = rows
          .filter(r => r.time && r.open && r.high && r.low && r.close && r.volume)
          .map(r => ({
            time: typeof r.time === 'number' ? r.time : Math.floor(new Date(r.time).getTime()/1000),
            open: +r.open, high: +r.high, low: +r.low, close: +r.close, volume: +r.volume
          }));
        setCandles(data);
      }
    });
  };

  const confluence = useMemo(() => {
    if (!candles.length) return null;
    const d = detectConfluence(candles);
    return d;
  }, [candles]);

  useEffect(() => {
    if (confluence && confluence.direction !== 'none' && confluence.score >= 2) {
      const last = candles[candles.length-1];
      setEntryPrice(last.close);
      setExitPrice(undefined);
      setShowForm(true);
      const msg = `Confluência detectada (${confluence.direction.toUpperCase()}) com score ${confluence.score} em ${symbol} ${interval}.`;
      // fire alerts (best effort; will error if env missing)
      fetch('/api/send-email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ subject:`[Oráculo] Sinal ${confluence.direction.toUpperCase()} ${symbol} ${interval}`, html:`<p>${msg}</p>` }) })
        .then(r=>r.json()).then(j=>setEmailStatus(j.ok ? 'E-mail enviado' : 'E-mail falhou: '+j.error)).catch(e=>setEmailStatus('E-mail falhou: '+e.message));
      fetch('/api/send-whatsapp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: msg }) })
        .then(r=>r.json()).then(j=>setWaStatus(j.ok ? 'WhatsApp enviado' : 'WhatsApp falhou: '+j.error)).catch(e=>setWaStatus('WhatsApp falhou: '+e.message));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confluence?.direction, confluence?.score]);

  const pnl = useMemo(() => {
    if (!entryPrice || !exitPrice || !invested) return null;
    return simulatePnL(entryPrice, exitPrice, invested);
  }, [entryPrice, exitPrice, invested]);

  const onConfirm = () => {
    if (!entryPrice || !exitPrice) return;
    const rec = {
      ts: Date.now(),
      symbol, interval,
      entry: entryPrice,
      exit: exitPrice,
      invested,
      ...simulatePnL(entryPrice, exitPrice, invested),
      details: confluence
    };
    setHistory(h => [rec, ...h]);
    setShowForm(false);
    setEmailStatus(''); setWaStatus('');
  };

  return (
    <main className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select className="input w-auto" value={source} onChange={e=>setSource(e.target.value as Source)}>
              <option value="binance">Fonte: Binance (automático)</option>
              <option value="csv">Fonte: Upload CSV (TradingView/Outros)</option>
            </select>
            <input className="input w-28" value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} placeholder="BTCUSDT" />
            <select className="input w-auto" value={interval} onChange={e=>setInterval(e.target.value)}>
              {['1m','5m','15m','1h','4h','1d'].map(i=>(<option key={i} value={i}>{i}</option>))}
            </select>
            <input className="input w-24" type="number" value={limit} onChange={e=>setLimit(parseInt(e.target.value||'300',10))} />
            <button className="btn btn-secondary" onClick={()=>source==='binance' ? loadBinance() : null}>Atualizar</button>
            {source==='csv' && <input type="file" accept=".csv" onChange={e=>e.target.files && onCsv(e.target.files[0])} className="text-sm" />}
          </div>
          <CandleChart data={candles} />
          <div className="mt-3 text-sm text-neutral-300">
            {confluence ? (
              <>
                <div>Confluência: <strong className="text-white">{confluence.direction.toUpperCase()}</strong> | Score: <strong className="text-white">{confluence.score}</strong></div>
                <ul className="list-disc pl-5 mt-1">
                  {confluence.results.map((r,i)=>(<li key={i}><span className="text-white">{r.name}</span>: {r.reason} → <span className={r.signal==='buy'?'text-green-400': r.signal==='sell'?'text-red-400':'text-neutral-400'}>{r.signal.toUpperCase()}</span></li>))}
                </ul>
                <div className="mt-2 text-xs text-neutral-400">Alertas: {emailStatus} | {waStatus}</div>
              </>
            ) : 'Carregando...'}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Histórico de Sinais</h3>
          <table className="table">
            <thead><tr><th>Data</th><th>Par</th><th>Entrada</th><th>Saída</th><th>Investido</th><th>P/L</th></tr></thead>
            <tbody>
              {history.map((h, idx)=>(
                <tr key={idx}>
                  <td>{new Date(h.ts).toLocaleString()}</td>
                  <td>{h.symbol} {h.interval}</td>
                  <td>${h.entry.toFixed(2)}</td>
                  <td>${h.exit?.toFixed(2)}</td>
                  <td>${h.invested.toFixed(2)}</td>
                  <td className={h.result>=0?'text-green-400':'text-red-400'}>${h.result.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length===0 && <div className="text-xs text-neutral-400">Sem registros ainda.</div>}
        </div>
      </section>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="font-semibold mb-2">Confirme a simulação</h3>
            <p className="text-sm mb-3">Confluência detectada. Preencha os dados abaixo. (Formulário compacto — sem necessidade de zoom)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Valor investido (USDT)</label>
                <input className="input" type="number" value={invested} onChange={e=>setInvested(parseFloat(e.target.value||'0'))} />
              </div>
              <div>
                <label className="label">Preço de entrada</label>
                <input className="input" type="number" value={entryPrice ?? 0} onChange={e=>setEntryPrice(parseFloat(e.target.value||'0'))} />
              </div>
              <div>
                <label className="label">Preço de saída</label>
                <input className="input" type="number" value={exitPrice ?? 0} onChange={e=>setExitPrice(parseFloat(e.target.value||'0'))} />
              </div>
              <div className="text-sm text-neutral-300">
                <div className="font-semibold mb-1">Indicadores no TradingView</div>
                <ul className="list-disc pl-5">
                  <li>EMA (9, 21, 50) — cores distintas</li>
                  <li>RSI (14)</li>
                  <li>MACD (12, 26, 9)</li>
                  <li>Parabolic SAR (0.02, 0.2)</li>
                  <li>Volume (barra) — comparar com média 20</li>
                </ul>
              </div>
            </div>
            {pnl && (
              <div className="mt-3 text-sm">
                <div>Resultado: <span className={pnl.result>=0?'text-green-400':'text-red-400'}>${pnl.result.toFixed(2)}</span> ({(pnl.pct*100).toFixed(2)}%)</div>
                <div>Valor final: <strong>${pnl.final.toFixed(2)}</strong></div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={onConfirm}>Salvar no histórico</button>
            </div>
          </div>
        </div>
      )}

      <section className="card">
        <h3 className="font-semibold mb-2">Como usar fontes de dados</h3>
        <ul className="list-disc pl-5 text-sm">
          <li><strong>Binance</strong>: seleção automática via API pública (sem chave). Escolha par e intervalo e clique em Atualizar.</li>
          <li><strong>TradingView/Outros</strong>: exporte OHLCV para CSV (colunas: time,open,high,low,close,volume) e faça upload.</li>
        </ul>
      </section>
    </main>
  );
}
