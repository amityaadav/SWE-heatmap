import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { judgeAnswer } from "@/lib/ollama";
import type { DepthLevel } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await request.json();
  const { domainId, leafTopicId, topicName, question, answer } = body;

  if (!domainId || !leafTopicId || !topicName || !question || !answer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await judgeAnswer(topicName, question, answer);

  const leafRef = adminDb.doc(
    `profile/main/domains/${domainId}/leaf_topics/${leafTopicId}`
  );
  const existing = await leafRef.get();
  const existingData = existing.data();

  const historyEntry = existingData?.assessed
    ? {
        depth_level: existingData.depth_level,
        timestamp: existingData.last_assessed,
        judge_notes: existingData.judge_notes,
      }
    : null;

  const updateData: Record<string, unknown> = {
    topic_name: topicName,
    depth_level: result.depth_level as DepthLevel,
    last_assessed: new Date().toISOString(),
    judge_notes: result.judge_notes,
    assessed: true,
  };

  if (historyEntry) {
    updateData.assessment_history = FieldValue.arrayUnion(historyEntry);
  }

  await leafRef.set(updateData, { merge: true });

  return NextResponse.json({
    depth_level: result.depth_level,
    judge_notes: result.judge_notes,
  });
}
