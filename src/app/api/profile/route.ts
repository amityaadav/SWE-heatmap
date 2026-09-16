import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { Domain, LeafTopic, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const profileDoc = await adminDb.doc("profile/main").get();
  if (!profileDoc.exists) {
    return NextResponse.json({ domains: {} } satisfies Profile);
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

  return NextResponse.json({ domains } satisfies Profile);
}
