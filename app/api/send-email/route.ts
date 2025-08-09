import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { subject, html } = await req.json();
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO = process.env.ALERT_EMAIL_TO || 'icteodoro@yahoo.com.br';
    if (!RESEND_API_KEY) {
      return NextResponse.json({ ok:false, error:'RESEND_API_KEY ausente no ambiente' }, { status: 500 });
    }
    const resend = new Resend(RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'Oraculo <onboarding@resend.dev>', // remetente seguro sem verificação
      to: [TO],
      subject,
      html
    });
    return NextResponse.json({ ok:true, result });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
