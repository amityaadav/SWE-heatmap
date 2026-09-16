# Software Engineering Knowledge Heatmap — Design Doc

## Purpose

An interactive self-assessment tool that tests essential software engineering
skills across depth levels — not a pass/fail checklist. Modeled on an existing
AI-knowledge heatmap (`your-ai-heatmap`), extended with LLM-judged evaluation,
server-side persistence, and curated learning resources per topic.

## Scope structure

Two axes: **Topic × Depth**. Depth is a six-level scale:

`Unaware → Recognize → Explain → Apply → Debug under pressure → Teach`

A binary "know it / don't" heatmap can't show gradation, which defeats the
purpose of a heatmap.

Topics are tagged by **archetype** (backend / frontend / full-stack / etc.)
rather than one generic list. A senior backend engineer correctly plateaus
at "Recognize" on frontend topics — that's specialization, not a gap, and
scoring should not punish it. Archetype tags live at the domain level.

One language instance committed for language-specific topics (e.g., Python),
rather than trying to keep those topics language-agnostic.

### Two sections

- **Section A — Technical Depth** (16 topic domains): general engineering
  competency.
- **Section B — Senior/Leadership Layer** (cross-cutting, non-technical-
  knowledge): required *in addition to* Section A for anyone claiming
  "senior." Maxing Section A alone does not imply seniority — seniority is
  judgment/scope/leadership applied to the same technical topics, not more
  topics.

### Section A — 16 domains

1. Language proficiency (one language, deep)
2. Programming fundamentals
3. Data structures and algorithms (practical)
4. Version control and collaboration
5. Testing and quality
6. Databases and data modeling
7. APIs and integration
8. Web and networking fundamentals
9. Frontend fundamentals
10. Operating systems and runtime
11. System design and architecture
12. DevOps and delivery
13. Observability and operations
14. Security
15. Engineering craft
16. Performance engineering

(Full leaf-topic lists per domain — see original design summary /
`topic_catalog` seed data.)

### Section B — cross-cutting senior layer

Ambiguity and scope · Technical leadership and influence · Mentorship and
multiplier effect · Organizational-scale technical ownership · Judgment calls

## Scoring model

- Every **leaf topic** gets an independent depth rating.
- **Domain score = straight mean of assessed leaf topics in that domain.**
  Only leaf topics with `assessed: true` count toward the average —
  unassessed topics are excluded, not treated as zero/"Unaware."
- The domain average is the primary display number. The leaf-topic grid is
  a drill-down view, not the primary signal — this avoids uneven leaf-topic
  counts per domain (e.g., DSA ~10 vs. thinner domains ~6-8) making some
  domains look artificially "spottier."
- Both the domain-level score and the leaf-level breakdown must be visible
  in the UI at the same time (e.g., domain cell expands to leaf topics),
  so a low domain average is always explainable by drilling in.
- Domain averages are **computed at read time**, not stored, to avoid a
  stored-average going stale when a single leaf topic is re-assessed.

## Evaluation semantics — LLM-as-judge

Rejected approaches, for context:

- **Pure self-rating** — fast, but bias runs both directions (people
  overrate "Apply," underrate "Debug under pressure") and doesn't catch
  someone who doesn't know what a depth label should actually require.
- **Self-rating + static calibration questions per domain** — better
  anchoring, but a domain-level question can't distinguish "strong on 8 of
  10 topics, weak on 2" from "medium on all 10" — exactly the signal this
  tool needs to surface.

**Adopted approach: LLM-as-judge, at leaf-topic granularity.**

- Each leaf topic gets its own short, adaptive probe: 1–3 questions,
  scaled to how the user is doing (follow up on shallow answers, move on
  from clearly strong ones) — closer to how a hiring manager actually
  interviews than a fixed question bank.
- Judge model: **Ollama Cloud** (user's existing subscription), called via
  API from the backend.
- Rubric: judged against criteria a software engineering hiring manager
  would use — not just correct terminology, but reasoning about tradeoffs,
  edge cases, and *why* not just *what*.
- Judge output per assessment: `depth_level` (one of the six enum values)
  and `judge_notes` (free-text reasoning).
- **Re-assessment is user-triggered only.** No automatic staleness nudges —
  the user re-assesses a topic when they've studied it and want to check
  progress.
- Re-assessment **overwrites** the current `depth_level`/`judge_notes` but
  appends the prior state to `assessment_history`, so progress over time is
  visible without blending old and new ratings into one number.

## Learning resources

- Each leaf topic carries **up to 6 curated resources** (articles, videos,
  docs, etc.), chosen for likely popularity/authority (proxied via search —
  official docs, highly-cited sources, high-subscriber channels — since
  exact traffic data isn't available to curate against directly).
- Resources are **always visible** in the UI next to their leaf topic,
  regardless of assessment status — not gated behind a revealed gap.
- Resources are **curated once, manually**, not generated live by the judge
  model and not refreshed on a schedule. This is a population task done
  directly against `topic_catalog`, separate from the live assessment flow.

## Data model (Firestore)

See `ARCHITECTURE.md` for full schema and service boundaries. Summary:

- `profile/main/domains/{domainId}/leaf_topics/{leafTopicId}` — the user's
  personal assessment state (single-user; no per-user profile ID yet).
- `topic_catalog/{leafTopicId}` — static reference data (topic metadata +
  curated resources), decoupled from personal assessment state so one
  can't be accidentally overwritten by the other's update logic.

## Open / deferred items

- Multi-user support (`profile/main` → `profiles/{userId}`) — not needed
  now; schema is structured so this migration is additive later.
- Automatic resource refresh — explicitly out of scope; manual only.
- Domain-level archetype "core vs. peripheral" scoring weight — tagging is
  in place (`archetype_tags`), but no differential scoring logic has been
  designed yet.
