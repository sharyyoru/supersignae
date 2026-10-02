import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sealSession } from "@/lib/session";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let email = "";
  let password = "";
  let from = "/dashboard";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    email = body.email || "";
    password = body.password || "";
    from = body.from || "/dashboard";
  } else {
    const formData = await req.formData();
    email = (formData.get("email") as string) || "";
    password = (formData.get("password") as string) || "";
    from = (formData.get("from") as string) || "/dashboard";
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!email || !password) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent("Email and password required")}`, 303);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent("Invalid credentials")}`, 303);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent("Invalid credentials")}`, 303);
  }

  const sealed = await sealSession({
    user: {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "MEMBER",
      fullName: user.fullName,
    },
  });

  if (contentType.includes("application/json")) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("supersignae_session", sealed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://"),
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  const redirectUrl = from.startsWith("/") ? from : "/dashboard";
  const response = NextResponse.redirect(`${baseUrl}${redirectUrl}`, 303);
  response.cookies.set("supersignae_session", sealed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://"),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
