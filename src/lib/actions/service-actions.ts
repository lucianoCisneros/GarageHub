"use server";

import { db } from "@/lib/db";
import { serviceRecords, serviceImages, vehicles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { serviceRecordSchema } from "@/lib/validations/service-schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  ActionResult,
  ActionResultWithData,
  ServiceRecord,
  ServiceRecordWithImages,
  ServiceImage,
} from "@/types";

async function getMechanicId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── Queries ───────────────────────────────────────────────────────────────

export async function getServiceRecordsByVehicle(
  vehicleId: string,
): Promise<ActionResultWithData<ServiceRecordWithImages[]>> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    const records = await db
      .select({
        id: serviceRecords.id,
        vehicleId: serviceRecords.vehicleId,
        mechanicId: serviceRecords.mechanicId,
        serviceDate: serviceRecords.serviceDate,
        mileageAtService: serviceRecords.mileageAtService,
        type: serviceRecords.type,
        description: serviceRecords.description,
        cost: serviceRecords.cost,
        createdAt: serviceRecords.createdAt,
      })
      .from(serviceRecords)
      .where(
        and(
          eq(serviceRecords.vehicleId, vehicleId),
          eq(serviceRecords.mechanicId, mechanicId),
        ),
      )
      .orderBy(desc(serviceRecords.serviceDate));

    // Attach images to each record
    const recordsWithImages: ServiceRecordWithImages[] = [];

    for (const record of records) {
      const images = await db
        .select()
        .from(serviceImages)
        .where(eq(serviceImages.serviceRecordId, record.id))
        .orderBy(serviceImages.createdAt);

      recordsWithImages.push({
        ...record,
        images,
      });
    }

    return { success: true, data: recordsWithImages };
  } catch {
    return { success: false, error: "Error al obtener los servicios" };
  }
}

export async function getServiceRecordById(
  id: string,
): Promise<ActionResultWithData<ServiceRecordWithImages>> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    const result = await db
      .select()
      .from(serviceRecords)
      .where(
        and(eq(serviceRecords.id, id), eq(serviceRecords.mechanicId, mechanicId)),
      )
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Servicio no encontrado" };
    }

    const images = await db
      .select()
      .from(serviceImages)
      .where(eq(serviceImages.serviceRecordId, id));

    return {
      success: true,
      data: { ...result[0], images },
    };
  } catch {
    return { success: false, error: "Error al obtener el servicio" };
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────

export async function createServiceRecord(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  const raw = {
    vehicleId: formData.get("vehicleId"),
    serviceDate: formData.get("serviceDate"),
    mileageAtService: Number(formData.get("mileageAtService")),
    type: formData.get("type"),
    description: formData.get("description") || "",
    cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
  };

  const parsed = serviceRecordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.insert(serviceRecords).values({
      mechanicId,
      vehicleId: parsed.data.vehicleId,
      serviceDate: parsed.data.serviceDate,
      mileageAtService: parsed.data.mileageAtService,
      type: parsed.data.type,
      description: parsed.data.description || null,
      cost: parsed.data.cost?.toString() ?? null,
    });

    // Update vehicle's current mileage to match the service mileage
    // Only if the service mileage is higher than current
    await db
      .update(vehicles)
      .set({ currentMileage: parsed.data.mileageAtService })
      .where(
        and(
          eq(vehicles.id, parsed.data.vehicleId),
          eq(vehicles.mechanicId, mechanicId),
          sql`${vehicles.currentMileage} < ${parsed.data.mileageAtService}`,
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Error al crear el registro de servicio" };
  }
}

export async function updateServiceRecord(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  const recordId = formData.get("recordId") as string;
  if (!recordId) return { success: false, error: "ID de servicio requerido" };

  const raw = {
    vehicleId: formData.get("vehicleId"),
    serviceDate: formData.get("serviceDate"),
    mileageAtService: Number(formData.get("mileageAtService")),
    type: formData.get("type"),
    description: formData.get("description") || "",
    cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
  };

  // Validate without vehicleId since we're updating an existing record
  const updateSchema = serviceRecordSchema.omit({ vehicleId: true });
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Verify ownership
    const existing = await db
      .select({ id: serviceRecords.id })
      .from(serviceRecords)
      .where(
        and(
          eq(serviceRecords.id, recordId),
          eq(serviceRecords.mechanicId, mechanicId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Servicio no encontrado" };
    }

    await db
      .update(serviceRecords)
      .set({
        serviceDate: parsed.data.serviceDate,
        mileageAtService: parsed.data.mileageAtService,
        type: parsed.data.type,
        description: parsed.data.description || null,
        cost: parsed.data.cost?.toString() ?? null,
      })
      .where(eq(serviceRecords.id, recordId));

    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el servicio" };
  }
}

export async function deleteServiceRecord(
  recordId: string,
): Promise<ActionResult> {
  const mechanicId = await getMechanicId();
  if (!mechanicId) return { success: false, error: "No autenticado" };

  try {
    // Verify ownership
    const existing = await db
      .select({ id: serviceRecords.id })
      .from(serviceRecords)
      .where(
        and(
          eq(serviceRecords.id, recordId),
          eq(serviceRecords.mechanicId, mechanicId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Servicio no encontrado" };
    }

    // Images will be cascade-deleted by the DB foreign key
    await db
      .delete(serviceRecords)
      .where(eq(serviceRecords.id, recordId));

    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar el servicio" };
  }
}
