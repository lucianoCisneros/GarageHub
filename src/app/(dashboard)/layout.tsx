import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth-actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
        <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto w-full">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-zinc-950 font-bold text-sm">G</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-zinc-100 hidden sm:inline">
              GarageHub
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-200 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Tablero
            </Link>
            <Link
              href="/vehicles"
              className="text-sm text-zinc-400 hover:text-zinc-200 px-2 sm:px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Vehículos
            </Link>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 whitespace-nowrap"
              >
                Salir
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}