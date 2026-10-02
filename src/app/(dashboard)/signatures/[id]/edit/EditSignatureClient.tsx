"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignatureEditor } from "@/components/editor/SignatureEditor";
import { updateSignature } from "../../actions";
import type { SignatureData } from "@/types/signature";
import type { Signature } from "@prisma/client";
import { toast } from "sonner";

export function EditSignatureClient({ signature }: { signature: Signature }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const initialData: SignatureData = JSON.parse(signature.data);

  async function handleSave(payload: { name: string; data: SignatureData; layoutId: string }) {
    setSaving(true);
    try {
      await updateSignature(signature.id, { name: payload.name, data: payload.data, layoutId: payload.layoutId });
      toast.success("Signature updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update signature");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SignatureEditor
      initialName={signature.name}
      initialData={initialData}
      initialLayoutId={signature.layoutId || undefined}
      onSave={handleSave}
      saving={saving}
    />
  );
}
