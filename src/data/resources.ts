import type { Resource } from "@/lib/types";
import resourcesData from "./resources.json";

// Source of truth for curated learning resources, keyed by leaf-topic id.
// Mirrors the domains.json pattern: static, committed, manually curated.
const RESOURCES = resourcesData as Record<string, Resource[]>;

export function getResourcesForTopic(topicId: string): Resource[] {
  return RESOURCES[topicId] || [];
}
