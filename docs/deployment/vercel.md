# Vercel Deployment (CheggieTrade V2)

## Prerequisites
- Vercel CLI installed: `pnpm i -g vercel`
- Authenticated session (`vercel login`) or token (`VERCEL_TOKEN`)
- Project ID: `prj_uCjAUcoQqdbrqZyree0RydI7t9Z7`
- **Org ID must be supplied by account context; do not invent it.**

## Safe link flow
From repo root:

```bash
vercel link
```

If token is available:

```bash
vercel link --token="$VERCEL_TOKEN"
```

This writes local linkage metadata under `.vercel/`.

## Pull project settings and env
```bash
vercel pull --environment=preview
vercel env pull .env.local
vercel env ls
```

Token variant:

```bash
vercel pull --environment=preview --token="$VERCEL_TOKEN"
vercel env pull .env.local --token="$VERCEL_TOKEN"
```

## Build / deploy
```bash
vercel build
vercel deploy --prebuilt
```

## Notes
- Never commit `.env.local`.
- Do not commit `.vercel/` unless explicitly approved for team workflow.
- `vercel.json` already points build to `apps/web` workspace.
