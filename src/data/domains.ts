export interface DomainSeed {
  id: string;
  domain_name: string;
  section: "A" | "B";
  archetype_tags: string[];
  leaf_topics: { id: string; topic_name: string }[];
}

export const DOMAINS: DomainSeed[] = [
  // ── Section A — Technical Depth (16 domains) ──

  {
    id: "language-proficiency",
    domain_name: "Language proficiency (one language, deep)",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "syntax-and-idioms", topic_name: "Syntax and idioms" },
      { id: "mutability-and-references", topic_name: "Mutability and references" },
      { id: "functions-closures-decorators", topic_name: "Functions as values, closures, decorators" },
      { id: "iterators-generators", topic_name: "Iterators/generators" },
      { id: "exceptions-error-handling", topic_name: "Exceptions and error handling" },
      { id: "classes-composition-inheritance", topic_name: "Classes, composition vs. inheritance" },
      { id: "type-systems-hints", topic_name: "Type systems and hints" },
      { id: "modules-packages-deps", topic_name: "Modules/packages/dependency management" },
      { id: "concurrency-model", topic_name: "Concurrency model (threads, processes, async)" },
      { id: "memory-gc", topic_name: "Memory and garbage collection" },
      { id: "stdlib-fluency", topic_name: "Standard library fluency" },
    ],
  },
  {
    id: "programming-fundamentals",
    domain_name: "Programming fundamentals",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "control-flow-recursion", topic_name: "Control flow and recursion" },
      { id: "state-immutability", topic_name: "State and immutability" },
      { id: "pure-functions-side-effects", topic_name: "Pure functions and side effects" },
      { id: "pass-by-value-reference", topic_name: "Pass-by-value vs. reference" },
      { id: "encoding-basics", topic_name: "Encoding basics (UTF-8, bytes vs. strings)" },
      { id: "floating-point-precision", topic_name: "Floating point and numeric precision" },
      { id: "time-timezone-handling", topic_name: "Time and timezone handling" },
      { id: "regular-expressions", topic_name: "Regular expressions" },
    ],
  },
  {
    id: "data-structures-algorithms",
    domain_name: "Data structures and algorithms (practical)",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "arrays-lists-hashmaps-sets", topic_name: "Arrays/lists, hash maps, sets" },
      { id: "trees-graphs", topic_name: "Trees and graphs" },
      { id: "queues-stacks", topic_name: "Queues and stacks" },
      { id: "big-o-in-practice", topic_name: "Big-O in practice" },
      { id: "sorting-searching", topic_name: "Sorting and searching at a usage level" },
      { id: "space-time-tradeoffs", topic_name: "Space/time tradeoffs" },
      { id: "ds-choice-is-the-bug", topic_name: "When the data structure choice is the bug" },
    ],
  },
  {
    id: "version-control-collaboration",
    domain_name: "Version control and collaboration",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "git-model", topic_name: "Git model (commits, refs, DAG)" },
      { id: "branching-strategies", topic_name: "Branching strategies" },
      { id: "merge-vs-rebase", topic_name: "Merge vs. rebase" },
      { id: "conflict-resolution", topic_name: "Conflict resolution" },
      { id: "reading-writing-diffs", topic_name: "Reading and writing a good diff" },
      { id: "pr-etiquette-code-review", topic_name: "PR etiquette and code review" },
      { id: "commit-hygiene-history", topic_name: "Commit hygiene and history rewriting" },
      { id: "monorepo-vs-polyrepo", topic_name: "Monorepo vs. polyrepo" },
    ],
  },
  {
    id: "testing-quality",
    domain_name: "Testing and quality",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "test-types", topic_name: "Unit, integration, e2e, contract tests" },
      { id: "test-pyramid", topic_name: "Test pyramid and how it gets inverted" },
      { id: "fixtures-mocks-stubs-fakes", topic_name: "Fixtures, mocks, stubs, fakes, mock abuse" },
      { id: "deterministic-vs-flaky", topic_name: "Deterministic vs. flaky tests" },
      { id: "tdd-as-practice", topic_name: "TDD as a practice" },
      { id: "coverage-vanity-metric", topic_name: "Coverage as a vanity metric" },
      { id: "property-snapshot-testing", topic_name: "Property-based and snapshot testing" },
      { id: "testing-code-you-didnt-write", topic_name: "Testing code you didn't write" },
      { id: "linting-formatting-static-analysis", topic_name: "Linting, formatting, static analysis" },
    ],
  },
  {
    id: "databases-data-modeling",
    domain_name: "Databases and data modeling",
    section: "A",
    archetype_tags: ["backend", "full-stack"],
    leaf_topics: [
      { id: "relational-modeling-normalization", topic_name: "Relational modeling and normalization" },
      { id: "sql-fluency", topic_name: "SQL fluency (joins, aggregation, window functions)" },
      { id: "indexes-query-plans", topic_name: "Indexes and query plans" },
      { id: "transactions-acid-isolation", topic_name: "Transactions, ACID, isolation levels" },
      { id: "n-plus-1-connection-pooling", topic_name: "N+1 and connection pooling" },
      { id: "nosql-families-tradeoffs", topic_name: "NoSQL families and tradeoffs (KV, document, wide-column, graph)" },
      { id: "caching-layers", topic_name: "Caching layers (Redis)" },
      { id: "migrations-zero-downtime", topic_name: "Migrations and zero-downtime schema change" },
      { id: "sharding-replication", topic_name: "Sharding and replication concepts" },
      { id: "backup-restore-dr", topic_name: "Backup/restore and disaster recovery" },
    ],
  },
  {
    id: "apis-integration",
    domain_name: "APIs and integration",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "http-rest-design", topic_name: "HTTP semantics and REST design" },
      { id: "idempotency-pagination-versioning", topic_name: "Idempotency, pagination, versioning, error contracts" },
      { id: "authn-authz", topic_name: "AuthN vs. AuthZ (OAuth2, JWT, sessions, API keys)" },
      { id: "graphql-grpc-tradeoffs", topic_name: "GraphQL and gRPC tradeoffs" },
      { id: "message-queues-event-streams", topic_name: "Message queues and event streams" },
      { id: "sync-vs-async-integration", topic_name: "Sync vs. async integration" },
      { id: "webhooks-vs-polling", topic_name: "Webhooks vs. polling" },
      { id: "retries-backoff-circuit-breakers", topic_name: "Retries, backoff, timeouts, circuit breakers" },
      { id: "rate-limiting", topic_name: "Rate limiting (provider side)" },
      { id: "schema-contract-management", topic_name: "Schema/contract management" },
    ],
  },
  {
    id: "web-networking-fundamentals",
    domain_name: "Web and networking fundamentals",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "request-lifecycle", topic_name: "Request lifecycle end to end (DNS → TCP → TLS → HTTP)" },
      { id: "status-codes-headers-caching", topic_name: "Status codes, headers, caching semantics" },
      { id: "cookies-sessions-cors", topic_name: "Cookies, sessions, CORS" },
      { id: "latency-vs-throughput", topic_name: "Latency vs. throughput and where time goes" },
      { id: "load-balancers-proxies", topic_name: "Load balancers and proxies" },
      { id: "cdns", topic_name: "CDNs" },
      { id: "websockets-long-lived", topic_name: "WebSockets and long-lived connections" },
    ],
  },
  {
    id: "frontend-fundamentals",
    domain_name: "Frontend fundamentals",
    section: "A",
    archetype_tags: ["frontend", "full-stack"],
    leaf_topics: [
      { id: "dom-browser-rendering", topic_name: "DOM and browser rendering" },
      { id: "event-loop-blocking", topic_name: "Event loop and blocking" },
      { id: "component-model-state", topic_name: "Component model and state management" },
      { id: "client-side-routing", topic_name: "Client-side routing" },
      { id: "ssr-csr-ssg", topic_name: "SSR vs. CSR vs. SSG" },
      { id: "data-fetching-loading-error", topic_name: "Data fetching, loading and error states" },
      { id: "bundling-build-tooling", topic_name: "Bundling and build tooling" },
      { id: "responsive-layout-css", topic_name: "Responsive layout and CSS basics" },
      { id: "accessibility", topic_name: "Accessibility" },
      { id: "browser-devtools", topic_name: "Browser devtools" },
    ],
  },
  {
    id: "operating-systems-runtime",
    domain_name: "Operating systems and runtime",
    section: "A",
    archetype_tags: ["backend", "full-stack"],
    leaf_topics: [
      { id: "processes-vs-threads", topic_name: "Processes vs. threads" },
      { id: "memory-model-stack-heap", topic_name: "Memory model (stack/heap)" },
      { id: "filesystem-permissions", topic_name: "Filesystem and permissions" },
      { id: "env-vars-process-config", topic_name: "Environment variables and process config" },
      { id: "signals-graceful-shutdown", topic_name: "Signals and graceful shutdown" },
      { id: "shell-cli-fluency", topic_name: "Shell/CLI fluency" },
      { id: "resource-limits", topic_name: "Resource limits (CPU, memory, file descriptors)" },
    ],
  },
  {
    id: "system-design-architecture",
    domain_name: "System design and architecture",
    section: "A",
    archetype_tags: ["backend", "full-stack"],
    leaf_topics: [
      { id: "requirements-to-arch", topic_name: "Requirements to architecture characteristics" },
      { id: "statelessness-horizontal-scaling", topic_name: "Statelessness and horizontal scaling" },
      { id: "caching-strategies-invalidation", topic_name: "Caching strategies and invalidation" },
      { id: "consistency-models-cap", topic_name: "Consistency models and CAP in practice" },
      { id: "designing-for-failure", topic_name: "Designing for failure, graceful degradation" },
      { id: "architecture-styles", topic_name: "Architecture styles (monolith, layered, microservices, event-driven, serverless)" },
      { id: "coupling-cohesion", topic_name: "Coupling and cohesion" },
      { id: "idempotency-exactly-once", topic_name: "Idempotency and exactly-once myths" },
      { id: "capacity-estimation", topic_name: "Capacity estimation" },
      { id: "adrs-tradeoff-docs", topic_name: "ADRs and tradeoff documentation" },
      { id: "distributed-systems-depth", topic_name: "Distributed systems depth (consensus, leader election, sagas, cross-service idempotency)" },
    ],
  },
  {
    id: "devops-delivery",
    domain_name: "DevOps and delivery",
    section: "A",
    archetype_tags: ["backend", "full-stack"],
    leaf_topics: [
      { id: "build-pipelines-ci", topic_name: "Build pipelines and CI" },
      { id: "deployment-strategies-rollback", topic_name: "Deployment strategies (blue-green, canary, rolling) and rollback" },
      { id: "containers", topic_name: "Containers (images, layers, Dockerfiles)" },
      { id: "orchestration-concepts", topic_name: "Orchestration concepts (pods, services, scaling)" },
      { id: "infrastructure-as-code", topic_name: "Infrastructure as code" },
      { id: "config-secrets-management", topic_name: "Configuration and secrets management" },
      { id: "environments-promotion", topic_name: "Environments and promotion" },
      { id: "artifact-dependency-management", topic_name: "Artifact and dependency management" },
    ],
  },
  {
    id: "observability-operations",
    domain_name: "Observability and operations",
    section: "A",
    archetype_tags: ["backend", "full-stack"],
    leaf_topics: [
      { id: "structured-logging", topic_name: "Structured logging" },
      { id: "metrics-dashboards", topic_name: "Metrics and dashboards" },
      { id: "distributed-tracing", topic_name: "Distributed tracing" },
      { id: "three-pillars", topic_name: "The three pillars and when each answers your question" },
      { id: "slis-slos-error-budgets", topic_name: "SLIs/SLOs/error budgets" },
      { id: "alerting-oncall", topic_name: "Alerting and on-call" },
      { id: "incident-response-postmortems", topic_name: "Incident response and blameless postmortems" },
      { id: "debugging-production", topic_name: "Debugging production from evidence" },
    ],
  },
  {
    id: "security",
    domain_name: "Security",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "owasp-core", topic_name: "OWASP core mechanisms (injection, XSS, CSRF, SSRF, broken auth)" },
      { id: "input-validation-trust-boundaries", topic_name: "Input validation at trust boundaries" },
      { id: "secrets-handling", topic_name: "Secrets handling" },
      { id: "least-privilege-iam", topic_name: "Least privilege and IAM" },
      { id: "tls-certificates", topic_name: "TLS and certificate basics" },
      { id: "dependency-supply-chain-risk", topic_name: "Dependency and supply-chain risk" },
      { id: "pii-data-classification", topic_name: "PII handling and data classification" },
      { id: "threat-modeling", topic_name: "Threat modeling at a basic level" },
    ],
  },
  {
    id: "engineering-craft",
    domain_name: "Engineering craft",
    section: "A",
    archetype_tags: ["backend", "frontend", "full-stack"],
    leaf_topics: [
      { id: "debugging-method", topic_name: "Debugging method (hypothesis, bisect, isolate)" },
      { id: "reading-unfamiliar-codebases", topic_name: "Reading unfamiliar codebases" },
      { id: "refactoring-safely", topic_name: "Refactoring safely" },
      { id: "tech-debt-tradeoffs", topic_name: "Technical debt tradeoffs and articulating them" },
      { id: "decomposition-estimation", topic_name: "Decomposition and estimation" },
      { id: "writing-docs-design-proposals", topic_name: "Writing docs and design proposals" },
      { id: "code-review-judgment", topic_name: "Code review judgment" },
    ],
  },
  {
    id: "performance-engineering",
    domain_name: "Performance engineering",
    section: "A",
    archetype_tags: ["backend", "full-stack"],
    leaf_topics: [
      { id: "profiling-methodology", topic_name: "Profiling methodology" },
      { id: "finding-actual-bottleneck", topic_name: "Finding the actual bottleneck vs. guessing" },
      { id: "load-testing", topic_name: "Load testing" },
      { id: "capacity-planning", topic_name: "Capacity planning at real numbers" },
    ],
  },

  // ── Section B — Senior/Leadership Layer ──

  {
    id: "ambiguity-and-scope",
    domain_name: "Ambiguity and scope",
    section: "B",
    archetype_tags: ["senior"],
    leaf_topics: [
      { id: "ill-defined-to-scoped-plan", topic_name: "Turning an ill-defined problem into a scoped plan" },
      { id: "pushing-back-on-requirements", topic_name: "Pushing back on requirements that don't hold up" },
      { id: "deciding-what-not-to-build", topic_name: "Deciding what not to build" },
      { id: "prompt-to-design-doc", topic_name: "One-line prompt → design doc" },
    ],
  },
  {
    id: "technical-leadership-influence",
    domain_name: "Technical leadership and influence",
    section: "B",
    archetype_tags: ["senior"],
    leaf_topics: [
      { id: "writing-rfcs-adrs-buyin", topic_name: "Writing an RFC/ADR and getting buy-in from skeptics" },
      { id: "running-design-review", topic_name: "Running a design review" },
      { id: "disagree-and-commit", topic_name: "Disagreeing and committing" },
      { id: "saying-no-to-senior", topic_name: "Saying no to a bad idea from someone senior" },
      { id: "negotiating-scope-across-teams", topic_name: "Negotiating scope across teams" },
    ],
  },
  {
    id: "mentorship-multiplier",
    domain_name: "Mentorship and multiplier effect",
    section: "B",
    archetype_tags: ["senior"],
    leaf_topics: [
      { id: "code-review-as-teaching", topic_name: "Code review as teaching, not gatekeeping" },
      { id: "raising-team-bar", topic_name: "Raising the bar for a team" },
      { id: "onboarding-others", topic_name: "Onboarding others into a codebase" },
      { id: "struggle-vs-unblock", topic_name: "Knowing when to let someone struggle vs. unblock them" },
    ],
  },
  {
    id: "org-scale-technical-ownership",
    domain_name: "Organizational-scale technical ownership",
    section: "B",
    archetype_tags: ["senior"],
    leaf_topics: [
      { id: "migration-deprecation-strategy", topic_name: "Migration and deprecation strategy (strangler fig, sunset plans)" },
      { id: "build-vs-buy", topic_name: "Build vs. buy and vendor evaluation" },
      { id: "org-wide-fix-from-postmortem", topic_name: "Driving an org-wide fix from a single postmortem" },
      { id: "legacy-system-stewardship", topic_name: "Legacy system stewardship" },
    ],
  },
  {
    id: "judgment-calls",
    domain_name: "Judgment calls",
    section: "B",
    archetype_tags: ["senior"],
    leaf_topics: [
      { id: "good-enough-vs-debt", topic_name: '"Good enough" vs. technical debt being smuggled in' },
      { id: "pragmatism-vs-perfectionism", topic_name: "Pragmatism vs. perfectionism" },
      { id: "escalate-vs-absorb-risk", topic_name: "When to escalate vs. absorb a risk" },
    ],
  },
];

export function getAllLeafTopicIds(): string[] {
  return DOMAINS.flatMap((d) => d.leaf_topics.map((t) => t.id));
}

export function getTopicCount(): { sectionA: number; sectionB: number; total: number } {
  const sectionA = DOMAINS.filter((d) => d.section === "A").reduce(
    (acc, d) => acc + d.leaf_topics.length,
    0
  );
  const sectionB = DOMAINS.filter((d) => d.section === "B").reduce(
    (acc, d) => acc + d.leaf_topics.length,
    0
  );
  return { sectionA, sectionB, total: sectionA + sectionB };
}
