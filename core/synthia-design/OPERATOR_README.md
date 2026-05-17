# Synthia™ Operator Deployment Guide

## Deploy a new white-label instance in 20 minutes

1. Fork this repo
2. Set these env vars in Vercel (or your hosting):

```
WL_BRAND_NAME="Synthia Para Emprendedoras"
WL_TAGLINE="Tu IA para tu negocio"
WL_LOGO_URL="/logo-custom.svg"
WL_PRIMARY_COLOR="#c4963c"
WL_LANGUAGE="es"
WL_COUNTRY="CO"
WL_NICHE="emprendedoras"
WL_OPERATOR_ID="your-operator-id"

NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
ANTHROPIC_API_KEY="..."
CREEM_API_KEY="..."
CREEM_WEBHOOK_SECRET="..."
CREEM_STARTER_ID="..."
CREEM_PRO_ID="..."
CREEM_OPERATOR_ID="..."
```

3. Deploy to Vercel: `vercel --prod`
4. Run Supabase migrations: `supabase db push`
5. Set your custom domain in Vercel

## Pre-built niche configs

| Market | Config |
|--------|--------|
| Puerto Rico | `WL_COUNTRY=PR WL_TAGLINE="Tu IA boricua"` |
| Colombia | `WL_COUNTRY=CO WL_NICHE=emprendedoras` |
| Peru | `WL_COUNTRY=PE WL_NICHE=creadores` |
| Brazil | `WL_LANGUAGE=pt WL_TAGLINE="Sua IA. Seu negócio."` |
| Mexico Reels | `WL_NICHE=reels WL_TAGLINE="Crea contenido con tu IA"` |
| Coaches | `WL_NICHE=coaches WL_TAGLINE="Tu IA para coaches"` |
| Ecommerce | `WL_NICHE=ecommerce WL_TAGLINE="Vende más con tu IA"` |

## Revenue model

You keep 100% of install revenue from your deployment.
Creem.io pays out directly to your bank account.
Each client you install pays YOU, not Kupuri Media.

## Support

Operator-tier clients get infrastructure guidance from The Pauli Effect™.
