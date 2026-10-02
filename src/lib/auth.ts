"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sealSession, unsealSession, type SessionData } from "@/lib/session";

export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("supersignae_session")?.value;
  return unsealSession(cookie);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return { error: "Invalid credentials" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Invalid credentials" };
  }

  const session: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "MEMBER",
      fullName: user.fullName,
    },
  };

  const sealed = await sealSession(session);
  const cookieStore = await cookies();
  cookieStore.set("supersignae_session", sealed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("supersignae_session");
}
