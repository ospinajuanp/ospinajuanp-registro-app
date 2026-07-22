import { NextRequest, NextResponse } from "next/server";
import { getCacheSettings, setCacheSettings } from "@/app/actions";

export async function GET() {
  const settings = await getCacheSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const { forceUpdate } = await request.json();
    const result = await setCacheSettings(forceUpdate);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}