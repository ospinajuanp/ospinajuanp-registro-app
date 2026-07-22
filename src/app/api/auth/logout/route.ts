import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
