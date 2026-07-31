import { type VehicleStatus, type ServiceType } from "@/types";

/**
 * Formats a date string (ISO) to Argentine locale: "15/03/2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formats currency in Argentine pesos.
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Returns the Spanish label for a vehicle status.
 */
export function getStatusLabel(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    waiting: "En Espera",
    in_repair: "En Reparación",
    waiting_parts: "Esperando Repuestos",
    ready_for_pickup: "Listo para Retirar",
  };
  return labels[status];
}

/**
 * Returns the Spanish label for a service type.
 */
export function getServiceTypeLabel(type: ServiceType): string {
  const labels: Record<ServiceType, string> = {
    repair: "Arreglo",
    service: "Service",
    upgrade: "Upgrade",
  };
  return labels[type];
}

/**
 * Returns Tailwind color classes for each status.
 */
export function getStatusColorClasses(
  status: VehicleStatus,
): {
  border: string;
  badge: string;
  bg: string;
} {
  const colors: Record<
    VehicleStatus,
    { border: string; badge: string; bg: string }
  > = {
    waiting: {
      border: "border-l-slate-500",
      badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      bg: "bg-slate-500/5",
    },
    in_repair: {
      border: "border-l-amber-500",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      bg: "bg-amber-500/5",
    },
    waiting_parts: {
      border: "border-l-rose-500",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      bg: "bg-rose-500/5",
    },
    ready_for_pickup: {
      border: "border-l-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      bg: "bg-emerald-500/5",
    },
  };
  return colors[status];
}

/**
 * Normalizes license plate: uppercase, no spaces or hyphens.
 */
export function normalizeLicensePlate(plate: string): string {
  return plate.replace(/[\s-]/g, "").toUpperCase();
}