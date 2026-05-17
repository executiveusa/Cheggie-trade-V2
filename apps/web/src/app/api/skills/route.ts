import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const upstream = await fetch(`${API_URL}/api/skills`, { signal: AbortSignal.timeout(10_000) });
    if (!upstream.ok) throw new Error();
    return NextResponse.json(await upstream.json());
  } catch {
    return NextResponse.json({ ok: false, skills: [] }, { status: 200 });
  }
}
