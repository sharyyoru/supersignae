import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            SuperSignAE
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">SuperSignAE</CardTitle>
            <CardDescription>Sign in to manage your team signatures.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/login" method="POST" className="space-y-4">
              {from && <input type="hidden" name="from" value={from} />}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue="wilson@drehomes.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && <p className="text-sm text-destructive">{decodeURIComponent(error)}</p>}
              <button
                type="submit"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Sign in
              </button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
