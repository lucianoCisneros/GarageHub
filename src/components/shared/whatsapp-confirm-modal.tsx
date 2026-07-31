"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  generateWhatsAppLink,
  STATUS_LABELS,
} from "@/lib/utils/whatsapp";
import { ExternalLink, MessageCircle, X } from "lucide-react";

interface WhatsappConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  licensePlate: string;
}

export function WhatsappConfirmModal({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  vehicleModel,
  licensePlate,
}: WhatsappConfirmModalProps) {
  const whatsappLink = generateWhatsAppLink(customerPhone, {
    customerName,
    vehicleModel,
    licensePlate,
    statusLabel: STATUS_LABELS.ready_for_pickup,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 text-lg flex items-center gap-2">
            <MessageCircle className="size-5 text-emerald-400" />
            Notificar al Cliente
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            El vehículo cambió a <strong className="text-emerald-400">Listo para Retirar</strong>.
            ¿Querés avisarle por WhatsApp?
          </DialogDescription>
        </DialogHeader>

        {/* Preview message */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Hola <strong className="text-zinc-100">{customerName}</strong>, te
            escribimos de GarageHub. Tu{" "}
            <strong className="text-zinc-100">{vehicleModel}</strong> con
            patente{" "}
            <strong className="text-amber-400">{licensePlate}</strong> ya
            cambió de estado a:{" "}
            <strong className="text-emerald-400">Listo para Retirar</strong>.
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-900 active:scale-[0.98] transition-transform"
          >
            <X className="size-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={() => {
              window.open(whatsappLink, "_blank");
              onOpenChange(false);
            }}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold active:scale-[0.98] transition-transform"
          >
            <ExternalLink className="size-4 mr-2" />
            Abrir WhatsApp
          </Button>
        </div>

        <p className="text-xs text-zinc-600 text-center">
          Se abrirá una nueva pestaña con el mensaje pre-cargado
        </p>
      </DialogContent>
    </Dialog>
  );
}