import { NextResponse } from "next/server";
import { readChainState } from "@/lib/chain/state";
import { DEPLOYMENT } from "@/lib/chain/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readChainState();
  return NextResponse.json({ deployment: DEPLOYMENT, state });
}
