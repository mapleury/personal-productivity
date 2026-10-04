import { answerLocally, type AssistantContext } from "@/lib/briefing";

export const runtime = "nodejs";

const SYSTEM = `You are the embedded assistant inside "wanei.", a personal productivity operating system belonging to one person.
You receive a JSON context snapshot (current time, today's schedule, open tasks, completed tasks, top priorities, weekly goals, focus sessions, stats).
Answer the user's question using ONLY that context. Never invent events, tasks or numbers.
If the context lacks the needed data (e.g. an empty schedule), say so explicitly instead of guessing.
Style: concise, calm, second person, at most 4 sentences or a short bullet list. No markdown headers.`;

export async function POST(req: Request) {
  let message: string;
  let context: AssistantContext;
  try {
    const body = (await req.json()) as { message?: string; context?: AssistantContext };
    message = body.message ?? "";
    context = body.context as AssistantContext;
    if (!message || !context) throw new Error("bad payload");
  } catch {
    return Response.json({ error: "Expected { message, context }" }, { status: 400 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ source: "local", reply: answerLocally(message, context) });

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Context JSON:\n${JSON.stringify(context)}\n\nQuestion: ${message}` }],
            },
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        }),
      },
    );
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) throw new Error("empty completion");
    return Response.json({ source: "gemini", reply });
  } catch {
    return Response.json({ source: "local", reply: answerLocally(message, context) });
  }
}
