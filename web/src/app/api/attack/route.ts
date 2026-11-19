import { NextResponse } from "next/server";
import { z } from "zod";
import { attackDuplicate, attackUnauthorizedOracle } from "@/lib/settlement";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.discriminatedUnion("type", [
  z.object({ type: z.literal("unauthorized-oracle"), broadcast: z.boolean().default(false) }),
  z.object({
    type: z.literal("duplicate-payout"),
    businessId: z.string().regex(/^RSL-\d{4}$/),
    observationId: z.string().regex(/^[A-Z0-9]{3,4}-\d{9,11}$/),
    broadcast: z.boolean().default(false),
  }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  // Broadcasting a reverted transaction spends a little testnet gas; it is opt-in per deployment.
  const broadcast = parsed.data.broadcast && process.env.ALLOW_BROADCAST_ATTACKS === "true";
  try {
    const r =
      parsed.data.type === "unauthorized-oracle"
        ? await attackUnauthorizedOracle(broadcast)
        : await attackDuplicate(parsed.data.businessId, parsed.data.observationId, broadcast);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
