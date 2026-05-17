# Synthia Web Deploy Checklist

## 1) Environment variables
Copy `apps/web/.env.example` to `.env.local` (local) or your platform env panel (Vercel/Railway).

### Required for core app
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key for server-side writes/webhooks.
- `ANTHROPIC_API_KEY`: Claude API key for chat/audit/automation endpoints.

### Required for monetization
- `CREEM_WEBHOOK_SECRET`: from Creem webhook configuration.
- `CREEM_STARTER_ID`, `CREEM_PRO_ID`, `CREEM_OPERATOR_ID`: real Creem product IDs (must not be empty).

### Required for media generation
- `MUAPI_DEFAULT_KEY`: muapi.ai key.
- `MUAPI_BASE_URL`: defaults to `https://api.muapi.ai`.

### Optional integrations
- `REPLICATE_API_TOKEN` for `/api/video`.
- `SCREENSHOTONE_API_KEY` for screenshot-based UDEC audits.
- `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` for WhatsApp webhook/dispatch.
- `GITHUB_TOKEN`, `HF_TOKEN`, `HUGGINGFACE_API_KEY` for repos/worlds integrations.

## 2) Supabase SQL migrations
Run all SQL in `supabase/migrations/` against your Supabase project **before launch**:
- `001_initial.sql`
- `002_whatsapp.sql`
- `003_operator.sql`

## 3) Pre-launch validation
1. Sign up a fresh user.
2. Confirm row exists in `profiles` with `tier=free`.
3. Trigger Creem webhook and verify tier upgrades.
4. Verify route gating:
   - free user blocked from `/studios/video` and `/studios/cinema`
   - free user redirected to `/pricing`
5. Run end-to-end generation tests with real `MUAPI_DEFAULT_KEY`.
