import { requireAuth } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAuth();
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">
        Account and integration settings will appear here. Add Supabase, Resend, and Microsoft credentials in your environment variables to enable cloud features.
      </p>
    </div>
  );
}
