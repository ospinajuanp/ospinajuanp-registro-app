import { NextRequest, NextResponse } from "next/server";
import { getCacheSettings, setCacheSettings } from "@/app/actions";

export async function GET() {
  const settings = await getCacheSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const forceUpdate = (body as Record<string, unknown>)?.forceUpdate === true;
    const result = await setCacheSettings(forceUpdate);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
