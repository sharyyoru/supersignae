import { unsealData, sealData } from "iron-session";

export interface SessionUser {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  fullName?: string | null;
}

export interface SessionData {
  user?: SessionUser;
}

export const sessionOptions = {
  cookieName: "supersignae_session",
  password: process.env.IRON_SESSION_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function unsealSession(cookieValue?: string): Promise<SessionData> {
  if (!cookieValue) return {};
  try {
    return await unsealData<SessionData>(cookieValue, {
      password: sessionOptions.password,
    });
  } catch {
    return {};
  }
}

export async function sealSession(session: SessionData): Promise<string> {
  return sealData(session, {
    password: sessionOptions.password,
    ttl: sessionOptions.cookieOptions.maxAge,
  });
}
