# Open Questions — Cynthia Migration
# Track unresolved decisions

---

## Q1: Telegram Bot Token
**Status**: ACTION_REQUIRED — Secret provisioning
**Resolution**: Hermes config at `.hermes/config.yaml` already reads `${TELEGRAM_BOT_TOKEN}` and `${TELEGRAM_CHAT_ID}` from environment. The architecture is wired — only the actual values are missing.

**Action items (Bambu)**:
1. Open Telegram → search `@BotFather` → `/newbot` → name it `CynthiaStudioBot`
2. Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
3. Send any message to the bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat_id`
4. Store both in Infisical (project `synthia-3`, env `prod`):
   - `TELEGRAM_BOT_TOKEN` = the token from step 2
   - `TELEGRAM_CHAT_ID` = the chat_id from step 3
5. On VPS: `infisical run --env=prod -- hermes gateway install`

**Impact**: Once set → Hermes can text Bambu delivery notifications, morning briefs, escalations.

---

## Q2: ElevenLabs Voice IDs
**Status**: ACTION_REQUIRED — Voice cloning
**Resolution**: Account exists. Need to create 4 character voices and store their IDs.

**Action items (Bambu)**:
1. Log into ElevenLabs dashboard → Voice Lab
2. Create 4 voices using Voice Design or Instant Clone:
   | Voice Name | Character | Style Notes |
   |------------|-----------|-------------|
   | `synthia_en` | SYNTHIA English | Warm, precise, cinematic female |
   | `synthia_es` | SYNTHIA Spanish | Bambu persona, Latin warmth, female |
   | `bambu` | Bambu narration | Confident, direct, story-first, male |
   | `hermes` | HERMES announcements | Neutral, authoritative, male |
3. Copy each voice_id from the dashboard (format: `EXAVITQu4vr4xnSDxMaL`)
4. Store in Infisical:
   - `ELEVENLABS_API_KEY` = your API key
   - `ELEVENLABS_VOICE_SYNTHIA_EN` = voice_id
   - `ELEVENLABS_VOICE_SYNTHIA_ES` = voice_id
   - `ELEVENLABS_VOICE_BAMBU` = voice_id
   - `ELEVENLABS_VOICE_HERMES` = voice_id

**Impact**: Unblocks Bass Agent for all voiceover work.

---

## Q3: Suno API Access
**Status**: RESOLVED — Use Suno v4 API
**Resolution**: Suno API available at `https://studio-api.suno.ai`. Bass Agent will call it with vibe-matched prompts from the 5 templates in `agents/bass/AGENT.md`.

**Action items (Bambu)**:
1. Go to suno.com → Settings → API → Generate API key
2. Store in Infisical: `SUNO_API_KEY` = your key
3. Start with Pro plan ($30/month) — 500 songs/month is more than enough

**Music prompt templates (already defined in Bass AGENT.md)**:
- `sacred_earth`: "cinematic ambient, Latin percussion, nature sounds, film score"
- `ethereal_glass`: "minimal electronic, sparse piano, sci-fi texture, 120bpm"
- `editorial_luxury`: "jazz piano, upright bass, editorial magazine feel, no lyrics"
- `soft_structuralism`: "clean lo-fi, soft synths, minimal, work focus"
- `tropical_max`: "tropical house, marimba, bird sounds, warm production"

**Impact**: Unblocks music generation for video/brand projects.

---

## Q4: Cloudflare Pages Domain
**Status**: RESOLVED — Use Vercel (existing infra)
**Resolution**: The studio already deploys to Vercel (org: `the-pauli-effect`, confirmed in `.hermes/context.md`). Cloudflare is unnecessary overhead when Vercel is already configured and working.

**Architecture**:
- **Client deliverables**: Vercel preview deployments → client portal link → promote to production on approval
- **Studio landing page**: Vercel project under `the-pauli-effect` org
- **Domain**: Use `thepaulieffect.com` or `cynthia.studio` — configure in Vercel Domains settings

**Action items (Bambu)**:
1. Purchase domain (suggestion: `cynthia.studio` or `cynthia.design`)
2. In Vercel → Project Settings → Domains → Add custom domain
3. Update DNS (Vercel provides the records)

**Impact**: Vercel already works. Domain is cosmetic — deploys work without it.

---

## Q5: Stripe Account Configuration
**Status**: ACTION_REQUIRED — Product setup
**Resolution**: Account exists. Need to create products/prices matching the 4 service tiers.

