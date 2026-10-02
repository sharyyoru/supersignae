import { NextResponse } from "next/server";
import { getAuthUrl, isConfigured } from "@/lib/microsoft";

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Microsoft OAuth not configured" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const authUrl = await getAuthUrl(token);
  return NextResponse.json({ authUrl });
}
