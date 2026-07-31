"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteVehicle } from "@/lib/actions/vehicle-actions";

// ─── Props ──────────────────────────────────────────────────────────────────

interface DeleteVehicleDialogProps {
  vehicleId: string;
  vehicleLabel: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DeleteVehicleDialog({
  vehicleId,
  vehicleLabel,
}: DeleteVehicleDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteVehicle(vehicleId);
    if (result.success) {
      toast.success("Vehículo eliminado correctamente");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Error al eliminar el vehículo");
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        }
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Eliminar vehículo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés eliminar{" "}
            <strong className="text-foreground">{vehicleLabel}</strong>?
            También se borrarán todos sus registros de servicio. Esta acción no
            se puede deshacer.
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}