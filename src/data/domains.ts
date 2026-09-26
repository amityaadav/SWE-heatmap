import domainsData from "./domains.json";

export interface DomainSeed {
  id: string;
  domain_name: string;
  tier: number;
  order: number;
  archetype_tags: string[];
  leaf_topics: { id: string; topic_name: string }[];
}

export const DOMAINS: DomainSeed[] = domainsData as DomainSeed[];

export const TIER_LABELS: Record<number, string> = {
  1: "Foundations",
  2: "Core Engineering Practice",
  3: "Web & Data Fundamentals",
  4: "Design & Infrastructure",
  5: "Advanced Technical",
  6: "Senior / Leadership",
};

export function getAllLeafTopicIds(): string[] {
  return DOMAINS.flatMap((d) => d.leaf_topics.map((t) => t.id));
}

export function getTopicCount(): { total: number; byTier: Record<number, number> } {
  const byTier: Record<number, number> = {};
  for (const d of DOMAINS) {
    byTier[d.tier] = (byTier[d.tier] || 0) + d.leaf_topics.length;
  }
  const total = DOMAINS.reduce((acc, d) => acc + d.leaf_topics.length, 0);
  return { total, byTier };
}
