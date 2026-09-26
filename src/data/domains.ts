import domainsData from "./domains.json";

export interface DomainSeed {
  id: string;
  domain_name: string;
  section: "A" | "B";
  archetype_tags: string[];
  leaf_topics: { id: string; topic_name: string }[];
}

export const DOMAINS: DomainSeed[] = domainsData as DomainSeed[];

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
