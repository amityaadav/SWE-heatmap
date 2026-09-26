"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Auth, User } from "firebase/auth";
import { DOMAINS, TIER_LABELS } from "@/data/domains";
import type { DepthLevel } from "@/lib/types";
import { DEPTH_NUMERIC } from "@/lib/types";

type Step = "loading-question" | "answer" | "submitting" | "result";

interface JudgeResult {
  depth_level: DepthLevel;
  judge_notes: string;
}

interface FlatTopic {
  domainId: string;
  domainName: string;
  tier: number;
  id: string;
  topic_name: string;
}

// Flatten the (already tier/order-sorted) domain catalog into a single
// ordered list of topics — this is the canonical assessment sequence.
const ALL_TOPICS: FlatTopic[] = DOMAINS.flatMap((d) =>
  d.leaf_topics.map((t) => ({
    domainId: d.id,
    domainName: d.domain_name,
    tier: d.tier,
    id: t.id,
    topic_name: t.topic_name,
  }))
);

export default function AssessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center py-16">
          <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
          <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
            Loading...
          </p>
        </div>
      }
    >
      <AssessPageInner />
    </Suspense>
  );
}

function AssessPageInner() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>("loading-question");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState("");

  const deepLinkHandled = useRef(false);
  const questionLoadedFor = useRef<number | null>(null);

  const topic = ALL_TOPICS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === ALL_TOPICS.length - 1;

  // ---- auth ----
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

  const getToken = useCallback(async () => {
    if (!user) throw new Error("Not signed in");
    return user.getIdToken();
  }, [user]);

  const loadQuestion = useCallback(
    async (targetIndex: number) => {
      const t = ALL_TOPICS[targetIndex];
      if (!t) return;
      setCurrentIndex(targetIndex);
      setStep("loading-question");
      setQuestion("");
      setAnswer("");
      setResult(null);
      setError("");
      try {
        const token = await getToken();
        const res = await fetch("/api/question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ topicName: t.topic_name }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setQuestion(data.question);
        questionLoadedFor.current = targetIndex;
        setStep("answer");
      } catch (err) {
        setError(`Failed to generate question: ${(err as Error).message}`);
        setStep("answer");
      }
    },
    [getToken]
  );

  // Deep-link from dashboard "Assess this topic": jump straight to that topic.
  useEffect(() => {
    if (deepLinkHandled.current || !user || authLoading) return;
    const domainId = searchParams.get("domain");
    const topicId = searchParams.get("topic");
    if (!domainId || !topicId) return;
    const idx = ALL_TOPICS.findIndex((t) => t.domainId === domainId && t.id === topicId);
    if (idx === -1) return;
    deepLinkHandled.current = true;
    loadQuestion(idx);
  }, [user, authLoading, searchParams, loadQuestion]);

  // Initial entry (no deep link): start from the first topic.
  useEffect(() => {
    if (!user || authLoading) return;
    if (deepLinkHandled.current) return;
    if (questionLoadedFor.current !== null) return;
    loadQuestion(0);
  }, [user, authLoading, loadQuestion]);

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

  async function handleSubmitAnswer() {
    if (!topic || !answer.trim()) return;
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
          domainId: topic.domainId,
          leafTopicId: topic.id,
          topicName: topic.topic_name,
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

  function goPrev() {
    if (!isFirst) loadQuestion(currentIndex - 1);
  }

  function goNext() {
    if (!isLast) loadQuestion(currentIndex + 1);
  }

  function handleSkip() {
    goNext();
  }

  function handleJump(event: React.ChangeEvent<HTMLSelectElement>) {
    const idx = Number(event.target.value);
    if (!Number.isNaN(idx)) loadQuestion(idx);
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
        <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
          Loading...
        </p>
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
          Sign in to take an assessment. You'll work through topics in order —
          starting from the first — and can skip ahead or jump between sections.
        </p>
        <button
          onClick={handleSignIn}
          disabled={!firebaseAuth}
          className="border border-ink bg-ink px-[18px] py-[10px] font-mono text-[11px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
        >
          Sign in with Google
        </button>
        {error && <p className="mt-4 text-[13px] text-depth-0">{error}</p>}
      </div>
    );
  }

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

      {/* Progress + section jump */}
      <div className="mb-6 flex flex-wrap items-center gap-[10px]">
        <span className="font-mono text-[11px] uppercase tracking-[.12em] text-ink-3">
          Topic {currentIndex + 1} of {ALL_TOPICS.length}
        </span>
        <div className="ml-auto flex items-center gap-[10px]">
          <label className="font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-3">
            Jump to
          </label>
          <select
            value={currentIndex}
            onChange={handleJump}
            className="border border-rule bg-paper-2 px-[10px] py-[7px] font-mono text-[12px] text-ink focus:border-ink focus:outline-none"
          >
            {ALL_TOPICS.map((t, i) => (
              <option key={`${t.domainId}:${t.id}`} value={i}>
                {TIER_LABELS[t.tier]} · {t.domainName} — {t.topic_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 border border-depth-0 p-3 text-[13px]"
          style={{ backgroundColor: "var(--L0)", color: "var(--L0-ink)" }}
        >
          {error}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">
        {TIER_LABELS[topic.tier]} › {topic.domainName} › {topic.topic_name}
      </div>

      {/* Loading question */}
      {step === "loading-question" && (
        <div className="flex flex-col items-center py-16">
          <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
          <p className="text-[13px] text-ink-2">
            Generating probe question for{" "}
            <strong className="font-semibold text-ink">{topic.topic_name}</strong>...
          </p>
        </div>
      )}

      {/* Answer */}
      {step === "answer" && (
        <div>
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
          <div className="flex flex-wrap gap-[8px]">
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim()}
              className="border border-ink bg-ink px-[18px] py-[10px] font-mono text-[11px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
            >
              Submit for Evaluation
            </button>
            <button
              onClick={handleSkip}
              className="border border-ink bg-paper px-[14px] py-[10px] font-mono text-[11px] uppercase tracking-[.1em] text-ink transition-colors hover:bg-paper-2"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center py-16">
          <div className="mb-4 h-6 w-6 animate-spin border-2 border-rule border-t-ink" />
          <p className="text-[13px] text-ink-2">
            Evaluating your answer on{" "}
            <strong className="font-semibold text-ink">{topic.topic_name}</strong>...
          </p>
        </div>
      )}

      {/* Result */}
      {step === "result" && result && (
        <div>
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
              <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-ink-3">
                Question
              </h3>
              <p className="text-[14px] leading-[1.55]">{question}</p>
            </div>

            <div className="mb-4 border-t border-rule pt-3">
              <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-ink-3">
                Your answer
              </h3>
              <p className="text-[14px] leading-[1.55] text-ink-2">{answer}</p>
            </div>

            <div className="border-t border-rule pt-3">
              <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-ink-3">
                Judge notes
              </h3>
              <p className="text-[14px] leading-[1.55]">{result.judge_notes}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-[8px]">
            {!isLast ? (
              <button
                onClick={goNext}
                className="border border-ink bg-ink px-[14px] py-[8px] font-mono text-[10px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2"
              >
                Next topic →
              </button>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
                End of assessment
              </span>
            )}
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="border border-ink bg-paper px-[14px] py-[8px] font-mono text-[10px] uppercase tracking-[.1em] text-ink transition-colors hover:bg-paper-2 disabled:opacity-40"
            >
              ← Previous
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
