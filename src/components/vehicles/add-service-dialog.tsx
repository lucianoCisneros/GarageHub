"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createServiceRecord } from "@/lib/actions/service-actions";
import { SERVICE_TYPES } from "@/types";
import type { ActionResult } from "@/types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface AddServiceDialogProps {
  vehicleId: string;
  currentMileage: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABELS: Record<string, string> = {
  repair: "Arreglo",
  service: "Service",
  upgrade: "Upgrade",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function AddServiceDialog({
  vehicleId,
  currentMileage,
}: AddServiceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      formData.set("vehicleId", vehicleId);
      const result = await createServiceRecord(prevState, formData);
      if (result.success) {
        toast.success("Servicio registrado correctamente");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Error al registrar el servicio");
      }
      return result;
    },
    { success: false },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-10 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm active:scale-95 transition-transform" />
        }
      >
        <Plus className="size-4 mr-1.5" />
        Nuevo cambio
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Nuevo registro de servicio</DialogTitle>
          <DialogDescription>
            Completá los datos del servicio realizado
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Service Date */}
          <div className="space-y-1.5">
            <Label htmlFor="serviceDate">Fecha del servicio</Label>
            <Input
              id="serviceDate"
              name="serviceDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Mileage */}
          <div className="space-y-1.5">
            <Label htmlFor="mileageAtService">Kilometraje actual</Label>
            <Input
              id="mileageAtService"
              name="mileageAtService"
              type="number"
              min={0}
              defaultValue={currentMileage}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo de servicio</Label>
            <select
              id="type"
              name="type"
              defaultValue="service"
              className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 [&_option]:dark:bg-zinc-900"
              required
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SERVICE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Cost */}
          <div className="space-y-1.5">
            <Label htmlFor="cost">Costo ($)</Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              min={0}
              step="0.01"
              placeholder="Opcional"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalles del servicio realizado..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold"
            >
              {isPending ? "Guardando..." : "Guardar servicio"}
            </Button>
          </div>

          {/* Hidden error display from server */}
          {state.error && !isPending && (
            <p className="text-xs text-rose-400 text-center">{state.error}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}