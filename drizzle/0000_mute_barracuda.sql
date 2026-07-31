CREATE TYPE "public"."image_type" AS ENUM('before', 'after');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('repair', 'service', 'upgrade');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('waiting', 'in_repair', 'waiting_parts', 'ready_for_pickup');--> statement-breakpoint
CREATE TABLE "mechanics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"workshop_name" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_record_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"image_type" "image_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"mechanic_id" uuid NOT NULL,
	"service_date" date NOT NULL,
	"mileage_at_service" integer NOT NULL,
	"type" "service_type" NOT NULL,
	"description" text,
	"cost" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mechanic_id" uuid NOT NULL,
	"owner_name" text NOT NULL,
	"owner_phone_raw" text,
	"owner_phone_normalized" text,
	"license_plate" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"current_mileage" integer DEFAULT 0 NOT NULL,
	"status" "vehicle_status" DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_record_id_service_records_id_fk" FOREIGN KEY ("service_record_id") REFERENCES "public"."service_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_mechanic_id_mechanics_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_mechanic_id_mechanics_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_service_images_record" ON "service_images" USING btree ("service_record_id");--> statement-breakpoint
CREATE INDEX "idx_service_records_vehicle" ON "service_records" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_service_records_mechanic" ON "service_records" USING btree ("mechanic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_vehicle_plate_mechanic" ON "vehicles" USING btree ("mechanic_id","license_plate");--> statement-breakpoint
CREATE INDEX "idx_vehicles_mechanic" ON "vehicles" USING btree ("mechanic_id");--> statement-breakpoint
CREATE INDEX "idx_vehicles_status" ON "vehicles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_vehicles_search" ON "vehicles" USING btree ("license_plate","model","owner_name","mechanic_id");