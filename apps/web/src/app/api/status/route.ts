import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const upstream = await fetch(`${API_URL}/api/status`, { signal: AbortSignal.timeout(5_000) });
    if (!upstream.ok) throw new Error();
    return NextResponse.json(await upstream.json());
  } catch {
    return NextResponse.json({
      ok: false,
      services: { api: "degraded", hermes: "unknown" },
      timestamp: new Date().toISOString(),
    });
  }
}
