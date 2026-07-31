-- ============================================================
-- GarageHub: RLS Policies + Storage Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;

-- 2. Mechanics: only the own mechanic can see/edit their profile
CREATE POLICY "mechanics_own" ON mechanics
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Customers: mechanic can only see their own customers
CREATE POLICY "customers_own" ON customers
  FOR ALL
  USING (mechanic_id = auth.uid())
  WITH CHECK (mechanic_id = auth.uid());

-- 4. Vehicles: mechanic can only see their own vehicles
CREATE POLICY "vehicles_own" ON vehicles
  FOR ALL
  USING (mechanic_id = auth.uid())
  WITH CHECK (mechanic_id = auth.uid());

-- 5. Service Records: mechanic can only see their own records
CREATE POLICY "service_records_own" ON service_records
  FOR ALL
  USING (mechanic_id = auth.uid())
  WITH CHECK (mechanic_id = auth.uid());

-- 6. Service Images: access via service record's mechanic_id
CREATE POLICY "service_images_own" ON service_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM service_records
      WHERE service_records.id = service_images.service_record_id
      AND service_records.mechanic_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_records
      WHERE service_records.id = service_images.service_record_id
      AND service_records.mechanic_id = auth.uid()
    )
  );

-- 7. Create Storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  false, -- private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage bucket policy: only authenticated mechanics can CRUD
CREATE POLICY "storage_own" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 9. Allow public SELECT on storage for authenticated users (to view images)
CREATE POLICY "storage_read_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
  );