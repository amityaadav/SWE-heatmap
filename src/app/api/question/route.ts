import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  if (allowedEmails.length > 0 && !allowedEmails.includes(decoded.email || "")) {
    return NextResponse.json({ error: "Access restricted" }, { status: 403 });
  }

  const body = await request.json();
  const { topicName } = body;

  if (!topicName) {
    return NextResponse.json({ error: "Missing topicName" }, { status: 400 });
  }

  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  const apiUrl = process.env.OLLAMA_CLOUD_API_URL;

  if (!apiKey || !apiUrl) {
    return NextResponse.json(
      { error: "Ollama Cloud API not configured" },
      { status: 500 }
    );
  }

  const prompt = `You are an experienced software engineering hiring manager. Generate a short, adaptive probe question to assess someone's depth of knowledge on: "${topicName}".

The question should:
- Be open-ended enough to reveal depth (not yes/no)
- Allow the person to demonstrate reasoning, not just recall
- Be answerable in 2-5 sentences by someone who knows the topic well

Respond in JSON format only:
{
  "question": "<the probe question>"
}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "deepseek-v4-pro:cloud",
      messages: [{ role: "user", content: prompt }],
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Ollama API error: ${response.status}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  const content = data.message?.content || data.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  return NextResponse.json({ question: parsed.question });
}
