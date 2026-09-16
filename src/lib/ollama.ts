export interface JudgeResult {
  depth_level: string;
  judge_notes: string;
}

export async function judgeAnswer(
  topicName: string,
  question: string,
  answer: string
): Promise<JudgeResult> {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  const apiUrl = process.env.OLLAMA_CLOUD_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error("Ollama Cloud API key or URL not configured");
  }

  const rubricPrompt = `You are an experienced software engineering hiring manager evaluating a candidate's depth of knowledge on the topic: "${topicName}".

The candidate was asked: "${question}"
Their answer: "${answer}"

Rate the candidate's depth on this scale:
- Unaware: No knowledge of the topic
- Recognize: Can identify the concept but not explain it
- Explain: Can explain the concept clearly with reasoning
- Apply: Can apply the concept to solve real problems, understands tradeoffs
- Debug under pressure: Can diagnose subtle issues, reason about edge cases under constraints
- Teach: Can teach others, knows the why behind design decisions, can compare alternatives

Respond in JSON format only:
{
  "depth_level": "<one of: Unaware, Recognize, Explain, Apply, Debug under pressure, Teach>",
  "judge_notes": "<2-3 sentences explaining the rating, referencing specific parts of their answer>"
}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "llama3",
      messages: [{ role: "user", content: rubricPrompt }],
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.message?.content || data.choices?.[0]?.message?.content;
  return JSON.parse(content) as JudgeResult;
}
