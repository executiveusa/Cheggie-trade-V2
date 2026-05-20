# Enhancement Plan

## Preserve
- Existing Next.js routes, API proxy routes, Docker service layout, and current Serbian-first locale behavior.

## Enhance
- Vercel CLI project wiring docs and safe local workflow.
- Add vercel ignore hygiene.
- Produce audit artifacts for index, page quality, and final report.

## Missing / Gaps
- No committed `.vercel/project.json` linkage (intentionally omitted for security/portability).
- No token/org in environment, so remote Vercel linking must be run by operator.

## Highest-risk files
- `apps/web/src/app/*` pages (user-visible UX)
- `apps/web/src/app/api/*` fallback behavior
- deployment config files (`vercel.json`, compose files)

## Execution order
1. Audit and inventory.
2. Add deployment docs and `.vercelignore`.
3. Validate lint/typecheck/test/build.
4. Write final enhancement report.

## Test plan
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `vercel build` (if authenticated)
