export function GET() {
  return Response.json({
    gemini: Boolean(process.env.GEMINI_API_KEY),
    elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
  });
}
