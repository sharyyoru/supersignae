import { requireAuth } from "@/lib/auth";

export default async function GeneratorsPage() {
  await requireAuth();
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Generators</h1>
      <p className="text-muted-foreground">
        Team template generators are coming soon. They will let you lock brand fields and share a public install URL with your team.
      </p>
    </div>
  );
}
