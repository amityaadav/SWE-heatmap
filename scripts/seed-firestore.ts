/**
 * Seeds Firestore with the domain/leaf-topic structure and empty topic_catalog entries.
 *
 * Usage:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY env var.
 */

import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { DOMAINS, getTopicCount } from "../src/data/domains";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const app = serviceAccount
  ? initializeApp({ credential: cert(JSON.parse(serviceAccount) as ServiceAccount) })
  : initializeApp();

const db = getFirestore(app);

async function seed() {
  const counts = getTopicCount();
  console.log(
    `Seeding ${DOMAINS.length} domains, ${counts.total} leaf topics ` +
      `(Section A: ${counts.sectionA}, Section B: ${counts.sectionB})`
  );

  const batch = db.batch();
  let ops = 0;

  // Ensure profile/main exists
  const profileRef = db.doc("profile/main");
  batch.set(profileRef, { created: new Date().toISOString() }, { merge: true });
  ops++;

  for (const domain of DOMAINS) {
    // Create domain document under profile/main
    const domainRef = db.doc(`profile/main/domains/${domain.id}`);
    batch.set(
      domainRef,
      {
        domain_name: domain.domain_name,
        archetype_tags: domain.archetype_tags,
        section: domain.section,
      },
      { merge: true }
    );
    ops++;

    for (const topic of domain.leaf_topics) {
      // Create leaf topic under profile (unassessed by default)
      const leafRef = db.doc(
        `profile/main/domains/${domain.id}/leaf_topics/${topic.id}`
      );
      batch.set(
        leafRef,
        {
          topic_name: topic.topic_name,
          depth_level: "Unaware",
          last_assessed: null,
          judge_notes: "",
          assessed: false,
          assessment_history: [],
        },
        { merge: true }
      );
      ops++;

      // Create topic_catalog entry (resources empty until curated)
      const catalogRef = db.doc(`topic_catalog/${topic.id}`);
      batch.set(
        catalogRef,
        {
          topic_name: topic.topic_name,
          domain_id: domain.id,
          resources: [],
        },
        { merge: true }
      );
      ops++;

      // Firestore batch limit is 500 operations
      if (ops >= 490) {
        console.log(`  Committing batch (${ops} ops)...`);
        await batch.commit();
        ops = 0;
      }
    }
  }

  if (ops > 0) {
    console.log(`  Committing final batch (${ops} ops)...`);
    await batch.commit();
  }

  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
