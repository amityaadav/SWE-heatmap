# SWE Knowledge Heatmap

## Project overview
Interactive self-assessment tool for software engineering skills. LLM-judged evaluation with server-side persistence and curated learning resources.

## Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes (deployed on Cloud Run)
- **Database**: Firestore (Native mode)
- **Auth**: Firebase Authentication
- **LLM judge**: Ollama Cloud API
- **CI/CD**: GitHub Actions → Cloud Run

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript type checking

## Key architecture decisions
- `profile/main` is a single-user fixed document (no per-user ID yet)
- Domain averages are computed at read time, never stored
- `topic_catalog` is decoupled from `profile/main` (different collections)
- Dashboard is public; assessment requires Firebase Auth
- Firestore writes go through the backend only (admin SDK), frontend gets read-only access via security rules
- Ollama API key stays server-side only (Secret Manager on Cloud Run)

## File structure
- `src/app/page.tsx` — public dashboard/heatmap
- `src/app/assess/page.tsx` — authenticated assessment flow
- `src/app/api/profile/route.ts` — read profile data
- `src/app/api/assess/route.ts` — submit assessment (authed, calls Ollama)
- `src/app/api/catalog/route.ts` — read topic catalog
- `src/lib/types.ts` — shared TypeScript types and depth-level constants
- `src/lib/firebase-admin.ts` — Firebase Admin SDK init
- `src/lib/firebase-client.ts` — Firebase client SDK init
- `src/lib/ollama.ts` — Ollama Cloud API judge call
