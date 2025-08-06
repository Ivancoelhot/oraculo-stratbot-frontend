import React from 'react'

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#111', color: '#fff', padding: '1rem' }}>
        <h1>Oráculo StratBot</h1>
      </header>

      <div style={{ display: 'flex' }}>
        <nav style={{ width: '220px', background: '#eee', padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">IA & Estratégias</a></li>
            <li><a href="#">Alertas</a></li>
            <li><a href="#">Configurações</a></li>
          </ul>
        </nav>

        <main style={{ flexGrow: 1, padding: '2rem' }}>
          <h2>Bem-vindo ao painel do Oráculo StratBot</h2>
          <p>Configure, monitore e automatize suas estratégias com IA integrada.</p>
        </main>
      </div>

      <footer style={{ backgroundColor: '#111', color: '#fff', padding: '1rem', marginTop: '2rem', textAlign: 'center' }}>
        © 2025 Oráculo StratBot. Todos os direitos reservados.
      </footer>
    </div>
  )
}

export default App
