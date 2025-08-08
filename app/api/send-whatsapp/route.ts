import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID; // Cloud API phone number ID
    const to = process.env.WHATSAPP_TO || '+5571991734787';

    if (!token || !phoneNumberId) {
      return NextResponse.json({ ok:false, error: 'Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_ID no ambiente' }, { status: 500 });
    }

    const resp = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ ok:false, error: data.error?.message || 'Falha WhatsApp' }, { status: 500 });
    }
    return NextResponse.json({ ok:true, data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
