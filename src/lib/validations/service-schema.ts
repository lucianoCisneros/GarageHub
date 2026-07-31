import { z } from "zod";
import { SERVICE_TYPES } from "@/types";

export const serviceRecordSchema = z.object({
  vehicleId: z.string().uuid("Seleccioná un vehículo"),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  mileageAtService: z
    .number()
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje no puede ser negativo")
    .max(9999999, "Kilometraje demasiado alto"),
  type: z.enum(SERVICE_TYPES),
  description: z
    .string()
    .max(2000, "La descripción es demasiado larga")
    .optional()
    .or(z.literal("")),
  cost: z
    .number()
    .min(0, "El costo no puede ser negativo")
    .max(999999999, "Costo demasiado alto")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>;