# Architecture — Software Engineering Knowledge Heatmap

Companion to `DESIGN.md` (scope, scoring, evaluation semantics). This doc
covers services, boundaries, schema, and deployment.

## Stack

All GCP-native, single cloud, single environment (no dev/staging split
for now).

| Concern            | Service                                   |
|---------------------|--------------------------------------------|
| Compute / hosting   | Cloud Run                                  |
| Persistence         | Firestore (Native mode)                    |
| Secrets             | Secret Manager (Ollama Cloud API key)      |
| Auth                | Firebase Authentication                    |
| LLM judge           | Ollama Cloud API (user-provided key)       |
| CI/CD               | GitHub Actions → Cloud Run (automated)     |
| Source              | github.com/amityaadav/SWE-heatmap          |

Reasoning for each choice below.

## Why not the AI heatmap's pattern

The existing `your-ai-heatmap` project is a static site (plain HTML/JS,
`localStorage` for progress, export/import as portable JSON, no backend).
This project deliberately diverges: server-side persistence (Firestore),
a real backend (Cloud Run) to call the Ollama judge and keep the API key
server-side, and a curated resource catalog that's decoupled from personal
assessment state. The visual heatmap pattern is still reused; the data/
backend layer is not.

## Free tier fit

All chosen services stay within always-free quotas at this project's scale
(single user, occasional assessment sessions):

- **Cloud Run**: 2M requests/month free — nowhere close at this usage.
- **Firestore**: 1 GiB storage, 50K reads/day, 40K writes/day free — a full
  assessment pass (~150–200 leaf topics) is a few hundred operations and a
  few MB, far under quota.
- **Secret Manager**: 6 active secret versions, 10K access ops/month free —
  one secret (Ollama API key), well within range.
- **Firebase Authentication**: 50,000 MAU free — this app has one user.

The one cost center outside GCP's free tier is **Ollama Cloud API usage**,
billed under the user's existing subscription — not a GCP cost.

## Auth boundary

- **Firebase Authentication** gates the quiz-taking flow (answering
  questions, triggering judge calls, writing assessment results).
- The **dashboard/heatmap view is public** — no auth required to view
  results.
- Cloud Run verifies the Firebase Auth ID token on any request that
  triggers an Ollama call or a Firestore write to `profile/main`. Reads of
  `topic_catalog` and the public dashboard view do not require auth.
- Firebase Auth was chosen over AWS Cognito specifically to keep the stack
  single-cloud: it integrates directly with Firestore and Cloud Run inside
  the same GCP/Firebase project, avoiding cross-cloud JWT verification
  plumbing that a Cognito-fronting-Cloud-Run setup would require.

## Data model (Firestore)

### `profile/main` — single-user profile, fixed document ID

No per-user `profileId` yet — single document keeps this simple while the
tool is single-user. Migrating to `profiles/{userId}` later is additive:
same shape, different collection path.

```
profile/main
  domains/{domainId}
    domain_name: string
    archetype_tags: string[]

    leaf_topics/{leafTopicId}
      topic_name: string
      depth_level: enum  // Unaware | Recognize | Explain | Apply
                          // | Debug under pressure | Teach
      last_assessed: timestamp
      judge_notes: string
      assessed: boolean   // false/absent = never assessed — distinct
                           // from a low depth_level
      assessment_history: [
        { depth_level, timestamp, judge_notes }
      ]
```

### `topic_catalog/{leafTopicId}` — static reference data

Decoupled from `profile/main` so curated content and personal assessment
state can't clobber each other on update. Populated once, manually — not
generated live by the judge model, not refreshed on a schedule.

```
topic_catalog/{leafTopicId}
  topic_name: string
  domain_id: string
  resources: [
    { rank: 1-6, type: "article" | "video" | "doc" | ..., title, url, source }
  ]  // up to 6, always visible in UI regardless of assessment status
```

`leafTopicId` is the shared key between `profile/main/.../leaf_topics/{id}`
and `topic_catalog/{id}` — no resource data is duplicated per assessment.

Domain scores are **computed at read time** (straight mean of `assessed:
true` leaf topics in a domain) — never stored, to avoid staleness.

## Request flow — assessment

1. User signs in via Firebase Authentication.
2. Frontend (heatmap UI, served by Cloud Run) presents a leaf topic's probe
   question.
3. User answers; frontend sends the answer + Firebase ID token to the
   Cloud Run backend.
4. Backend verifies the token, calls Ollama Cloud API with the rubric
   prompt + user's answer.
5. Ollama returns a depth judgment + reasoning.
6. Backend writes `depth_level`, `judge_notes`, `last_assessed`, and
   appends the prior state to `assessment_history`, sets `assessed: true`,
   to `profile/main/domains/{domainId}/leaf_topics/{leafTopicId}`.
7. Backend returns updated state; frontend re-renders the affected domain
   average and leaf cell.

## Request flow — dashboard view (public)

1. Any visitor loads the dashboard — no auth required.
2. Frontend reads `profile/main` (all domains/leaf topics) and
   `topic_catalog` directly from Firestore (or via a public read-only
   Cloud Run endpoint, if direct client reads aren't desired).
3. Domain averages computed client-side or server-side from `assessed:
   true` leaf topics.
4. Resources render inline per leaf topic from `topic_catalog`, always
   visible.

## Deployment

- **CI/CD**: GitHub Actions on push/merge to `main` → build and deploy to
  Cloud Run automatically. No manual `gcloud run deploy` step in normal
  flow.
- **Environments**: single environment only (no separate dev/staging).
  Changes go through PR review on GitHub before merging to `main`, same
  as the existing `your-ai-heatmap` repo's workflow.
- **Secrets**: Ollama Cloud API key stored in Secret Manager, injected into
  Cloud Run as a mounted secret/env var — never committed to the repo or
  exposed to the frontend.

## Open items for implementation

- Confirm whether the dashboard reads Firestore directly from the client
  (simpler, needs public Firestore security rules scoped to read-only) or
  via a Cloud Run read endpoint (more control, slightly more to build).
- `topic_catalog` seed data (16 domains × leaf topics × 6 resources each)
  needs to be populated before the resource-display feature is usable —
  this is a manual, one-time content task, not a code task.
- Firestore security rules need to explicitly block public writes to
  `profile/main` and `topic_catalog` — only the authenticated Cloud Run
  backend (via a service account) should write to either.
