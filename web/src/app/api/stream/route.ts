import { NextResponse } from "next/server";
import { invalidateChainState } from "@/lib/chain/state";
import { ingestStreamPayload, streamConfigured, streamSnapshot, verifyStreamSignature } from "@/lib/chain/stream";

export const dynamic = "force-dynamic";

/** QuickNode Streams webhook destination. Rejects anything not signed with the Stream's security token. */
export async function POST(req: Request) {
  if (!streamConfigured()) return NextResponse.json({ error: "QUICKNODE_STREAM_TOKEN is not set" }, { status: 503 });
  const body = await req.text();
  const h = req.headers;
  // The dashboard's "Check connection" sends an unsigned {"message":"PING"}. Acknowledge it; nothing is ingested.
  if (!h.get("x-qn-signature") && /^\{\s*"message"\s*:\s*"PING"\s*\}$/.test(body.trim())) return NextResponse.json({ ok: true, pong: true });
  if (!verifyStreamSignature(body, h.get("x-qn-nonce"), h.get("x-qn-timestamp"), h.get("x-qn-signature"))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  let payload: unknown = null;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const added = await ingestStreamPayload(payload);
  if (added > 0) invalidateChainState();
  return NextResponse.json({ ok: true, added });
}

export async function GET() {
  return NextResponse.json((await streamSnapshot()).status);
}
