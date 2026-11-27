import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// A tiny, public "wake up" request. It starts the server function and opens the connection to the
// database, so the next real request (like sign-in) does not pay for a cold start.
// It reads no private data. An uptime monitor can call it every 5 minutes to keep things warm.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      await fetch(`${url}/auth/v1/health`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    } catch {
      // Warm-up only. Ignore failures.
    }
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
