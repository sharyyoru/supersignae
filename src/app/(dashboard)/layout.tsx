import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, Palette, Users, Settings, LogOut, Mail } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/signatures/new", label: "Create Signature", icon: Palette },
    { href: "/generators", label: "Generators", icon: Mail },
    { href: "/team", label: "Team", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full border-b bg-card md:w-64 md:border-b-0 md:border-r md:fixed md:h-screen md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6 font-bold text-xl">SuperSignAE</div>
        <nav className="flex-1 space-y-1 p-4 overflow-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate">{session.user.email}</span>
            <ThemeToggle />
          </div>
          <form action="/api/logout" method="post" className="w-full">
            <Button type="submit" variant="outline" className="w-full gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 md:ml-64 p-6 lg:p-8 bg-muted/20 min-h-screen">{children}</main>
    </div>
  );
}
