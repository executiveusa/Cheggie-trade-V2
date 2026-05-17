# AGENTS.md — Synthia™ Sovereign Studio

## Identity
This is Synthia™ — sovereign personal AI studio for Latin American creators.
Brand: Kupuri Media™ × The Pauli Effect™
Mission: "Tu IA. Tu datos. Tu negocio."
Quality floor: UDEC 8.5/10 on all frontend output. Never ship below this.

## Tool rules
- Always use rg for search, never grep
- Always use apply_patch for file edits, never cat > file
- Parallelize all file reads — batch everything, read nothing one-by-one
- Run npm run build after every phase and fix all TypeScript errors before committing
- Run npm run lint before any commit
- Non-interactive git only — no rebase -i, no reset --hard, no git checkout --
- Never commit secrets, API keys, or .env files

## Design system (non-negotiable)
- Palette: primary #c4963c, accent #5a7a52, dark #0a1108, surface #1a2a1a, text #f5f0e8, muted #8a9e7e
- Fonts: Playfair Display (headings italic), DM Mono (labels/code), Lato (body)
- Every component mobile-first. Must work at 375px viewport minimum.
- All user-facing strings have Spanish (es) and English (en) variants.
- No purple gradients, no Inter font, no neon on dark backgrounds.

## Commit format
[SYNTHIA][PHASE-N] type: description
type: feat | fix | style | refactor | docs | test | chore

## Verification
After each phase: npm run build must pass, npm run lint must pass.
After phases 2-10: manually confirm the primary route renders at localhost:3000.
