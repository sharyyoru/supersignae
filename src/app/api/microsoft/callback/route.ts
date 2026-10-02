import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { acquireTokenByCode } from "@/lib/microsoft";
import { setOwaSignature, getMe } from "@/lib/graph-signature";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/install/${state}?error=${encodeURIComponent(errorDescription || "Microsoft sign-in failed")}`
    );
  }

  const installLink = await prisma.installLink.findUnique({
    where: { token: state },
    include: { signature: true },
  });
  if (!installLink) {
    return NextResponse.redirect(`${baseUrl}/install/expired`);
  }

  try {
    const tokenResponse = await acquireTokenByCode(code);
    const accessToken = tokenResponse.accessToken;
    if (!accessToken) throw new Error("No access token received");

    const me = await getMe(accessToken);
    const graphUserId = me?.id || me?.userPrincipalName;

    await setOwaSignature(accessToken, installLink.signature.html);

    await prisma.installLink.update({
      where: { token: state },
      data: {
        installStatus: "INSTALLED",
        installedAt: new Date(),
        graphUserId: graphUserId || null,
      },
    });

    return NextResponse.redirect(`${baseUrl}/install/${state}?success=1`);
  } catch (err) {
    console.error("Microsoft install callback error:", err);
    await prisma.installLink.update({
      where: { token: state },
      data: { installStatus: "FAILED" },
    });
    const message = err instanceof Error ? err.message : "Install failed";
    return NextResponse.redirect(`${baseUrl}/install/${state}?error=${encodeURIComponent(message)}`);
  }
}
