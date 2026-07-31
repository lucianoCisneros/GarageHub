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
import { deleteServiceRecord } from "@/lib/actions/service-actions";

// ─── Props ──────────────────────────────────────────────────────────────────

interface DeleteServiceDialogProps {
  serviceId: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DeleteServiceDialog({
  serviceId,
}: DeleteServiceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteServiceRecord(serviceId);
    if (result.success) {
      toast.success("Servicio eliminado correctamente");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Error al eliminar el servicio");
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
          />
        }
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Eliminar servicio</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés eliminar este registro de servicio?
            Esta acción no se puede deshacer.
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