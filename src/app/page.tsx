import { adminDb } from "@/lib/firebase-admin";
import type { Profile, Domain, LeafTopic } from "@/lib/types";
import Heatmap from "./heatmap";

export const dynamic = "force-dynamic";

async function getProfile(): Promise<Profile> {
  try {
    const profileDoc = await adminDb.doc("profile/main").get();
    if (!profileDoc.exists) {
      return { domains: {} };
    }

    const domainsSnap = await adminDb.collection("profile/main/domains").get();
    const domains: Record<string, Domain> = {};

    for (const domainDoc of domainsSnap.docs) {
      const domainData = domainDoc.data();
      const leafSnap = await adminDb
        .collection(`profile/main/domains/${domainDoc.id}/leaf_topics`)
        .get();

      const leafTopics: Record<string, LeafTopic> = {};
      for (const leafDoc of leafSnap.docs) {
        leafTopics[leafDoc.id] = leafDoc.data() as LeafTopic;
      }

      domains[domainDoc.id] = {
        domain_name: domainData.domain_name,
        archetype_tags: domainData.archetype_tags || [],
        leaf_topics: leafTopics,
      };
    }

    return { domains };
  } catch {
    return { domains: {} };
  }
}

export default async function Dashboard() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Software Engineering Knowledge Heatmap</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Public dashboard — click any domain to see individual topic scores.
      </p>
      <Heatmap profile={profile} />
    </div>
  );
}
