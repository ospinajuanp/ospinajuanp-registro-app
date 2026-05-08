import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: "auth-token",
    value: "",
    expires: new Date(0), // Expira inmediatamente
    path: "/",
  });

  return response;
}
