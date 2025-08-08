import { NextResponse } from 'next/server';

export async function POST() {
  const email = await fetch('/api/send-email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ subject:'Teste de alerta', html:'<strong>Funcionando</strong>'}) });
  const whats = await fetch('/api/send-whatsapp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message:'Teste de alerta: funcionando' }) });
  return NextResponse.json({ ok:true, email:(await email.json()), whatsapp:(await whats.json()) });
}
