# Synthia™ — Deploy Guide

## Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- Anthropic API key
- muapi.ai key
- Creem.io account with 3 products configured

---

## 1. Environment Setup

```bash
cp .env.local.template .env.local
# Fill in all required values in .env.local
```

**Required vars (app won't start without these):**

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com → Project → Settings → API (keep secret) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `MUAPI_DEFAULT_KEY` | muapi.ai → Dashboard → API Keys |
| `CREEM_STARTER_ID` | creem.io → Products (create one-time product $97) |
| `CREEM_PRO_ID` | creem.io → Products (create one-time product $297) |
| `CREEM_OPERATOR_ID` | creem.io → Products (create one-time product $497) |
| `CREEM_WEBHOOK_SECRET` | creem.io → Webhooks → Signing Secret |

---

## 2. Supabase Database Setup

Run these migrations in order in your Supabase SQL editor:

```bash
# Option A — Supabase CLI (recommended)
supabase db push

# Option B — Supabase dashboard SQL editor
# Paste and run: supabase/migrations/001_initial.sql
# Then paste and run: supabase/migrations/002_triggers.sql
```

---

## 3. Deploy to Vercel (recommended)

```bash
# One-command deploy
npx vercel --prod

# Or via GitHub integration:
# 1. Push this repo to GitHub
# 2. Import at vercel.com/new
# 3. Set root directory to: apps/web
# 4. Add all env vars from .env.local
# 5. Deploy
```

After deploy, add your Vercel URL to `.env.local`:
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 4. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=...
# (repeat for all required vars)
```

Railway auto-detects `output: 'standalone'` from `next.config.ts`.

---

## 5. Configure Creem Webhook

In creem.io dashboard:
1. Go to **Webhooks** → **Add webhook**
2. URL: `https://your-domain.com/api/creem-webhook`
3. Events: `payment.succeeded`
4. Copy the signing secret to `CREEM_WEBHOOK_SECRET`

---

## 6. Validate muapi Connection

```bash
npx tsx apps/web/scripts/validate-muapi.ts
```

This confirms your muapi key works before going live.

---

## 7. Post-Deploy Smoke Test

```bash
BASE=https://your-domain.com

# Health check
curl $BASE/api/health

# Landing page loads
curl -s -o /dev/null -w "%{http_code}" $BASE/

# Auth page
curl -s -o /dev/null -w "%{http_code}" $BASE/auth

# Pricing page
curl -s -o /dev/null -w "%{http_code}" $BASE/pricing

# Protected route redirects (should return 307)
curl -s -o /dev/null -w "%{http_code}" $BASE/chat

# Webhook responds to unauthorized
curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/creem-webhook
```

All checks should return 200 except `/chat` (307) and the webhook (401).

---

## Optional: Screenshotone (UDEC Visual Audit)

Without this, UDEC audits use text-only analysis. To enable real screenshot analysis:

1. Sign up at screenshotone.com
2. Get your access key
3. Add to env: `SCREENSHOTONE_KEY=your-key`

---

## Optional: WhatsApp Business

Requires Meta Business Verification (2–6 weeks):

1. Create Facebook Developer App at developers.facebook.com
2. Add WhatsApp product
3. Complete Meta Business Verification
4. Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`
5. Configure webhook URL: `https://your-domain.com/api/whatsapp/webhook`
