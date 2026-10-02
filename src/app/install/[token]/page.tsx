import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InstallClientPage } from "./InstallClientPage";

export default async function InstallPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const installLink = await prisma.installLink.findUnique({
    where: { token },
    include: { signature: true },
  });

  if (!installLink || installLink.expiresAt < new Date()) {
    notFound();
  }

  await prisma.installLink.update({
    where: { token },
    data: { openedAt: new Date(), installStatus: "OPENED" },
  });

  return (
    <InstallClientPage
      token={installLink.token}
      recipientEmail={installLink.recipientEmail}
      signature={installLink.signature}
      microsoftConfigured={!!process.env.MICROSOFT_CLIENT_ID}
    />
  );
}
