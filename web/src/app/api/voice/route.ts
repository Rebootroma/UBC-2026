import { getCache } from "@vercel/functions";
import { NextResponse } from "next/server";
import { briefingScript, type VoiceVariant } from "@/lib/voice";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";

/**
 * GET /api/voice?obs=<observationId>&v=paid|deferred -> MP3 briefing for one settlement gate.
 * Only known settlement gates are accepted, so at most two clips per gate are ever generated;
 * each is cached (runtime cache + CDN) and replays cost no ElevenLabs credits.
 * GET /api/voice (no params) reports whether voice is configured.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const obs = url.searchParams.get("obs");
  const key = process.env.ELEVENLABS_API_KEY;
  if (!obs) return NextResponse.json({ configured: !!key });
  const variant: VoiceVariant = url.searchParams.get("v") === "deferred" ? "deferred" : "paid";
  const script = /^[A-Z0-9]{3,4}-\d{9,11}$/.test(obs) ? briefingScript(obs, variant) : null;
  if (!script) return NextResponse.json({ error: "unknown settlement gate" }, { status: 404 });
  if (url.searchParams.get("text") === "1") return NextResponse.json({ script });
  if (!key) return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set", script }, { status: 503 });

  const cacheKey = `voice:${VOICE_ID}:${MODEL_ID}:${obs}:${variant}`;
  const headers = { "content-type": "audio/mpeg", "cache-control": "public, max-age=86400, s-maxage=2592000, immutable" };
  try {
    const hit = (await getCache().get(cacheKey)) as string | undefined | null;
    if (typeof hit === "string") return new NextResponse(Buffer.from(hit, "base64"), { headers });
  } catch {
    // no runtime cache: generate
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text: script, model_id: MODEL_ID }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    return NextResponse.json({ error: `ElevenLabs returned ${res.status}`, detail }, { status: 502 });
  }
  const audio = Buffer.from(await res.arrayBuffer());
  try {
    await getCache().set(cacheKey, audio.toString("base64"), { ttl: 60 * 60 * 24 * 30, name: "voice-briefing" });
  } catch {
    // served uncached
  }
  return new NextResponse(audio, { headers });
}
