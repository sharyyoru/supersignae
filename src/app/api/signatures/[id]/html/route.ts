import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const signature = await prisma.signature.findFirst({
    where: { id, userId: user.id },
  });

  if (!signature) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(signature.html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(signature.name)}.html"`,
    },
  });
}
