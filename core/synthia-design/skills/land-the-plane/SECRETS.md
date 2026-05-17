# Required GitHub Secrets — Land the Plane™ v1.0

Set all of these in: **GitHub repo → Settings → Secrets and variables → Actions**

Once set, the entire pipeline activates on the next push. Zero further configuration needed.

---

## Secret Reference

| Secret | Where to get it | Required for |
|--------|-----------------|-------------|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens | Workflows 03, 04 (Vercel deploys) |
| `VERCEL_ORG_ID` | vercel.com → Team Settings → General | Workflows 03, 04 |
| `VERCEL_PROJECT_ID_WEB` | Vercel → project → Settings → General | apps/web deploy |
| `VERCEL_PROJECT_ID_DASH` | Vercel → dashboard project → Settings | apps/dashboard deploy (optional) |
| `RAILWAY_TOKEN` | railway.com → Account → Tokens | Workflows 05, 06 (Railway deploys) |
| `RAILWAY_PROJECT_ID` | Railway → project settings | Workflow 06 (preview envs) |
| `RAILWAY_SERVICE_ID` | Railway → service settings | Workflow 05 (production) |
| `TELEGRAM_TOKEN` | Telegram → @BotFather → /newbot | Workflows 03, 05, 11, 12 |
| `TELEGRAM_CHAT_ID` | Telegram → message @userinfobot | Workflows 03, 05, 11, 12 |
| `DOCKERHUB_USERNAME` | hub.docker.com account username | Workflow 11 (Docker publish) |
| `DOCKERHUB_TOKEN` | hub.docker.com → Account Settings → Security → Access Tokens | Workflow 11 |

---

## Getting Your Telegram Chat ID

1. Start a conversation with your Telegram bot (the one created via @BotFather)
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Find `"chat": {"id": XXXXXXXX}` — that number is `TELEGRAM_CHAT_ID`

---

## Getting Railway IDs

**Project ID:**
1. Open Railway dashboard
2. Go to your project
3. Settings → General → Copy "Project ID"

**Service ID:**
1. Open Railway dashboard
2. Go to your project → your service
3. Settings → General → Copy "Service ID"

---

## Getting Vercel IDs

**Org ID:**
```bash
vercel whoami
# or: vercel teams ls
```

**Project ID:**
```bash
cd apps/web
vercel link
cat .vercel/project.json   # shows projectId and orgId
```

---

## Security Notes

- Never commit these values to the repository (enforced by `secret-scan` job in quality-gate.yml)
- All secrets are stored encrypted in GitHub's secret store
- Rotate monthly (enforced by `secret-rotation-reminder.yml` — fires 1st of every month)
- Infisical project: synthia-3 (76894224-eb02-4c6f-8ebe-d25fd172c861)
  - `infisical run --env=prod -- <command>` for local access

---

*Land the Plane™ v1.0 — The Pauli Effect™ × Akash Engine*
*Emerald Tablets™ Security Protocol*
