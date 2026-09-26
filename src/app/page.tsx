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
    <>
      <h1 className="mb-[14px] max-w-[19ch] font-display text-[clamp(30px,5.2vw,58px)] font-bold leading-[1.02] tracking-[-0.028em]">
        What you know about software engineering, and{" "}
        <em className="not-italic text-depth-0">where the map goes dark</em>.
      </h1>
      <p className="mb-4 max-w-[60ch] text-[clamp(15px,1.5vw,17px)] text-ink-2">
        Every topic scored against evidence from LLM-judged assessments.
        Click any cell for the reasoning behind its score.
        Click a legend swatch to isolate one band.
      </p>
      <Heatmap profile={profile} />
    </>
  );
}
