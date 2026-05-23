import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET() {
  const start = Date.now();
  
  try {
    const upstream = await fetch(`${API_URL}/api/status`, { signal: AbortSignal.timeout(5_000) });
    const latency_ms = Date.now() - start;
    
    if (!upstream.ok) {
      return NextResponse.json({
        ok: false,
        latency_ms,
        services: { api: "degraded", hermes: "unknown" },
        timestamp: new Date().toISOString(),
      });
    }
    
    const data = await upstream.json();
    return NextResponse.json({
      ...data,
      ok: true,
      latency_ms,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      ok: false,
      latency_ms: Date.now() - start,
      services: { api: "degraded", hermes: "unknown" },
      error: "Backend unreachable",
      timestamp: new Date().toISOString(),
    });
  }
}
