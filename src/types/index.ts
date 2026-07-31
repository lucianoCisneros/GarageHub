import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  mechanics,
  vehicles,
  serviceRecords,
  serviceImages,
} from "@/lib/db/schema";

// ── Row types (Select) ───────────────────────────────────────────────────────

export type Mechanic = InferSelectModel<typeof mechanics>;
export type Vehicle = InferSelectModel<typeof vehicles>;
export type ServiceRecord = InferSelectModel<typeof serviceRecords>;
export type ServiceImage = InferSelectModel<typeof serviceImages>;

// ── Insert types ─────────────────────────────────────────────────────────────

export type NewVehicle = InferInsertModel<typeof vehicles>;
export type NewServiceRecord = InferInsertModel<typeof serviceRecords>;
export type NewServiceImage = InferInsertModel<typeof serviceImages>;

// ── Enums as const arrays ────────────────────────────────────────────────────

export const VEHICLE_STATUSES = [
  "waiting",
  "in_repair",
  "waiting_parts",
  "ready_for_pickup",
] as const;

export const SERVICE_TYPES = ["repair", "service", "upgrade"] as const;

export const IMAGE_TYPES = ["before", "after"] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type ImageType = (typeof IMAGE_TYPES)[number];

// ─── Kanban column metadata ──────────────────────────────────────────────────

export interface KanbanColumn {
  status: VehicleStatus;
  label: string;
  description: string;
  color: "slate" | "amber" | "rose" | "emerald";
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    status: "waiting",
    label: "En Espera",
    description: "Vehículos aguardando ingreso",
    color: "slate",
  },
  {
    status: "in_repair",
    label: "En Reparación",
    description: "Trabajo en progreso",
    color: "amber",
  },
  {
    status: "waiting_parts",
    label: "Esperando Repuestos",
    description: "A la espera de piezas",
    color: "rose",
  },
  {
    status: "ready_for_pickup",
    label: "Listo para Retirar",
    description: "Vehículos terminados",
    color: "emerald",
  },
];

// ── Server Action result type ────────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ActionResultWithData<T> extends ActionResult {
  data?: T;
}

// ── Sort types ───────────────────────────────────────────────────────────────

export type SortBy = "brand" | "lastService";
export type SortOrder = "asc" | "desc";

// ── Dashboard search params ──────────────────────────────────────────────────

export interface DashboardSearchParams {
  q?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

// ── Joined query types ───────────────────────────────────────────────────────

export interface VehicleWithLastService extends Vehicle {
  lastServiceDate: string | null;
}

export interface ServiceRecordWithImages extends ServiceRecord {
  images: ServiceImage[];
  vehicle?: Pick<Vehicle, "id" | "licensePlate" | "brand" | "model">;
}