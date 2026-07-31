import { z } from "zod";
import { VEHICLE_STATUSES } from "@/types";
import { normalizeLicensePlate } from "@/lib/utils/format";

export const vehicleSchema = z.object({
  ownerName: z
    .string()
    .min(2, "El nombre del dueño debe tener al menos 2 caracteres")
    .max(200, "El nombre es demasiado largo"),
  ownerPhone: z
    .string()
    .min(6, "Ingresá un número de teléfono válido")
    .max(20, "Número de teléfono demasiado largo")
    .optional()
    .or(z.literal("")),
  licensePlate: z
    .string()
    .min(5, "Patente inválida (mín. 5 caracteres)")
    .max(10, "Patente demasiado larga")
    .transform(normalizeLicensePlate),
  brand: z
    .string()
    .min(1, "La marca es obligatoria")
    .max(100, "Marca demasiado larga"),
  model: z
    .string()
    .min(1, "El modelo es obligatorio")
    .max(100, "Modelo demasiado largo"),
  year: z
    .number()
    .int("El año debe ser un número entero")
    .min(1960, "Año demasiado antiguo")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  currentMileage: z
    .number()
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje no puede ser negativo")
    .max(9999999, "Kilometraje demasiado alto"),
  status: z.enum(VEHICLE_STATUSES).default("waiting"),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;

/**
 * Edge case validation: mileage cannot be lower than the last service mileage.
 * This must be run in the server action after fetching the last service record.
 */
export function validateMileageAgainstLastService(
  newMileage: number,
  lastServiceMileage: number | null,
): string | null {
  if (lastServiceMileage !== null && newMileage < lastServiceMileage) {
    return `El kilometraje actual (${newMileage} km) no puede ser menor al último service registrado (${lastServiceMileage} km). Revisá el dato ingresado.`;
  }
  return null;
}