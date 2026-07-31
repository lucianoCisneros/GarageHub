"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Cuenta creada correctamente. Ya podés iniciar sesión.");
      router.push("/login");
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
        <CardTitle className="text-xl text-zinc-100">
          Crear Cuenta
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Registrá tu taller para empezar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-zinc-300">
              Nombre completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Juan Mecánico"
              required
              className="h-12 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
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
              placeholder="Mín. 6 caracteres"
              required
              autoComplete="new-password"
              className="h-12 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 text-base font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-[0.98] transition-transform"
          >
            {pending ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}