"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Signature, InstallLink } from "@prisma/client";
import { duplicateSignature, deleteSignature, sendInstallEmail } from "@/app/(dashboard)/signatures/actions";
import { toast } from "sonner";
import { Copy, Download, Edit, Mail, Trash } from "lucide-react";

interface Props {
  signature: Signature & { installLinks: InstallLink[] };
}

export function SignatureActions({ signature }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onDuplicate() {
    setBusy(true);
    try {
      await duplicateSignature(signature.id);
      toast.success("Signature duplicated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this signature?")) return;
    setBusy(true);
    try {
      await deleteSignature(signature.id);
      toast.success("Signature deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const result = await sendInstallEmail(signature.id, email);
      if (result.sent) {
        toast.success(`Install email sent to ${email}`);
      } else {
        toast.success("Install link generated", {
          description: "Email provider not configured; copy the link from the dialog.",
        });
        await navigator.clipboard.writeText(result.link);
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send install email");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 w-full">
      <Link href={`/signatures/${signature.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Edit className="mr-1 h-4 w-4" /> Edit
      </Link>
      <Button variant="outline" size="sm" onClick={onDuplicate} disabled={busy}>
        <Copy className="mr-1 h-4 w-4" /> Duplicate
      </Button>
      <a
        href={`/api/signatures/${signature.id}/html`}
        download={`${signature.name}.html`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Download className="mr-1 h-4 w-4" /> HTML
      </a>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button variant="default" size="sm"><Mail className="mr-1 h-4 w-4" /> Install</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send install signature email</DialogTitle>
            <DialogDescription>The recipient will receive a secure link to install this signature in Outlook.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSend} className="space-y-4">
            <div>
              <Label htmlFor={`email-${signature.id}`}>Recipient email</Label>
              <Input id={`email-${signature.id}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send email"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={onDelete} disabled={busy}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