**Action items (Bambu)**:
1. In Stripe Dashboard → Products, create:

   | Product | Price | Price ID → Infisical Key |
   |---------|-------|--------------------------|
   | Quick Fix | $500 one-time | `STRIPE_PRICE_QUICK_FIX` |
   | Standard Design | $3,000 one-time | `STRIPE_PRICE_STANDARD` |
   | Premium Package | $10,000 one-time | `STRIPE_PRICE_PREMIUM` |
   | Enterprise Retainer | $5,000/month recurring | `STRIPE_PRICE_ENTERPRISE` |
   | Free Audit | $0 (lead capture) | — no Stripe needed |

2. Create a webhook endpoint pointing to `{your-domain}/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.created`, `customer.subscription.deleted`

3. Store in Infisical:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - Price IDs from step 1

**Impact**: Unblocks paid conversions from audit funnel.

---

## Q6: Creem MoR Setup
**Status**: DEFERRED — Phase 2
**Resolution**: Creem is for international Merchant of Record. Not needed at launch. Stripe handles 135+ countries already. Add Creem when international volume justifies the integration effort.

**When to revisit**: When >20% of leads come from countries where Stripe's tax handling is insufficient (likely month 4-6).

**Impact**: Zero impact on launch. Stripe covers the initial market.

---

## Q7: VPS Hermes Deployment
**Status**: ACTION_REQUIRED — Deployment
**Resolution**: VPS at `31.220.58.212` is confirmed running (Coolify at port 8000 responds). Hermes config at `.hermes/config.yaml` is complete with cron schedules, agent definitions, routing table, and quality thresholds.

**Action items**:
1. SSH into VPS: `ssh root@31.220.58.212`
2. Install hermes-agent:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
   hermes setup
   ```
3. Clone the repo:
   ```bash
   git clone https://github.com/executiveusa/synthia-superdesign.git /opt/cynthia-studio
   ```
4. Set environment variables (from Infisical):
   ```bash
   infisical run --env=prod -- hermes gateway install
   ```
5. Enable as systemd service:
   ```bash
   hermes gateway install  # creates systemd unit
   systemctl enable hermes-gateway
   systemctl start hermes-gateway
   ```
6. Verify: `curl http://31.220.58.212:8080/health`

**Impact**: Unblocks autonomous studio operation (cron, queue polling, Telegram notifications).

---

## Q8: Blender Headless Rendering
**Status**: DEFERRED — Phase 2
**Resolution**: The VPS (31.220.58.212) likely has no GPU. Blender headless rendering needs GPU for anything beyond wireframe exports. Two options:

**Option A (Budget)**: Use a cloud GPU instance on-demand
- RunPod or Vast.ai: ~$0.30-0.50/hr for a 3090
- Spin up only when Blender Agent has a job, render, spin down
- Store results in `3d/exports/` and push to repo

**Option B (Quality)**: Monthly dedicated GPU
- Hetzner GPU server: ~$200/month for an A4000
- Always-on, handles Blender + potential Remotion rendering
- Better for volume

**Recommendation**: Start with Option A. Defer until first 3D project is actually requested.

**Impact**: Only blocks 3D pipeline. Core design (HTML/CSS/JS) + audio work fine without it.

---

## Q9: Portfolio Content
**Status**: RESOLVED ✅
**Resolution**: All three projects approved for public showcase:
- **Querencia** — eco-tour landing page (Sacred Earth vibe)
- **Golden Hearts** — brand project
- **Kupuri Landing** — agency landing page

These will populate Scene 4 (Proof/Capabilities) of the landing page architecture. Each showcased with UDEC score badge and technique breakdown.

**Action items**: None — portfolio content is unblocked.

---

## Q10: Client Onboarding Flow
**Status**: RESOLVED ✅
**Resolution**: Progressive disclosure. Start minimal, reveal more as the user engages.

**Free Audit Form (Scene 6 of landing page)**:
```
Required:
  - URL (the site to audit)

Optional (collapsed, "Add details for a better audit"):  
  - Email (for report delivery)
  - Brand guidelines (text or file upload)
  - Goals ("What do you want to improve?")
  - Competitors (up to 3 URLs)
```

**Rationale**:
- Single required field (URL) = lowest possible friction
- Optional fields improve audit quality but aren't gated
- No budget question at this stage — that comes after the audit reveals value
- Email is optional so nobody bounces at the form — but recommend it for delivery

**Post-audit upsell form (after report delivery)**:
```
Required:
  - Email (if not already provided)
  - Package selection (Quick Fix / Standard / Premium)

Optional:
  - Phone (for consultation call)
  - Budget range
  - Timeline preference
```

**Impact**: Maximizes top-of-funnel volume. Qualification happens through the audit itself, not the form.
