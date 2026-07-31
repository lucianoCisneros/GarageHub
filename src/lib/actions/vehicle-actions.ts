"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vehicles, serviceRecords } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  vehicleSchema,
  vehicleUpdateSchema,
  validateMileageAgainstLastService,
} from "@/lib/validations/vehicle-schema";
import { normalizeArgentinePhone } from "@/lib/utils/whatsapp";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  ActionResult,
  ActionResultWithData,
  Vehicle,
  VehicleWithLastService,
  VehicleStatus,
  SortBy,
  SortOrder,
} from "@/types";

async function getMechanicId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── Queries ───────────────────────────────────────────────────────────────

export async function getVehicles(
  search?: string,
  sortBy?: SortBy,
  sortOrder?: SortOrder,
): Promise<ActionResultWithData<VehicleWithLastService[]>> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    const conditions = [eq(vehicles.mechanicId, mechanicId)];

    if (search && search.trim().length > 0) {
      const query = `%${search.trim()}%`;
      conditions.push(
        sql`(
          ${vehicles.licensePlate} ILIKE ${query} OR
          ${vehicles.model} ILIKE ${query} OR
          ${vehicles.ownerName} ILIKE ${query} OR
          ${vehicles.brand} ILIKE ${query}
        )`,
      );
    }

    // CTE: latest service date per vehicle
    const latestService = db.$with("latest_service").as(
      db
        .select({
          vehicleId: serviceRecords.vehicleId,
          lastServiceDate: sql<string>`MAX(${serviceRecords.serviceDate})`.as(
            "last_service_date",
          ),
        })
        .from(serviceRecords)
        .groupBy(serviceRecords.vehicleId),
    );

    // Build ORDER BY clause
    const orderByClause =
      sortBy === "brand"
        ? sortOrder === "desc"
          ? desc(vehicles.brand)
          : asc(vehicles.brand)
        : sortBy === "lastService"
          ? sortOrder === "asc"
            ? sql`${latestService.lastServiceDate} ASC NULLS LAST`
            : sql`${latestService.lastServiceDate} DESC NULLS LAST`
          : desc(vehicles.updatedAt);

    const result = await db
      .with(latestService)
      .select({
        id: vehicles.id,
        mechanicId: vehicles.mechanicId,
        ownerName: vehicles.ownerName,
        ownerPhoneRaw: vehicles.ownerPhoneRaw,
        ownerPhoneNormalized: vehicles.ownerPhoneNormalized,
        licensePlate: vehicles.licensePlate,
        brand: vehicles.brand,
        model: vehicles.model,
        year: vehicles.year,
        currentMileage: vehicles.currentMileage,
        status: vehicles.status,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
        lastServiceDate: latestService.lastServiceDate,
      })
      .from(vehicles)
      .leftJoin(latestService, eq(vehicles.id, latestService.vehicleId))
      .where(and(...conditions))
      .orderBy(orderByClause);

    return { success: true, data: result };
  } catch (error) {
    console.error("getVehicles error:", error);
    return { success: false, error: "Error al obtener los vehículos" };
  }
}

export async function getVehicleById(
  id: string,
): Promise<ActionResultWithData<Vehicle>> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    const result = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.mechanicId, mechanicId)))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Vehículo no encontrado" };
    }

    return { success: true, data: result[0] };
  } catch {
    return { success: false, error: "Error al obtener el vehículo" };
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────

export async function createVehicle(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  const raw = {
    ownerName: formData.get("ownerName"),
    ownerPhone: formData.get("ownerPhone") || "",
    licensePlate: formData.get("licensePlate"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: Number(formData.get("year")),
    currentMileage: Number(formData.get("currentMileage")),
    status: formData.get("status") || "waiting",
  };

  const parsed = vehicleSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const ownerPhone = parsed.data.ownerPhone?.trim() || null;
    const ownerPhoneNormalized = ownerPhone
      ? normalizeArgentinePhone(ownerPhone)
      : null;

    await db.insert(vehicles).values({
      mechanicId,
      ownerName: parsed.data.ownerName,
      ownerPhoneRaw: ownerPhone,
      ownerPhoneNormalized,
      licensePlate: parsed.data.licensePlate,
      brand: parsed.data.brand,
      model: parsed.data.model,
      year: parsed.data.year,
      currentMileage: parsed.data.currentMileage,
      status: parsed.data.status,
    });

    revalidatePath("/vehicles");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Error al crear el vehículo. Verificá que la patente no esté duplicada." };
  }
}

export async function updateVehicle(
  id: string,
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  const raw = {
    ownerName: formData.get("ownerName") || undefined,
    ownerPhone: formData.get("ownerPhone") || undefined,
    licensePlate: formData.get("licensePlate") || undefined,
    brand: formData.get("brand") || undefined,
    model: formData.get("model") || undefined,
    year: formData.get("year") ? Number(formData.get("year")) : undefined,
    currentMileage: formData.get("currentMileage")
      ? Number(formData.get("currentMileage"))
      : undefined,
  };

  const parsed = vehicleUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Validate mileage against last service
  if (parsed.data.currentMileage !== undefined) {
    const lastService = await db
      .select({ mileageAtService: serviceRecords.mileageAtService })
      .from(serviceRecords)
      .where(eq(serviceRecords.vehicleId, id))
      .orderBy(desc(serviceRecords.serviceDate))
      .limit(1);

    const lastMileage = lastService[0]?.mileageAtService ?? null;
    const mileageError = validateMileageAgainstLastService(
      parsed.data.currentMileage,
      lastMileage,
    );

    if (mileageError) {
      return { success: false, error: mileageError };
    }
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (parsed.data.ownerName !== undefined) updateData.ownerName = parsed.data.ownerName;
    if (parsed.data.ownerPhone !== undefined) {
      const phone = parsed.data.ownerPhone?.trim() || null;
      updateData.ownerPhoneRaw = phone;
      updateData.ownerPhoneNormalized = phone
        ? normalizeArgentinePhone(phone)
        : null;
    }
    if (parsed.data.licensePlate !== undefined) updateData.licensePlate = parsed.data.licensePlate;
    if (parsed.data.brand !== undefined) updateData.brand = parsed.data.brand;
    if (parsed.data.model !== undefined) updateData.model = parsed.data.model;
    if (parsed.data.year !== undefined) updateData.year = parsed.data.year;
    if (parsed.data.currentMileage !== undefined) updateData.currentMileage = parsed.data.currentMileage;

    await db
      .update(vehicles)
      .set(updateData)
      .where(and(eq(vehicles.id, id), eq(vehicles.mechanicId, mechanicId)));

    revalidatePath("/vehicles");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el vehículo" };
  }
}

export async function updateVehicleStatus(
  vehicleId: string,
  newStatus: VehicleStatus,
): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    await db
      .update(vehicles)
      .set({ status: newStatus })
      .where(
        and(eq(vehicles.id, vehicleId), eq(vehicles.mechanicId, mechanicId)),
      );

    revalidatePath("/vehicles");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el estado" };
  }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    await db
      .delete(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.mechanicId, mechanicId)));

    revalidatePath("/vehicles");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar el vehículo" };
  }
}