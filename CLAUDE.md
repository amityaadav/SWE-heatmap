# SWE Knowledge Heatmap

## Project overview
Interactive self-assessment tool for software engineering skills. LLM-judged evaluation with server-side persistence. Single-user model (portfolio/showcase style).

## Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes (deployed on Cloud Run)
- **Database**: Firestore (Native mode)
- **Auth**: Firebase Authentication (Google sign-in)
- **LLM judge**: Ollama Cloud API (model configurable via `OLLAMA_MODEL` env var, default `deepseek-v4-pro:cloud`)
- **CI/CD**: GitHub Actions → Cloud Run
- **Infra**: GCP project `swe-heatmap`, Cloud Run URL `https://swe-heatmap-152128639698.us-central1.run.app`

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript type checking
- `npm run seed` — seed Firestore with domain/topic catalog (run in Cloud Shell)

## Key architecture decisions
- `profile/main` is a single-user fixed document (no per-user ID yet)
- Domain averages are computed at read time, never stored
- `topic_catalog` is decoupled from `profile/main` (different collections)
- Dashboard is public; assessment requires Firebase Auth + email allowlist (`ALLOWED_EMAILS` env var)
- Firestore writes go through the backend only (admin SDK), frontend gets read-only access via security rules
- Ollama API key stays server-side only (GCP Secret Manager, mounted on Cloud Run)
- `NEXT_PUBLIC_*` Firebase vars are passed as Docker build args (not runtime env vars) because Next.js inlines them at build time
- Auth session persists across page loads via `onAuthStateChanged`
- 21 domains, 153 leaf topics, six depth levels: Unaware → Recognize → Explain → Apply → Debug under pressure → Teach

## File structure
- `src/app/layout.tsx` — root layout with nav bar (Dashboard link + Take Assessment button)
- `src/app/page.tsx` — public dashboard/heatmap (server component, queries Firestore directly)
- `src/app/heatmap.tsx` — client component for interactive domain drill-down
- `src/app/assess/page.tsx` — authenticated assessment flow (client component)
- `src/app/api/assess/route.ts` — submit assessment (authed + email allowlist, calls Ollama judge)
- `src/app/api/question/route.ts` — generate probe question (authed + email allowlist, calls Ollama)
- `src/app/api/profile/route.ts` — read profile data
- `src/app/api/catalog/route.ts` — read topic catalog
- `src/lib/types.ts` — shared TypeScript types and depth-level constants
- `src/lib/firebase-admin.ts` — Firebase Admin SDK init (with ADC fallback for Cloud Run)
- `src/lib/firebase-client.ts` — Firebase client SDK init
- `src/lib/ollama.ts` — Ollama Cloud API judge call
- `src/data/domains.json` — source of truth for all 21 domains and 153 leaf topics
- `src/data/domains.ts` — typed wrapper around domains.json
- `scripts/seed-firestore.cjs` — plain CJS seed script for Firestore (Node v24 compatible)

## Environment variables
### Build-time (Docker build args via GitHub Actions)
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase Web API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — GCP project ID

### Runtime (Cloud Run)
- `OLLAMA_CLOUD_API_URL` — Ollama Cloud chat endpoint (from GitHub Secret)
- `OLLAMA_CLOUD_API_KEY` — Ollama API key (from GCP Secret Manager)
- `OLLAMA_MODEL` — model name for LLM judge (from GitHub Actions variable)
- `ALLOWED_EMAILS` — comma-separated email allowlist for assessment access (from GitHub Secret)
