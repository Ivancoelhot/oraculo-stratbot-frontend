import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Oráculo StratBot',
  description: 'Painel do agente com backtests e alertas'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="max-w-6xl mx-auto p-4">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Oráculo StratBot</h1>
            <div className="flex gap-2">
              <span className="badge">Vercel Deploy</span>
              <span className="badge">ChatGPT Plus</span>
            </div>
          </header>
          {children}
          <footer className="mt-12 text-xs text-neutral-400">
            © {new Date().getFullYear()} Oráculo StratBot — Painel web para backtests, confluências e alertas.
          </footer>
        </div>
      </body>
    </html>
  );
}
