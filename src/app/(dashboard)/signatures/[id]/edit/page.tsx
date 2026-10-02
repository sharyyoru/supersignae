import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { EditSignatureClient } from "./EditSignatureClient";

export default async function EditSignaturePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const signature = await prisma.signature.findFirst({
    where: { id, userId: user.id },
  });

  if (!signature) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit signature</h1>
        <p className="text-muted-foreground">Update fields, design, or add-ons.</p>
      </div>
      <EditSignatureClient signature={signature} />
    </div>
  );
}
