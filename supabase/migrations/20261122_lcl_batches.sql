-- Migration: LCL Consolidated Container Batches (Jadwal & Kuota Kontainer LCL Bersama)
CREATE TABLE IF NOT EXISTS public.imp_lcl_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  origin_country TEXT NOT NULL DEFAULT 'china' CHECK (
    origin_country IN ('china', 'malaysia', 'singapura')
  ),
  origin_warehouse TEXT NOT NULL DEFAULT 'Gudang Guangzhou',
  shipping_method TEXT NOT NULL DEFAULT 'laut' CHECK (
    shipping_method IN ('laut', 'darat', 'udara')
  ),
  container_size TEXT NOT NULL DEFAULT '20ft (28 CBM)',
  capacity_cbm NUMERIC(10, 2) NOT NULL DEFAULT 28.00,
  filled_cbm NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  min_slot_cbm NUMERIC(10, 2) NOT NULL DEFAULT 0.10,
  cutoff_date DATE NOT NULL,
  etd_date DATE,
  eta_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'almost_full', 'closed', 'sailing', 'arrived')
  ),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imp_lcl_batches_active
  ON public.imp_lcl_batches(is_active, sort_order ASC, cutoff_date ASC);

ALTER TABLE public.imp_lcl_batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'imp_lcl_batches'
      AND policyname = 'Public read active lcl batches'
  ) THEN
    CREATE POLICY "Public read active lcl batches"
      ON public.imp_lcl_batches
      FOR SELECT
      USING (is_active = TRUE);
  END IF;
END $$;

INSERT INTO public.imp_lcl_batches (
  batch_code,
  title,
  origin_country,
  origin_warehouse,
  shipping_method,
  container_size,
  capacity_cbm,
  filled_cbm,
  min_slot_cbm,
  cutoff_date,
  etd_date,
  eta_date,
  status,
  notes,
  is_active,
  sort_order
) VALUES
  (
    'LCL-GZ-PNK-2612A',
    'Kloter Konsolidasi LCL Guangzhou -> Pontianak #05 (Fast Closing)',
    'china',
    'Gudang Baiyun Guangzhou',
    'laut',
    '20ft (28 CBM)',
    28.00,
    19.60,
    0.10,
    CURRENT_DATE + INTERVAL '8 days',
    CURRENT_DATE + INTERVAL '11 days',
    CURRENT_DATE + INTERVAL '38 days',
    'almost_full',
    'Cocok untuk belanja campur 1688/Taobao (alat kopi, LED non-baterai, aksesoris Yiwu, sparepart walet). Sudah terisi 70%, sisa kuota terbatas sebelum tutup stuffing.',
    TRUE,
    1
  ),
  (
    'LCL-GZ-PNK-2612B',
    'Kloter Kontainer Besar 40ft HC Guangzhou -> Pontianak #06',
    'china',
    'Gudang Baiyun Guangzhou',
    'laut',
    '40ft HC (65 CBM)',
    65.00,
    24.50,
    0.10,
    CURRENT_DATE + INTERVAL '18 days',
    CURRENT_DATE + INTERVAL '21 days',
    CURRENT_DATE + INTERVAL '49 days',
    'open',
    'Ruang ekstra luas untuk gabungan kargo UMKM maupun order partai (standing pouch, sanitary, furniture knock-down, lampu solar kebun).',
    TRUE,
    2
  ),
  (
    'LCL-KCH-PNK-2611W',
    'Kloter Mingguan Darat Kuching -> Entikong -> Pontianak',
    'malaysia',
    'Gudang Pending Industrial Kuching',
    'darat',
    'Armada Box Lintas Batas (15 CBM)',
    15.00,
    8.50,
    0.10,
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '7 days',
    'open',
    'Jalur darat ekspres 2-4 hari kerja via PLBN Entikong. Ideal untuk stok kulakan Shopee MY, makanan kering kemasan, dan barang Sarawak.',
    TRUE,
    3
  )
ON CONFLICT (batch_code) DO NOTHING;

NOTIFY pgrst, 'reload schema';
