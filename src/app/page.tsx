import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Palette, Users, Zap, Download, Copy } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-bold">SuperSignAE</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link href="/login" className={buttonVariants()}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Professional email signatures <br className="hidden sm:block" /> for your whole team.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Design polished, on-brand HTML signatures in minutes. Centrally manage templates, deploy to Outlook, and keep every signature consistent.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Create a signature
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Palette, title: "Visual editor", desc: "Tabs for details, social links, design, and add-ons with live preview." },
              { icon: Users, title: "Team generators", desc: "Lock brand elements and let team members fill only their personal fields." },
              { icon: Zap, title: "One-click Outlook install", desc: "Send an install email; recipients sign in once and their signature is set." },
              { icon: Download, title: "HTML export", desc: "Download the source HTML or copy it for manual install in classic Outlook." },
              { icon: Copy, title: "Duplicate & reuse", desc: "Clone signatures and templates to iterate quickly." },
              { icon: Mail, title: "Email client tested", desc: "Table-based, responsive HTML tested across Outlook, Gmail, and Apple Mail." },
            ].map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6">
                  <f.icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
