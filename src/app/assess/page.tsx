"use client";

import { useState, useEffect, useCallback } from "react";
import type { Auth, User } from "firebase/auth";
import { DOMAINS, TIER_LABELS, type DomainSeed } from "@/data/domains";
import type { DepthLevel } from "@/lib/types";

type Step = "pick-domain" | "pick-topic" | "loading-question" | "answer" | "submitting" | "result";

interface JudgeResult {
  depth_level: DepthLevel;
  judge_notes: string;
}

const DEPTH_COLORS: Record<string, string> = {
  Unaware: "bg-gray-200 text-gray-700",
  Recognize: "bg-blue-100 text-blue-800",
  Explain: "bg-blue-200 text-blue-900",
  Apply: "bg-blue-400 text-white",
  "Debug under pressure": "bg-blue-600 text-white",
  Teach: "bg-blue-800 text-white",
};

export default function AssessPage() {
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
      <div className="flex flex-col items-center py-12">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Assessment</h1>
        <p className="mb-8 text-[var(--text-secondary)]">
          Sign in to take an assessment. The LLM judge will evaluate your answers
          against a software engineering hiring rubric.
        </p>
        <button
          onClick={handleSignIn}
          disabled={!firebaseAuth}
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Sign in with Google
        </button>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  const tiers = [...new Set(DOMAINS.map((d) => d.tier))].sort((a, b) => a - b);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessment</h1>
        <span className="text-sm text-ink-3">
          {user.displayName}
        </span>
      </div>

      {error && (
        <div className="mb-4 border border-depth-0 bg-[#fef2f2] p-3 text-sm text-depth-0">
          {error}
        </div>
      )}

      {/* Step 1: Pick domain */}
      {step === "pick-domain" && (
        <div>
          <p className="mb-6 text-ink-2">
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
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tierDomains.map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => { setSelectedDomain(domain); setStep("pick-topic"); }}
                      className="border border-rule bg-paper-2 p-3 text-left transition-colors hover:border-ink hover:bg-white"
                    >
                      <p className="font-display text-sm font-bold">{domain.domain_name}</p>
                      <p className="mt-1 font-mono text-[11px] text-ink-3">
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
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            &larr; Back to domains
          </button>
          <h2 className="mb-2 text-lg font-semibold">{selectedDomain.domain_name}</h2>
          <p className="mb-6 text-[var(--text-secondary)]">
            Pick a leaf topic to assess.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {selectedDomain.leaf_topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handlePickTopic(topic)}
                className="rounded-lg border border-[var(--border)] p-3 text-left hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                {topic.topic_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Loading question */}
      {step === "loading-question" && (
        <div className="flex flex-col items-center py-12">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-[var(--text-secondary)]">
            Generating probe question for <strong>{selectedTopic?.topic_name}</strong>...
          </p>
        </div>
      )}

      {/* Step 4: Answer the question */}
      {step === "answer" && selectedTopic && (
        <div>
          <button
            onClick={() => { setStep("pick-topic"); setQuestion(""); setAnswer(""); }}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            &larr; Back to topics
          </button>
          <div className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
            {selectedDomain?.domain_name} &rsaquo; {selectedTopic.topic_name}
          </div>
          <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <p className="font-medium">{question}</p>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... (2-5 sentences that show your depth of understanding)"
            rows={6}
            className="mb-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim()}
            className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Submit for Evaluation
          </button>
        </div>
      )}

      {/* Step 5: Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center py-12">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-[var(--text-secondary)]">
            Evaluating your answer on <strong>{selectedTopic?.topic_name}</strong>...
          </p>
        </div>
      )}

      {/* Step 6: Result */}
      {step === "result" && result && selectedTopic && (
        <div>
          <div className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
            {selectedDomain?.domain_name} &rsaquo; {selectedTopic.topic_name}
          </div>

          <div className="mb-6 rounded-lg border border-[var(--border)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${DEPTH_COLORS[result.depth_level] || "bg-gray-200"}`}>
                {result.depth_level}
              </span>
            </div>

            <div className="mb-4">
              <h3 className="mb-1 text-sm font-semibold text-[var(--text-secondary)]">Question</h3>
              <p>{question}</p>
            </div>

            <div className="mb-4">
              <h3 className="mb-1 text-sm font-semibold text-[var(--text-secondary)]">Your answer</h3>
              <p className="text-[var(--text-secondary)]">{answer}</p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-[var(--text-secondary)]">Judge notes</h3>
              <p>{result.judge_notes}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAssessAnother}
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Assess another topic in this domain
            </button>
            <button
              onClick={handleStartOver}
              className="rounded-md border border-[var(--border)] px-6 py-3 font-medium hover:bg-[var(--bg-secondary)]"
            >
              Pick a different domain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
