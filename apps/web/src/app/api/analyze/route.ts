import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(130_000),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ ok: false, error: text }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e: any) {
    // Fallback: return lightweight mock so UI is always functional
    const ticker = (await req.json().catch(() => ({}))).ticker ?? "—";
    return NextResponse.json({
      ok: true,
      ticker,
      snapshot: { name: null, price: null, change_pct: null },
      news: [],
      decision: null,
      error: "Analiza privremeno nedostupna.",
      timestamp: new Date().toISOString(),
    });
  }
}
