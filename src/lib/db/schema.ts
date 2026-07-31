import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ────────────────────────────────────────────────────────────────────

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "waiting",
  "in_repair",
  "waiting_parts",
  "ready_for_pickup",
]);

export const serviceTypeEnum = pgEnum("service_type", [
  "repair",
  "service",
  "upgrade",
]);

export const imageTypeEnum = pgEnum("image_type", ["before", "after"]);

// ── Mechanics (linked to Supabase Auth) ──────────────────────────────────────

export const mechanics = pgTable("mechanics", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  workshopName: text("workshop_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Vehicles (includes owner info) ──────────────────────────────────────────

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mechanicId: uuid("mechanic_id")
      .notNull()
      .references(() => mechanics.id, { onDelete: "cascade" }),
    ownerName: text("owner_name").notNull(),
    ownerPhoneRaw: text("owner_phone_raw"),
    ownerPhoneNormalized: text("owner_phone_normalized"),
    licensePlate: text("license_plate").notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    currentMileage: integer("current_mileage").notNull().default(0),
    status: vehicleStatusEnum("status").notNull().default("waiting"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    // Each mechanic can't have duplicate license plates
    uniqueLicensePerMechanic: uniqueIndex("idx_vehicle_plate_mechanic").on(
      table.mechanicId,
      table.licensePlate,
    ),
    mechanicIdx: index("idx_vehicles_mechanic").on(table.mechanicId),
    statusIdx: index("idx_vehicles_status").on(table.status),
    searchIdx: index("idx_vehicles_search").on(
      table.licensePlate,
      table.model,
      table.ownerName,
      table.mechanicId,
    ),
  }),
);

// ── Service Records ──────────────────────────────────────────────────────────

export const serviceRecords = pgTable(
  "service_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    mechanicId: uuid("mechanic_id")
      .notNull()
      .references(() => mechanics.id, { onDelete: "cascade" }),
    serviceDate: date("service_date").notNull(),
    mileageAtService: integer("mileage_at_service").notNull(),
    type: serviceTypeEnum("type").notNull(),
    description: text("description"),
    cost: numeric("cost", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    vehicleIdx: index("idx_service_records_vehicle").on(table.vehicleId),
    mechanicIdx: index("idx_service_records_mechanic").on(table.mechanicId),
  }),
);

// ── Service Images (Before / After) ──────────────────────────────────────────

export const serviceImages = pgTable(
  "service_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceRecordId: uuid("service_record_id")
      .notNull()
      .references(() => serviceRecords.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    imageType: imageTypeEnum("image_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    serviceRecordIdx: index("idx_service_images_record").on(
      table.serviceRecordId,
    ),
  }),
);

// ── Relations ────────────────────────────────────────────────────────────────

export const mechanicsRelations = relations(mechanics, ({ many }) => ({
  vehicles: many(vehicles),
  serviceRecords: many(serviceRecords),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  mechanic: one(mechanics, {
    fields: [vehicles.mechanicId],
    references: [mechanics.id],
  }),
  serviceRecords: many(serviceRecords),
}));

export const serviceRecordsRelations = relations(
  serviceRecords,
  ({ one, many }) => ({
    vehicle: one(vehicles, {
      fields: [serviceRecords.vehicleId],
      references: [vehicles.id],
    }),
    mechanic: one(mechanics, {
      fields: [serviceRecords.mechanicId],
      references: [mechanics.id],
    }),
    images: many(serviceImages),
  }),
);

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  serviceRecord: one(serviceRecords, {
    fields: [serviceImages.serviceRecordId],
    references: [serviceRecords.id],
  }),
}));