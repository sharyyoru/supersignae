import { requireAuth } from "@/lib/auth";

export default async function TeamPage() {
  await requireAuth();
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Team</h1>
      <p className="text-muted-foreground">
        Team member management is coming soon. For now the admin account manages all signatures.
      </p>
    </div>
  );
}
