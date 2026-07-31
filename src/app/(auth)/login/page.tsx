"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-sm">G</span>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-zinc-100">
            GarageHub
          </span>
        </div>
        <CardTitle className="text-xl text-zinc-100">Iniciar Sesión</CardTitle>
        <CardDescription className="text-zinc-400">
          Ingresá tus credenciales para acceder al taller
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="mecanico@taller.com"
              required
              autoComplete="email"
              className="h-12 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-12 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 text-base font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-[0.98] transition-transform"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            Registrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}