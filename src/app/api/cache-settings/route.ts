import { NextRequest, NextResponse } from "next/server";
import { setCacheSettings } from "@/app/actions";
import { cacheSettingsSchema } from "@/lib/schemas/kids";
import { parseBody } from "@/lib/http/parseBody";

export async function GET() {
  const { getCacheSettings } = await import("@/app/actions");
  const settings = await getCacheSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, cacheSettingsSchema);
  if (!parsed.ok) return parsed.response;

  const { forceUpdate } = parsed.data;
  const result = await setCacheSettings(forceUpdate);
  return NextResponse.json(result);
}
