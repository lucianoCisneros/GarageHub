"use client";

import { useActionState, useEffect, startTransition, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVehicle } from "@/lib/actions/vehicle-actions";
import { vehicleSchema } from "@/lib/validations/vehicle-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Car } from "lucide-react";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

type VehicleFormValues = z.input<typeof vehicleSchema>;

export function CreateVehicleDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createVehicle,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Vehículo agregado correctamente");
      reset();
      startTransition(() => {
        setOpen(false);
        router.refresh();
      });
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error, router, reset]);

  const onSubmit = useCallback(
    (data: VehicleFormValues) => {
      const formData = new FormData();
      formData.append("ownerName", data.ownerName);
      formData.append("ownerPhone", data.ownerPhone ?? "");
      formData.append("licensePlate", data.licensePlate);
      formData.append("brand", data.brand);
      formData.append("model", data.model);
      formData.append("year", String(data.year));
      formData.append("currentMileage", String(data.currentMileage));
      formData.append("status", "waiting");

      startTransition(() => {
        formAction(formData);
      });
    },
    [formAction],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-11 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold active:scale-95 transition-transform">
            <Plus className="size-4 mr-2" />
            Nuevo Vehículo
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md border-zinc-800 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 text-lg flex items-center gap-2">
            <Car className="size-5 text-amber-400" />
            Nuevo Vehículo
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Ingresá los datos del vehículo y su dueño para registrarlo en el taller.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Owner name */}
          <div className="space-y-2">
            <Label htmlFor="ownerName" className="text-zinc-300 text-sm">
              Nombre del dueño <span className="text-amber-500">*</span>
            </Label>
            <Input
              id="ownerName"
              {...register("ownerName")}
              placeholder="Ej: Juan Pérez"
              className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50"
            />
            {errors.ownerName && (
              <p className="text-xs text-rose-400 mt-1">{errors.ownerName.message}</p>
            )}
          </div>

          {/* Owner phone */}
          <div className="space-y-2">
            <Label htmlFor="ownerPhone" className="text-zinc-300 text-sm">
              Teléfono del dueño
            </Label>
            <Input
              id="ownerPhone"
              {...register("ownerPhone")}
              type="tel"
              placeholder="Ej: 11 2233-4455"
              className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50"
            />
            {errors.ownerPhone && (
              <p className="text-xs text-rose-400 mt-1">{errors.ownerPhone.message}</p>
            )}
          </div>

          {/* License plate */}
          <div className="space-y-2">
            <Label htmlFor="licensePlate" className="text-zinc-300 text-sm">
              Patente <span className="text-amber-500">*</span>
            </Label>
            <Input
              id="licensePlate"
              {...register("licensePlate")}
              placeholder="Ej: ABC123"
              className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 font-mono uppercase"
            />
            {errors.licensePlate && (
              <p className="text-xs text-rose-400 mt-1">{errors.licensePlate.message}</p>
            )}
          </div>

          {/* Brand & Model row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-zinc-300 text-sm">
                Marca <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="brand"
                {...register("brand")}
                placeholder="Ej: Toyota"
                className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50"
              />
              {errors.brand && (
                <p className="text-xs text-rose-400 mt-1">{errors.brand.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-zinc-300 text-sm">
                Modelo <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="model"
                {...register("model")}
                placeholder="Ej: Corolla"
                className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50"
              />
              {errors.model && (
                <p className="text-xs text-rose-400 mt-1">{errors.model.message}</p>
              )}
            </div>
          </div>

          {/* Year & Mileage row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-zinc-300 text-sm">
                Año <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="year"
                {...register("year", { valueAsNumber: true })}
                type="number"
                placeholder="Ej: 2020"
                className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50"
              />
              {errors.year && (
                <p className="text-xs text-rose-400 mt-1">{errors.year.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentMileage" className="text-zinc-300 text-sm">
                Kilometraje <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="currentMileage"
                {...register("currentMileage", { valueAsNumber: true })}
                type="number"
                placeholder="Ej: 50000"
                className="h-11 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50"
              />
              {errors.currentMileage && (
                <p className="text-xs text-rose-400 mt-1">{errors.currentMileage.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={pending}
              className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold disabled:opacity-50 active:scale-95 transition-all"
            >
              {pending ? "Guardando..." : "Guardar Vehículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}