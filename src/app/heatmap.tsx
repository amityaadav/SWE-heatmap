"use client";

import { useState, useCallback } from "react";
import { DEPTH_NUMERIC, computeDomainAverage } from "@/lib/types";
import type { Profile, DepthLevel } from "@/lib/types";

const LEVELS: { key: number; level: DepthLevel; desc: string }[] = [
  { key: 0, level: "Unaware",             desc: "No demonstrated knowledge" },
  { key: 1, level: "Recognize",           desc: "Can identify the concept" },
  { key: 2, level: "Explain",             desc: "Can explain with reasoning" },
  { key: 3, level: "Apply",              desc: "Solves real problems with it" },
  { key: 4, level: "Debug under pressure", desc: "Diagnoses subtle issues" },
  { key: 5, level: "Teach",              desc: "Can teach & compare alternatives" },
];

function levelToNumeric(level: DepthLevel): number {
  return DEPTH_NUMERIC[level];
}

interface SelectedTopic {
  name: string;
  level: DepthLevel;
  numeric: number;
  notes: string;
  domain: string;
  assessed: boolean;
}

export default function Heatmap({ profile }: { profile: Profile }) {
  const [selected, setSelected] = useState<SelectedTopic | null>(null);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [railOpen, setRailOpen] = useState(false);

  const domainEntries = Object.entries(profile.domains);

  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;

  domainEntries.forEach(([, domain]) => {
    Object.values(domain.leaf_topics).forEach((t) => {
      const n = t.assessed ? levelToNumeric(t.depth_level) : 0;
      counts[n]++;
      total++;
    });
  });

  const handleCellClick = useCallback(
    (name: string, level: DepthLevel, notes: string, domain: string, assessed: boolean) => {
      setSelected({ name, level, numeric: levelToNumeric(level), notes, domain, assessed });
      setRailOpen(true);
    },
    []
  );

  const handleDeselect = useCallback(() => {
    setSelected(null);
    setRailOpen(false);
  }, []);

  const toggleFilter = useCallback((lvl: number) => {
    setActiveFilter((prev) => (prev === lvl ? null : lvl));
  }, []);

  if (domainEntries.length === 0) {
    return (
      <div className="border border-dashed border-rule p-16 text-center">
        <p className="font-display text-lg font-bold">No assessment data yet</p>
        <p className="mt-2 text-sm text-ink-2">
          Take an assessment to populate the heatmap.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Ribbon */}
      <div className="mb-3">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[.15em] text-ink-3">
          Overall distribution — width is proportional to topic count
        </div>
        <div className="flex h-16 w-full overflow-hidden border border-ink">
          {[5, 4, 3, 2, 1, 0].map((lvl) => {
            if (!counts[lvl]) return null;
            const pct = Math.round((counts[lvl] / total) * 100);
            return (
              <div
                key={lvl}
                className="flex min-w-0 items-end border-l border-ink px-[10px] py-2 transition-all duration-500 first:border-l-0"
                style={{
                  flex: counts[lvl],
                  backgroundColor: `var(--L${lvl})`,
                  color: `var(--L${lvl}-ink)`,
                }}
              >
                <span className="font-display text-[clamp(18px,2.6vw,30px)] font-bold leading-none tracking-[-0.03em]">
                  {counts[lvl]}
                </span>
                <span className="ml-[7px] overflow-hidden whitespace-nowrap pb-[2px] font-mono text-[10px] tracking-[.08em] opacity-85">
                  {LEVELS[lvl].level} · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend / Filter */}
      <div className="mb-[38px] grid grid-cols-3 gap-px border border-ink bg-ink sm:grid-cols-6">
        {LEVELS.map(({ key, level, desc }) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            aria-pressed={activeFilter === key}
            className={`block min-w-0 p-[11px_13px_13px] transition-colors ${
              activeFilter === key
                ? "bg-ink text-paper"
                : "bg-paper-2 text-ink hover:bg-white"
            }`}
          >
            <span className="mb-[5px] flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[.13em]">
              <span
                className="h-[14px] w-[14px] flex-shrink-0 border"
                style={{
                  backgroundColor: `var(--L${key})`,
                  borderColor: activeFilter === key ? "var(--paper)" : "var(--ink)",
                }}
              />
              <span className={activeFilter === key ? "text-paper" : "text-ink-3"}>
                {key} · {level}
              </span>
            </span>
            <span
              className={`block text-[12.5px] leading-[1.35] ${
                activeFilter === key ? "text-paper" : "text-ink-2"
              }`}
            >
              {desc} — {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid + Rail layout */}
      <div className="grid items-start gap-[clamp(20px,3vw,44px)] lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Domain grid */}
        <main>
          {domainEntries.map(([id, domain]) => {
            const topics = Object.entries(domain.leaf_topics);
            const localCounts: Record<number, number> = {
              0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
            };
            topics.forEach(([, t]) => {
              const n = t.assessed ? levelToNumeric(t.depth_level) : 0;
              localCounts[n]++;
            });

            const avg = computeDomainAverage(domain);
            const assessedCount = topics.filter(([, t]) => t.assessed).length;

            return (
              <section key={id} className="border-t border-ink py-4">
                <div className="mb-3 flex flex-wrap items-baseline gap-[14px]">
                  <h2 className="m-0 font-display text-[17px] font-bold tracking-[-0.012em]">
                    {domain.domain_name}
                  </h2>
                  <p className="m-0 min-w-0 flex-1 text-[12.5px] text-ink-3">
                    {assessedCount}/{topics.length} assessed
                    {avg !== null && ` · avg ${avg.toFixed(1)}`}
                  </p>
                  {/* Microbar */}
                  <div className="flex h-[9px] w-[132px] flex-shrink-0 overflow-hidden border border-ink">
                    {[5, 4, 3, 2, 1, 0].map((lvl) => {
                      if (!localCounts[lvl]) return null;
                      return (
                        <i
                          key={lvl}
                          className="block"
                          style={{
                            flex: localCounts[lvl],
                            backgroundColor: `var(--L${lvl})`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Cells */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(154px,1fr))] gap-1">
                  {topics.map(([topicId, topic]) => {
                    const numeric = topic.assessed
                      ? levelToNumeric(topic.depth_level)
                      : 0;
                    const isFiltered =
                      activeFilter !== null && numeric !== activeFilter;
                    const isSelected = selected?.name === topic.topic_name;

                    return (
                      <button
                        key={topicId}
                        onClick={() =>
                          handleCellClick(
                            topic.topic_name,
                            topic.assessed ? topic.depth_level : "Unaware",
                            topic.judge_notes || "",
                            domain.domain_name,
                            topic.assessed
                          )
                        }
                        className={`relative block min-h-[56px] border p-[9px_10px_10px] text-left font-mono text-[11.5px] leading-[1.28] tracking-[-0.005em] transition-all duration-150 ${
                          isFiltered
                            ? "pointer-events-none opacity-[0.14]"
                            : "hover:-translate-y-[2px] hover:shadow-[0_4px_0_0_var(--ink)]"
                        } ${isSelected ? "shadow-[0_0_0_3px_var(--ink)]" : ""}`}
                        style={{
                          backgroundColor: `var(--L${numeric})`,
                          color: `var(--L${numeric}-ink)`,
                          borderColor: "rgba(15,19,27,0.28)",
                        }}
                      >
                        <span className="absolute right-[7px] top-[6px] text-[9px] font-semibold opacity-55">
                          {numeric}
                        </span>
                        {topic.topic_name}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>

        {/* Detail Rail */}
        <aside
          className={`relative border border-ink bg-paper-2 p-[18px_18px_20px] lg:sticky lg:top-6 ${
            railOpen
              ? "fixed inset-x-0 bottom-0 z-40 max-h-[64vh] overflow-auto border-b-0 border-l-0 border-r-0 shadow-[0_-10px_30px_rgba(15,19,27,0.16)] lg:static lg:max-h-none lg:border lg:shadow-none"
              : "max-lg:hidden"
          }`}
        >
          <button
            onClick={handleDeselect}
            className="absolute right-[14px] top-3 font-mono text-[11px] uppercase tracking-[.1em] text-ink-3 hover:text-ink lg:hidden"
          >
            Close ✕
          </button>

          <div className="mb-[10px] font-mono text-[10px] uppercase tracking-[.16em] text-ink-3">
            Selected topic
          </div>

          {selected ? (
            <>
              <h3 className="mb-1 font-display text-[20px] font-bold leading-[1.14] tracking-[-0.02em]">
                {selected.name}
              </h3>
              <div className="my-2 inline-flex items-center gap-[7px] border border-ink px-2 py-[3px] font-mono text-[10.5px] uppercase tracking-[.1em]">
                <span
                  className="block h-[10px] w-[10px]"
                  style={{ backgroundColor: `var(--L${selected.numeric})` }}
                />
                <span>
                  {selected.numeric} · {selected.level}
                </span>
              </div>

              {selected.assessed ? (
                <p className="mt-[14px] text-[13.5px] leading-[1.5] text-ink-2">
                  {selected.notes || "No judge notes recorded."}
                </p>
              ) : (
                <p className="mt-[14px] text-[13.5px] leading-[1.5] text-ink-2">
                  Not yet evaluated — take an assessment to score this topic.
                </p>
              )}

              <p className="mt-[14px] border-t border-rule pt-[11px] font-mono text-[11px] leading-[1.5] text-ink-3">
                <span className="font-semibold text-ink-2">Domain</span> —{" "}
                {selected.domain}
              </p>

              <a
                href="/assess"
                className="mt-[14px] inline-block border border-ink bg-ink px-[14px] py-[6px] font-mono text-[10px] uppercase tracking-[.1em] text-paper no-underline transition-colors hover:bg-ink-2"
              >
                Assess this topic
              </a>
            </>
          ) : (
            <p className="text-[13.5px] leading-[1.5] text-ink-2">
              Every square carries the specific reason it landed where it did —
              what you demonstrated, what you only recognized, and what has never
              come up at all.
            </p>
          )}
        </aside>
      </div>

      {/* Method footer */}
      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[26px] border-t border-ink pt-[22px]">
        <div>
          <h4 className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[.15em] text-ink-3">
            How this was scored
          </h4>
          <p className="m-0 text-[13px] leading-[1.55] text-ink-2">
            Evidence-based, not self-reported. Each topic was evaluated by an LLM
            reviewing free-text explanations against a six-level rubric from
            Unaware to Teach. {total} topics across {domainEntries.length} domains.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[.15em] text-ink-3">
            The known bias
          </h4>
          <p className="m-0 text-[13px] leading-[1.55] text-ink-2">
            This maps what was demonstrated during assessments. Work done outside —
            in day jobs, personal projects, or research not referenced — is
            invisible here. Treat red cells as prompts to provide evidence, not as
            verdicts.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[.15em] text-ink-3">
            Reading breadth vs depth
          </h4>
          <p className="m-0 text-[13px] leading-[1.55] text-ink-2">
            Breadth is how much of the board is not red. Depth is how much is dark
            green. A wide band of light cells with few dark ones is the signature
            of someone who reads faster than they build — the fix is fewer new
            topics, more finished ones.
          </p>
        </div>
      </div>
    </>
  );
}
