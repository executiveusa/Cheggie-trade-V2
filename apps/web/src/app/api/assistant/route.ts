import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${API_URL}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "Asistent nije dostupan." },
        { status: upstream.status }
      );
    }

    return NextResponse.json(await upstream.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Asistent trenutno nije dostupan." },
      { status: 502 }
    );
  }
}
