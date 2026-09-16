export type DepthLevel =
  | "Unaware"
  | "Recognize"
  | "Explain"
  | "Apply"
  | "Debug under pressure"
  | "Teach";

export const DEPTH_LEVELS: DepthLevel[] = [
  "Unaware",
  "Recognize",
  "Explain",
  "Apply",
  "Debug under pressure",
  "Teach",
];

export const DEPTH_NUMERIC: Record<DepthLevel, number> = {
  Unaware: 0,
  Recognize: 1,
  Explain: 2,
  Apply: 3,
  "Debug under pressure": 4,
  Teach: 5,
};

export interface AssessmentHistoryEntry {
  depth_level: DepthLevel;
  timestamp: string;
  judge_notes: string;
}

export interface LeafTopic {
  topic_name: string;
  depth_level: DepthLevel;
  last_assessed: string | null;
  judge_notes: string;
  assessed: boolean;
  assessment_history: AssessmentHistoryEntry[];
}

export interface Domain {
  domain_name: string;
  archetype_tags: string[];
  leaf_topics: Record<string, LeafTopic>;
}

export interface Profile {
  domains: Record<string, Domain>;
}

export interface Resource {
  rank: number;
  type: "article" | "video" | "doc" | "course" | "tool" | "book";
  title: string;
  url: string;
  source: string;
}

export interface TopicCatalogEntry {
  topic_name: string;
  domain_id: string;
  resources: Resource[];
}

export function computeDomainAverage(domain: Domain): number | null {
  const assessed = Object.values(domain.leaf_topics).filter((t) => t.assessed);
  if (assessed.length === 0) return null;
  const sum = assessed.reduce((acc, t) => acc + DEPTH_NUMERIC[t.depth_level], 0);
  return sum / assessed.length;
}
