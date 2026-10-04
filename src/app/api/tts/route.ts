export const runtime = "nodejs";

export async function POST(req: Request) {
  let text: string;
  try {
    const body = (await req.json()) as { text?: string };
    text = (body.text ?? "").trim();
    if (!text) throw new Error("empty");
  } catch {
    return Response.json({ error: "Expected { text }" }, { status: 400 });
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return Response.json({ fallback: true });

  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const model = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({ text, model_id: model }),
    });
    if (!res.ok) throw new Error(`elevenlabs ${res.status}`);
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
    });
  } catch {
    return Response.json({ fallback: true });
  }
}
