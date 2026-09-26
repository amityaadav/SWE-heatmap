# SWE Knowledge Heatmap

Interactive self-assessment tool for software engineering skills. An LLM judge evaluates your answers against a hiring rubric and scores your depth across 21 domains and 153 topics.

## Live Demo

Deployed on Cloud Run: [swe-heatmap-152128639698.us-central1.run.app](https://swe-heatmap-152128639698.us-central1.run.app)

- **Dashboard** (public) — browse all domains, click to drill down into individual topic scores
- **Assessment** (authenticated) — sign in with Google, pick a domain and topic, answer a probe question, get an LLM-judged depth rating

## Depth Levels

| Level | Score | Description |
|-------|-------|-------------|
| Unaware | 0 | No knowledge of the topic |
| Recognize | 1 | Can identify the concept but not explain it |
| Explain | 2 | Can explain the concept clearly with reasoning |
| Apply | 3 | Can apply the concept to solve real problems |
| Debug under pressure | 4 | Can diagnose subtle issues and reason about edge cases |
| Teach | 5 | Can teach others and compare design alternatives |

## Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firestore (Native mode)
- **Auth**: Firebase Authentication (Google sign-in)
- **LLM Judge**: Ollama Cloud API
- **CI/CD**: GitHub Actions → Cloud Run

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled
- Ollama Cloud API key ([ollama.com/settings/keys](https://ollama.com/settings/keys))

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env.local

# Seed Firestore with domains and topics (run once)
npm run seed

# Start dev server
npm run dev
```

### Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Build-time | Firebase client auth |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Build-time | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Build-time | GCP project ID |
| `OLLAMA_CLOUD_API_URL` | Runtime | Ollama Cloud chat endpoint |
| `OLLAMA_CLOUD_API_KEY` | Runtime | Ollama API key |
| `OLLAMA_MODEL` | Runtime | Model for LLM judge (default: `deepseek-v4-pro:cloud`) |
| `ALLOWED_EMAILS` | Runtime | Comma-separated email allowlist for assessments |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run seed` | Seed Firestore with domain/topic catalog |

## Architecture

- **Single-user model**: `profile/main` is a fixed Firestore document (no per-user ID)
- **Public dashboard**: anyone can view scores; assessment requires auth + email allowlist
- **Server-side writes**: Firestore writes go through API routes using the Admin SDK
- **Build-time config**: `NEXT_PUBLIC_*` vars are baked into the client bundle via Docker build args
- **Domain averages**: computed at read time, never stored
