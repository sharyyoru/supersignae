"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Signature } from "@prisma/client";
import { Copy, Check, Monitor } from "lucide-react";

interface Props {
  token: string;
  recipientEmail: string;
  signature: Signature;
  microsoftConfigured: boolean;
}

export function InstallClientPage({ token, recipientEmail, signature, microsoftConfigured }: Props) {
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  async function copyHtml() {
    await navigator.clipboard.writeText(signature.html);
    setCopied(true);
    toast.success("HTML copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  async function installToOutlook() {
    if (!microsoftConfigured) {
      toast.error("Microsoft integration is not configured. Use the manual copy-paste method.");
      return;
    }
    setInstalling(true);
    try {
      const response = await fetch(`/api/microsoft/auth?token=${encodeURIComponent(token)}`, { method: "POST" });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error(data.error || "Could not start Microsoft sign-in.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start install.");
    } finally {
      setInstalling(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Install your email signature</CardTitle>
          <CardDescription>
            Preview and install the signature prepared for <strong>{recipientEmail}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="source">HTML source</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="rounded-md border bg-white p-6 dark:bg-zinc-950">
                <div dangerouslySetInnerHTML={{ __html: signature.html }} />
              </div>
            </TabsContent>
            <TabsContent value="source">
              <pre className="max-h-96 overflow-auto rounded-md border bg-muted p-4 text-xs">{signature.html}</pre>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button onClick={installToOutlook} disabled={installing || !microsoftConfigured} className="w-full gap-2">
              <Monitor className="h-4 w-4" /> {installing ? "Connecting…" : "Install to Outlook"}
            </Button>
            <Button variant="outline" onClick={copyHtml} className="w-full gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy HTML
            </Button>
          </div>

          {!microsoftConfigured && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
              Microsoft automatic install is not configured. Please copy the HTML above and paste it into Outlook
              signature settings.
            </div>
          )}

          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Manual instructions for classic Outlook</p>
            <ol className="list-decimal pl-5 pt-2 space-y-1">
              <li>Open Outlook and go to File → Options → Mail → Signatures.</li>
              <li>Click New, name it, then press Ctrl+V to paste the copied HTML.</li>
              <li>Save and set it as default for new messages and replies.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        Powered by <Link href="/" className="underline">SuperSignAE</Link>
      </p>
    </div>
  );
}
