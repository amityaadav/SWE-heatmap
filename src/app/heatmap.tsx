"use client";

import { useState } from "react";
import { DEPTH_LEVELS, DEPTH_NUMERIC, computeDomainAverage } from "@/lib/types";
import type { Profile, Domain, DepthLevel } from "@/lib/types";

const DEPTH_BG: Record<DepthLevel, string> = {
  Unaware: "bg-depth-unaware",
  Recognize: "bg-depth-recognize",
  Explain: "bg-depth-explain",
  Apply: "bg-depth-apply",
  "Debug under pressure": "bg-depth-debug",
  Teach: "bg-depth-teach",
};

const DEPTH_TEXT: Record<DepthLevel, string> = {
  Unaware: "text-gray-600 dark:text-gray-400",
  Recognize: "text-blue-800 dark:text-blue-200",
  Explain: "text-blue-800 dark:text-blue-200",
  Apply: "text-blue-900 dark:text-blue-100",
  "Debug under pressure": "text-white",
  Teach: "text-white",
};

function depthColor(avg: number | null): string {
  if (avg === null) return "bg-depth-unaware";
  if (avg < 1) return "bg-depth-unaware";
  if (avg < 2) return "bg-depth-recognize";
  if (avg < 3) return "bg-depth-explain";
  if (avg < 4) return "bg-depth-apply";
  if (avg < 5) return "bg-depth-debug";
  return "bg-depth-teach";
}

function depthLabel(avg: number | null): string {
  if (avg === null) return "Not assessed";
  const rounded = Math.round(avg);
  return DEPTH_LEVELS[rounded] || "Not assessed";
}

export default function Heatmap({ profile }: { profile: Profile }) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const domainEntries = Object.entries(profile.domains);

  if (domainEntries.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-lg font-medium">No assessment data yet</p>
        <p className="mt-2 text-[var(--text-secondary)]">
          Sign in and take an assessment to populate the heatmap.
        </p>
      </div>
    );
  }

  function toggleDomain(id: string) {
    setExpandedDomain((prev) => (prev === id ? null : id));
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {domainEntries.map(([id, domain]) => {
        const avg = computeDomainAverage(domain);
        const topics = Object.entries(domain.leaf_topics);
        const assessedCount = topics.filter(([, t]) => t.assessed).length;
        const isExpanded = expandedDomain === id;

        return (
          <div
            key={id}
            className={`rounded-lg border border-[var(--border)] transition-all ${
              isExpanded ? "sm:col-span-2 lg:col-span-4" : ""
            }`}
          >
            <button
              onClick={() => toggleDomain(id)}
              className="w-full p-4 text-left"
            >
              <div className={`mb-3 h-2 rounded-full ${depthColor(avg)}`} />
              <h2 className="font-semibold">{domain.domain_name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {depthLabel(avg)} — {assessedCount}/{topics.length} topics assessed
              </p>
              {avg !== null && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Avg: {avg.toFixed(1)} / {DEPTH_NUMERIC["Teach"]}
                </p>
              )}
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                {isExpanded ? "Click to collapse" : "Click to expand topics"}
              </p>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--border)] p-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {topics.map(([topicId, topic]) => (
                    <div
                      key={topicId}
                      className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3"
                    >
                      <span
                        className={`inline-block h-3 w-3 flex-shrink-0 rounded-full ${
                          DEPTH_BG[topic.depth_level]
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">
                          {topic.topic_name}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {topic.assessed ? topic.depth_level : "Not assessed"}
                        </p>
                      </div>
                      {topic.assessed && (
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            DEPTH_BG[topic.depth_level]
                          } ${DEPTH_TEXT[topic.depth_level]}`}
                        >
                          {DEPTH_NUMERIC[topic.depth_level]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {topics.some(([, t]) => t.assessed && t.judge_notes) && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                      Recent judge notes
                    </h3>
                    {topics
                      .filter(([, t]) => t.assessed && t.judge_notes)
                      .slice(0, 3)
                      .map(([topicId, topic]) => (
                        <div
                          key={topicId}
                          className="rounded-md bg-[var(--bg-secondary)] p-3"
                        >
                          <p className="text-xs font-medium">
                            {topic.topic_name}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {topic.judge_notes}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
