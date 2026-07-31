"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { updateServiceRecord } from "@/lib/actions/service-actions";
import { SERVICE_TYPES } from "@/types";
import type { ActionResult, ServiceRecordWithImages } from "@/types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface EditServiceDialogProps {
  service: ServiceRecordWithImages;
  vehicleId: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABELS: Record<string, string> = {
  repair: "Arreglo",
  service: "Service",
  upgrade: "Upgrade",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EditServiceDialog({
  service,
  vehicleId,
}: EditServiceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      formData.set("recordId", service.id);
      formData.set("vehicleId", vehicleId);
      const result = await updateServiceRecord(prevState, formData);
      if (result.success) {
        toast.success("Servicio actualizado correctamente");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Error al actualizar el servicio");
      }
      return result;
    },
    { success: false },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-90 transition-all"
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Editar servicio</DialogTitle>
          <DialogDescription>
            Actualizá los datos del servicio
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Service Date */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-serviceDate">Fecha del servicio</Label>
            <Input
              id="edit-serviceDate"
              name="serviceDate"
              type="date"
              defaultValue={service.serviceDate}
              required
            />
          </div>

          {/* Mileage */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-mileageAtService">Kilometraje</Label>
            <Input
              id="edit-mileageAtService"
              name="mileageAtService"
              type="number"
              min={0}
              defaultValue={service.mileageAtService}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-type">Tipo de servicio</Label>
            <select
              id="edit-type"
              name="type"
              defaultValue={service.type}
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
            <Label htmlFor="edit-cost">Costo ($)</Label>
            <Input
              id="edit-cost"
              name="cost"
              type="number"
              min={0}
              step="0.01"
              placeholder="Opcional"
              defaultValue={service.cost ?? ""}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              name="description"
              placeholder="Detalles del servicio realizado..."
              rows={3}
              defaultValue={service.description ?? ""}
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
              {isPending ? "Guardando..." : "Guardar cambios"}
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