"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignatureEditor } from "@/components/editor/SignatureEditor";
import { createSignature } from "../actions";
import type { SignatureData } from "@/types/signature";
import { toast } from "sonner";

export default function NewSignaturePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSave(payload: { name: string; data: SignatureData; layoutId: string }) {
    setSaving(true);
    try {
      await createSignature(payload);
      toast.success("Signature created");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create signature");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create signature</h1>
        <p className="text-muted-foreground">Design a signature and share it with your team.</p>
      </div>
      <SignatureEditor onSave={handleSave} saving={saving} />
    </div>
  );
}
