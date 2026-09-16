import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { TopicCatalogEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await adminDb.collection("topic_catalog").get();
  const catalog: Record<string, TopicCatalogEntry> = {};

  for (const doc of snap.docs) {
    catalog[doc.id] = doc.data() as TopicCatalogEntry;
  }

  return NextResponse.json(catalog);
}
