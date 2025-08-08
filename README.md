# Oráculo StratBot — Frontend (Vercel)

Painel web com backtests, detecção de confluência e alertas (e-mail e WhatsApp).

## Variáveis de ambiente (Vercel)
- `RESEND_API_KEY` — crie uma chave gratuita em https://resend.com
- `ALERT_EMAIL_TO` — e-mail destino (padrão: icteodoro@yahoo.com.br)
- `WHATSAPP_TOKEN` — token do WhatsApp Cloud API (gratuito) em developers.facebook.com
- `WHATSAPP_PHONE_ID` — phone number ID do WhatsApp Cloud
- `WHATSAPP_TO` — número destino (padrão: +5571991734787)

## Deploy rápido no Vercel
1. Compacte este projeto em .zip (ou use o fornecido).
2. Crie projeto `oraculo-stratbot-frontend` no Vercel e importe o .zip.
3. Adicione as variáveis acima em *Settings → Environment Variables*.
4. Deploy. Pronto.
