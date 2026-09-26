"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Auth, User } from "firebase/auth";
import { DOMAINS, TIER_LABELS, type DomainSeed } from "@/data/domains";
import type { DepthLevel } from "@/lib/types";
import { DEPTH_NUMERIC } from "@/lib/types";

type Step = "pick-domain" | "pick-topic" | "loading-question" | "answer" | "submitting" | "result";

interface JudgeResult {
  depth_level: DepthLevel;
  judge_notes: string;
}

export default function AssessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center py-16">
        <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
        <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">Loading...</p>
      </div>
    }>
      <AssessPageInner />
    </Suspense>
  );
}

function AssessPageInner() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
  const [step, setStep] = useState<Step>("pick-domain");
  const [selectedDomain, setSelectedDomain] = useState<DomainSeed | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; topic_name: string } | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState("");

  const [authLoading, setAuthLoading] = useState(true);
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    import("@/lib/firebase-client").then(async (mod) => {
      setFirebaseAuth(mod.auth);
      const { onAuthStateChanged } = await import("firebase/auth");
      onAuthStateChanged(mod.auth, (u) => {
        setUser(u);
        setAuthLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (deepLinkHandled.current || !user || authLoading) return;
    const domainId = searchParams.get("domain");
    const topicId = searchParams.get("topic");
    if (!domainId || !topicId) return;

    const domain = DOMAINS.find((d) => d.id === domainId);
    if (!domain) return;
    const topic = domain.leaf_topics.find((t) => t.id === topicId);
    if (!topic) return;

    deepLinkHandled.current = true;
    setSelectedDomain(domain);
    handlePickTopic(topic);
  }, [user, authLoading, searchParams]);

  async function handleSignIn() {
    if (!firebaseAuth) return;
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(firebaseAuth, provider);
      setUser(cred.user);
    } catch (err) {
      setError(`Sign-in failed: ${(err as Error).message}`);
    }
  }

  const getToken = useCallback(async () => {
    if (!user) throw new Error("Not signed in");
    return user.getIdToken();
  }, [user]);

  async function handlePickTopic(topic: { id: string; topic_name: string }) {
    setSelectedTopic(topic);
    setStep("loading-question");
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topicName: topic.topic_name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setQuestion(data.question);
      setStep("answer");
    } catch (err) {
      setError(`Failed to generate question: ${(err as Error).message}`);
      setStep("pick-topic");
    }
  }

  async function handleSubmitAnswer() {
    if (!selectedDomain || !selectedTopic || !answer.trim()) return;
    setStep("submitting");
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          domainId: selectedDomain.id,
          leafTopicId: selectedTopic.id,
          topicName: selectedTopic.topic_name,
          question,
          answer: answer.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch (err) {
      setError(`Assessment failed: ${(err as Error).message}`);
      setStep("answer");
    }
  }

  function handleStartOver() {
    setSelectedDomain(null);
    setSelectedTopic(null);
    setQuestion("");
    setAnswer("");
    setResult(null);
    setError("");
    setStep("pick-domain");
  }

  function handleAssessAnother() {
    setSelectedTopic(null);
    setQuestion("");
    setAnswer("");
    setResult(null);
    setError("");
    setStep("pick-topic");
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
        <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1 className="mb-[14px] font-display text-[clamp(24px,4vw,40px)] font-bold leading-[1.08] tracking-[-0.02em]">
          Assessment
        </h1>
        <p className="mb-8 max-w-[50ch] text-[clamp(14px,1.4vw,16px)] leading-[1.55] text-ink-2">
          Sign in to take an assessment. The LLM judge will evaluate your answers
          against a six-level software engineering rubric.
        </p>
        <button
          onClick={handleSignIn}
          disabled={!firebaseAuth}
          className="border border-ink bg-ink px-[18px] py-[10px] font-mono text-[11px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
        >
          Sign in with Google
        </button>
        {error && (
          <p className="mt-4 text-[13px] text-depth-0">{error}</p>
        )}
      </div>
    );
  }

  const tiers = [...new Set(DOMAINS.map((d) => d.tier))].sort((a, b) => a - b);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[clamp(24px,4vw,40px)] font-bold leading-[1.08] tracking-[-0.02em]">
          Assessment
        </h1>
        <span className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
          {user.displayName}
        </span>
      </div>

      {error && (
        <div className="mb-4 border border-depth-0 p-3 text-[13px]" style={{ backgroundColor: "var(--L0)", color: "var(--L0-ink)" }}>
          {error}
        </div>
      )}

      {/* Step 1: Pick domain */}
      {step === "pick-domain" && (
        <div>
          <p className="mb-6 text-[15px] leading-[1.55] text-ink-2">
            Choose a domain to assess. Domains are ordered progressively — foundations first.
          </p>

          {tiers.map((tier) => {
            const tierDomains = DOMAINS
              .filter((d) => d.tier === tier)
              .sort((a, b) => a.order - b.order);
            return (
              <div key={tier} className="mb-8">
                <h2 className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[.15em] text-ink-3">
                  Tier {tier} — {TIER_LABELS[tier]}
                </h2>
                <div className="grid gap-[2px] sm:grid-cols-2 lg:grid-cols-3">
                  {tierDomains.map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => { setSelectedDomain(domain); setStep("pick-topic"); }}
                      className="border border-rule bg-paper-2 p-[12px_14px] text-left transition-all hover:border-ink hover:-translate-y-[1px] hover:shadow-[0_3px_0_0_var(--ink)]"
                    >
                      <p className="font-display text-[14px] font-bold tracking-[-0.01em]">{domain.domain_name}</p>
                      <p className="mt-1 font-mono text-[10.5px] text-ink-3">
                        {domain.leaf_topics.length} topics · {domain.archetype_tags.join(", ")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 2: Pick topic */}
      {step === "pick-topic" && selectedDomain && (
        <div>
          <button
            onClick={handleStartOver}
            className="mb-4 font-mono text-[11px] uppercase tracking-[.1em] text-ink-3 hover:text-ink"
          >
            ← Back to domains
          </button>
          <h2 className="mb-2 font-display text-[20px] font-bold tracking-[-0.015em]">{selectedDomain.domain_name}</h2>
          <p className="mb-6 text-[14px] text-ink-2">
            Pick a topic to assess.
          </p>
          <div className="grid gap-[2px] sm:grid-cols-2">
            {selectedDomain.leaf_topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handlePickTopic(topic)}
                className="border border-rule bg-paper-2 p-[12px_14px] text-left font-mono text-[12px] leading-[1.35] transition-all hover:border-ink hover:-translate-y-[1px] hover:shadow-[0_3px_0_0_var(--ink)]"
              >
                {topic.topic_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Loading question */}
      {step === "loading-question" && (
        <div className="flex flex-col items-center py-16">
          <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
          <p className="text-[13px] text-ink-2">
            Generating probe question for <strong className="font-semibold text-ink">{selectedTopic?.topic_name}</strong>...
          </p>
        </div>
      )}

      {/* Step 4: Answer the question */}
      {step === "answer" && selectedTopic && (
        <div>
          <button
            onClick={() => { setStep("pick-topic"); setQuestion(""); setAnswer(""); }}
            className="mb-4 font-mono text-[11px] uppercase tracking-[.1em] text-ink-3 hover:text-ink"
          >
            ← Back to topics
          </button>
          <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">
            {selectedDomain?.domain_name} › {selectedTopic.topic_name}
          </div>
          <div className="mb-6 border border-ink bg-paper-2 p-[16px]">
            <p className="font-display text-[15px] font-bold leading-[1.4]">{question}</p>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... (2-5 sentences that show your depth of understanding)"
            rows={6}
            className="mb-4 w-full border border-rule bg-paper p-[12px] font-body text-[14px] leading-[1.55] text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim()}
            className="border border-ink bg-ink px-[18px] py-[10px] font-mono text-[11px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
          >
            Submit for Evaluation
          </button>
        </div>
      )}

      {/* Step 5: Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center py-16">
          <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
          <p className="text-[13px] text-ink-2">
            Evaluating your answer on <strong className="font-semibold text-ink">{selectedTopic?.topic_name}</strong>...
          </p>
        </div>
      )}

      {/* Step 6: Result */}
      {step === "result" && result && selectedTopic && (
        <div>
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">
            {selectedDomain?.domain_name} › {selectedTopic.topic_name}
          </div>

          <div className="mb-6 border border-ink p-[20px]">
            <div className="mb-4 inline-flex items-center gap-[7px] border border-ink px-[10px] py-[5px] font-mono text-[11px] uppercase tracking-[.1em]">
              <span
                className="block h-[12px] w-[12px]"
                style={{ backgroundColor: `var(--L${DEPTH_NUMERIC[result.depth_level]})` }}
              />
              <span style={{ color: `var(--L${DEPTH_NUMERIC[result.depth_level]}-ink)` }}>
                {DEPTH_NUMERIC[result.depth_level]} · {result.depth_level}
              </span>
            </div>

            <div className="mb-4 border-t border-rule pt-3">
              <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-ink-3">Question</h3>
              <p className="text-[14px] leading-[1.55]">{question}</p>
            </div>

            <div className="mb-4 border-t border-rule pt-3">
              <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-ink-3">Your answer</h3>
              <p className="text-[14px] leading-[1.55] text-ink-2">{answer}</p>
            </div>

            <div className="border-t border-rule pt-3">
              <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-ink-3">Judge notes</h3>
              <p className="text-[14px] leading-[1.55]">{result.judge_notes}</p>
            </div>
          </div>

          <div className="flex gap-[8px]">
            <button
              onClick={handleAssessAnother}
              className="border border-ink bg-ink px-[14px] py-[8px] font-mono text-[10px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2"
            >
              Assess another topic
            </button>
            <button
              onClick={handleStartOver}
              className="border border-ink bg-paper px-[14px] py-[8px] font-mono text-[10px] uppercase tracking-[.1em] text-ink transition-colors hover:bg-paper-2"
            >
              Pick a different domain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
