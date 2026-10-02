import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignatureActions } from "@/components/dashboard/SignatureActions";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const signatures = await prisma.signature.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { installLinks: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage and deploy your email signatures.</p>
        </div>
        <Link href="/signatures/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> New signature
        </Link>
      </div>

      {signatures.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No signatures yet</CardTitle>
            <CardDescription>Create your first signature to share with the team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signatures/new" className={buttonVariants()}>
              Create signature
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {signatures.map((sig) => (
            <Card key={sig.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{sig.name}</CardTitle>
                <CardDescription>{new Date(sig.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div
                  className="rounded-md border bg-white p-4 dark:bg-zinc-950 overflow-hidden max-h-64"
                  dangerouslySetInnerHTML={{ __html: sig.html }}
                />
                {sig.installLinks.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {sig.installLinks.filter((l) => l.installStatus === "INSTALLED").length} installed /{" "}
                    {sig.installLinks.length} links
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <SignatureActions signature={sig} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
