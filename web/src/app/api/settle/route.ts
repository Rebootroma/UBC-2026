import { NextResponse } from "next/server";
import { z } from "zod";
import { settleObservation } from "@/lib/settlement";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({ observationId: z.string().regex(/^[A-Z0-9]{3,4}-\d{9,11}$/) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "observationId required" }, { status: 400 });
  const result = await settleObservation(parsed.data.observationId);
  return NextResponse.json(result, { status: result.status === "rejected" ? 422 : 200 });
}
