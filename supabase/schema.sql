-- Importir Pontianak | Stage 1 MVP Database Schema & Seed Data
-- Prefixed with imp_ in schema public to coexist cleanly on shared Supabase Postgres.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS public.imp_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. System Settings (FX rates, sourcing/transfer fees, WhatsApp, company info)
CREATE TABLE IF NOT EXISTS public.imp_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Shipping Rates (China, Malaysia/Kuching, Singapura -> Pontianak)
CREATE TABLE IF NOT EXISTS public.imp_shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country TEXT NOT NULL CHECK (origin_country IN ('china', 'malaysia', 'singapura')),
  origin_label TEXT NOT NULL,
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('udara', 'laut', 'darat')),
  method_label TEXT NOT NULL,
  cargo_category TEXT NOT NULL CHECK (cargo_category IN ('general', 'fashion', 'elektronik', 'khusus')),
  category_label TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'cbm')),
  rate_idr INTEGER NOT NULL,
  min_charge NUMERIC(10, 2) NOT NULL DEFAULT 1,
  eta_min_days INTEGER NOT NULL,
  eta_max_days INTEGER NOT NULL,
  volumetric_divisor INTEGER NOT NULL DEFAULT 6000,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (origin_country, shipping_method, cargo_category, unit)
);

-- 4. Kalimantan Barat Domestic Destinations (from Gudang Pontianak)
CREATE TABLE IF NOT EXISTS public.imp_kalbar_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT UNIQUE NOT NULL,
  extra_fee_per_kg INTEGER NOT NULL DEFAULT 0,
  extra_fee_flat INTEGER NOT NULL DEFAULT 0,
  extra_eta_days INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Overseas Transit Warehouses
CREATE TABLE IF NOT EXISTS public.imp_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country TEXT UNIQUE NOT NULL CHECK (origin_country IN ('china', 'malaysia', 'singapura')),
  warehouse_name TEXT NOT NULL,
  city TEXT NOT NULL,
  address_local TEXT NOT NULL,
  address_english TEXT NOT NULL,
  recipient_format TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  supported_methods TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 6. RFQ & Order Requests
CREATE TABLE IF NOT EXISTS public.imp_rfq_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_code TEXT UNIQUE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('titip_beli', 'forwarder', 'transfer_valas')),
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  company_name TEXT,
  destination_city TEXT NOT NULL,
  origin_country TEXT NOT NULL CHECK (origin_country IN ('china', 'malaysia', 'singapura')),
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('udara', 'laut', 'darat', 'transfer_only')),
  cargo_category TEXT NOT NULL DEFAULT 'general' CHECK (cargo_category IN ('general', 'fashion', 'elektronik', 'khusus')),
  product_url TEXT,
  product_name TEXT NOT NULL,
  product_photo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'RMB' CHECK (currency IN ('RMB', 'MYR', 'SGD', 'IDR')),
  estimated_goods_value NUMERIC(14, 2),
  quantity INTEGER DEFAULT 1,
  estimated_weight_kg NUMERIC(10, 2),
  estimated_cbm NUMERIC(10, 3),
  estimated_total_idr BIGINT,
  quoted_total_idr BIGINT,
  customer_notes TEXT,
  admin_notes TEXT,
  status TEXT NOT NULL DEFAULT 'baru' CHECK (status IN ('baru', 'diproses', 'penawaran_dikirim', 'disetujui', 'dibatalkan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Shipments
CREATE TABLE IF NOT EXISTS public.imp_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  marking_code TEXT NOT NULL,
  supplier_tracking_no TEXT,
  rfq_id UUID REFERENCES public.imp_rfq_orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  origin_country TEXT NOT NULL CHECK (origin_country IN ('china', 'malaysia', 'singapura')),
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('udara', 'laut', 'darat')),
  cargo_category TEXT NOT NULL DEFAULT 'general' CHECK (cargo_category IN ('general', 'fashion', 'elektronik', 'khusus')),
  destination_city TEXT NOT NULL,
  item_summary TEXT NOT NULL,
  actual_weight_kg NUMERIC(10, 2),
  actual_cbm NUMERIC(10, 3),
  colli_count INTEGER NOT NULL DEFAULT 1,
  invoice_amount_idr BIGINT,
  payment_status TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (payment_status IN ('belum_bayar', 'dp', 'lunas')),
  current_status TEXT NOT NULL DEFAULT 'order_confirmed' CHECK (current_status IN (
    'order_confirmed',
    'received_origin_warehouse',
    'in_transit',
    'customs_clearance',
    'arrived_pontianak',
    'out_for_delivery',
    'delivered'
  )),
  estimated_arrival DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tracking Timeline Events
CREATE TABLE IF NOT EXISTS public.imp_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.imp_shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imp_rfq_orders_created_at ON public.imp_rfq_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_imp_shipments_tracking_number ON public.imp_shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_imp_shipments_marking_code ON public.imp_shipments(marking_code);
CREATE INDEX IF NOT EXISTS idx_imp_tracking_events_shipment_id ON public.imp_tracking_events(shipment_id, event_time DESC);

-- Enable Row Level Security on all tables
-- All writes & privileged reads happen strictly through Next.js server routes using SERVICE_ROLE_KEY.
ALTER TABLE public.imp_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_kalbar_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_rfq_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imp_tracking_events ENABLE ROW LEVEL SECURITY;

-- Optional read-only anon policies ONLY for non-sensitive public reference tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'imp_shipping_rates' AND policyname = 'Public read active shipping rates') THEN
    CREATE POLICY "Public read active shipping rates" ON public.imp_shipping_rates FOR SELECT USING (is_active = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'imp_kalbar_destinations' AND policyname = 'Public read active destinations') THEN
    CREATE POLICY "Public read active destinations" ON public.imp_kalbar_destinations FOR SELECT USING (is_active = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'imp_warehouses' AND policyname = 'Public read active warehouses') THEN
    CREATE POLICY "Public read active warehouses" ON public.imp_warehouses FOR SELECT USING (is_active = TRUE);
  END IF;
END $$;

-- Idempotent seed data

INSERT INTO public.imp_settings (key, value, label) VALUES
  ('rate_rmb_idr', '2280', 'Kurs 1 RMB (Yuan) ke IDR'),
  ('rate_myr_idr', '3720', 'Kurs 1 MYR (Ringgit) ke IDR'),
  ('rate_sgd_idr', '12150', 'Kurs 1 SGD (Dolar Singapura) ke IDR'),
  ('sourcing_fee_percent', '5', 'Fee Jasa Titip Beli (%)'),
  ('sourcing_fee_min_idr', '100000', 'Minimum Fee Titip Beli (IDR)'),
  ('transfer_fee_idr', '50000', 'Fee Jasa Transfer Valas per Transaksi (IDR)'),
  ('whatsapp_admin', '6281256789012', 'Nomor WhatsApp Admin (format 628...)'),
  ('company_name', 'Importir Pontianak', 'Nama Brand / Perusahaan'),
  ('company_address', 'Jl. Ahmad Yani II, Pontianak / Kubu Raya, Kalimantan Barat', 'Alamat Gudang & Kantor Pontianak'),
  ('operating_hours', 'Senin – Sabtu, 08:30 – 17:30 WIB', 'Jam Operasional')
ON CONFLICT (key) DO NOTHING;

-- 28 Shipping Rates (7 Route Modes x 4 Cargo Categories)
INSERT INTO public.imp_shipping_rates (
  origin_country, origin_label, shipping_method, method_label, cargo_category, category_label,
  unit, rate_idr, min_charge, eta_min_days, eta_max_days, volumetric_divisor, notes
) VALUES
  -- 1. China Udara (kg, min 1, ETA 5-8d, div 6000)
  ('china', 'China (Guangzhou / Yiwu)', 'udara', 'Jalur Udara (Air Freight)', 'general', 'General Cargo', 'kg', 185000, 1.0, 5, 8, 6000, 'All-in bea cukai & gudang Pontianak. Berat volumetrik P×L×T/6000.'),
  ('china', 'China (Guangzhou / Yiwu)', 'udara', 'Jalur Udara (Air Freight)', 'fashion', 'Fashion & Aksesoris', 'kg', 205000, 1.0, 5, 8, 6000, 'Termasuk tas, sepatu, pakaian, tekstil & aksesoris.'),
  ('china', 'China (Guangzhou / Yiwu)', 'udara', 'Jalur Udara (Air Freight)', 'elektronik', 'Elektronik Non-Baterai / Gadget', 'kg', 230000, 1.0, 6, 9, 6000, 'Untuk barang mengandung baterai besar/magnet harap konfirmasi admin.'),
  ('china', 'China (Guangzhou / Yiwu)', 'udara', 'Jalur Udara (Air Freight)', 'khusus', 'Lartas / Kosmetik / Sparepart Khusus', 'kg', 260000, 1.0, 7, 10, 6000, 'Kategori khusus dengan handling & dokumen penyesuaian.'),

  -- 2. China Laut LCL (cbm, min 0.1, ETA 25-35d)
  ('china', 'China (Guangzhou / Yiwu)', 'laut', 'Jalur Laut LCL (Sea Freight)', 'general', 'General Cargo', 'cbm', 4800000, 0.1, 25, 35, 1000000, 'Cocok untuk barang besar/berat & stok grosir langsung ke Pontianak.'),
  ('china', 'China (Guangzhou / Yiwu)', 'laut', 'Jalur Laut LCL (Sea Freight)', 'fashion', 'Fashion & Aksesoris', 'cbm', 5200000, 0.1, 25, 35, 1000000, 'Tarif all-in termasuk kepabeanan hingga gudang Pontianak.'),
  ('china', 'China (Guangzhou / Yiwu)', 'laut', 'Jalur Laut LCL (Sea Freight)', 'elektronik', 'Elektronik / Mesin Ringan', 'cbm', 5800000, 0.1, 28, 38, 1000000, 'Disarankan packing kayu tambahan untuk barang pecah belah/mesin.'),
  ('china', 'China (Guangzhou / Yiwu)', 'laut', 'Jalur Laut LCL (Sea Freight)', 'khusus', 'Lartas / Cairan / Komoditas Khusus', 'cbm', 6500000, 0.1, 30, 40, 1000000, 'Wajib konfirmasi MSDS/foto produk sebelum kirim ke gudang Guangzhou.'),

  -- 3. Malaysia / Kuching Darat Entikong-Aruk (kg, min 3, ETA 2-4d, div 5000)
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat Lintas Batas (Entikong / Aruk)', 'general', 'General Cargo', 'kg', 38000, 3.0, 2, 4, 5000, 'Rute unggulan Kuching–Pontianak via PLBN Entikong / Aruk. Super cepat!'),
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat Lintas Batas (Entikong / Aruk)', 'fashion', 'Fashion & Aksesoris', 'kg', 45000, 3.0, 2, 4, 5000, 'Cocok untuk belanja grosir Malaysia / Shopee MY ke gudang Kuching.'),
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat Lintas Batas (Entikong / Aruk)', 'elektronik', 'Elektronik / Sparepart', 'kg', 55000, 3.0, 3, 5, 5000, 'Pengiriman darat minim guncangan, aman untuk komponen & alat toko.'),
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat Lintas Batas (Entikong / Aruk)', 'khusus', 'Lartas / Makanan Kering / Khusus', 'kg', 65000, 3.0, 3, 6, 5000, 'Untuk produk kemasan/makanan kering tertentu wajib konsultasi kuota.'),

  -- 4. Malaysia / Kuching Darat LCL (cbm, min 0.2, ETA 3-5d)
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat LCL (Kargo Kubikasi Kuching–PNK)', 'general', 'General Cargo', 'cbm', 2400000, 0.2, 3, 5, 1000000, 'Hemat untuk kulakan partai besar dari Kuching / Sarawak.'),
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat LCL (Kargo Kubikasi Kuching–PNK)', 'fashion', 'Fashion & Aksesoris', 'cbm', 2700000, 0.2, 3, 5, 1000000, 'Konsolidasi harian/mingguan ke gudang Pontianak.'),
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat LCL (Kargo Kubikasi Kuching–PNK)', 'elektronik', 'Elektronik / Peralatan Usaha', 'cbm', 3100000, 0.2, 4, 6, 1000000, 'Termasuk penanganan muat & bongkar lintas perbatasan.'),
  ('malaysia', 'Malaysia / Kuching', 'darat', 'Jalur Darat LCL (Kargo Kubikasi Kuching–PNK)', 'khusus', 'Lartas / Bahan Baku Khusus', 'cbm', 3500000, 0.2, 4, 7, 1000000, 'Konfirmasikan jenis barang kepada tim sebelum pickup/kirim.'),

  -- 5. Malaysia Udara KL-PNK (kg, min 1, ETA 3-5d, div 6000)
  ('malaysia', 'Malaysia / Kuching', 'udara', 'Jalur Udara (Kuala Lumpur – Pontianak)', 'general', 'General Cargo', 'kg', 115000, 1.0, 3, 5, 6000, 'Pengiriman ekspres dari Semenanjung Malaysia (KL) ke Pontianak.'),
  ('malaysia', 'Malaysia / Kuching', 'udara', 'Jalur Udara (Kuala Lumpur – Pontianak)', 'fashion', 'Fashion & Aksesoris', 'kg', 130000, 1.0, 3, 5, 6000, 'Ideal untuk fashion branded Malaysia & produk reseller cepat saji.'),
  ('malaysia', 'Malaysia / Kuching', 'udara', 'Jalur Udara (Kuala Lumpur – Pontianak)', 'elektronik', 'Elektronik / Gadget', 'kg', 150000, 1.0, 4, 6, 6000, 'Handling khusus pengiriman udara, non-baterai lepas.'),
  ('malaysia', 'Malaysia / Kuching', 'udara', 'Jalur Udara (Kuala Lumpur – Pontianak)', 'khusus', 'Lartas / Suplemen / Khusus', 'kg', 170000, 1.0, 4, 7, 6000, 'Memerlukan verifikasi invoice & daftar isi paket.'),

  -- 6. Singapura Udara (kg, min 1, ETA 3-5d, div 6000)
  ('singapura', 'Singapura (Tuas / Changi)', 'udara', 'Jalur Udara (Air Freight SG–PNK)', 'general', 'General Cargo', 'kg', 135000, 1.0, 3, 5, 6000, 'Ekspres dari Singapura untuk barang bernilai & urgent.'),
  ('singapura', 'Singapura (Tuas / Changi)', 'udara', 'Jalur Udara (Air Freight SG–PNK)', 'fashion', 'Fashion & Lifestyle', 'kg', 150000, 1.0, 3, 5, 6000, 'Cocok untuk titip beli ritel maupun distributor resmi Singapura.'),
  ('singapura', 'Singapura (Tuas / Changi)', 'udara', 'Jalur Udara (Air Freight SG–PNK)', 'elektronik', 'Elektronik / Sparepart Industri', 'kg', 175000, 1.0, 4, 6, 6000, 'Banyak digunakan untuk sparepart mesin, IT, & komponen presisi.'),
  ('singapura', 'Singapura (Tuas / Changi)', 'udara', 'Jalur Udara (Air Freight SG–PNK)', 'khusus', 'Lartas / Barang Khusus', 'kg', 195000, 1.0, 4, 7, 6000, 'Wajib lampirkan invoice & packing list dari supplier Singapura.'),

  -- 7. Singapura Laut LCL (cbm, min 0.1, ETA 7-14d)
  ('singapura', 'Singapura (Tuas / Changi)', 'laut', 'Jalur Laut LCL (Sea Freight SG–PNK)', 'general', 'General Cargo', 'cbm', 3400000, 0.1, 7, 14, 1000000, 'Lead time cepat ke Kalimantan Barat tanpa harus transit berbelit.'),
  ('singapura', 'Singapura (Tuas / Changi)', 'laut', 'Jalur Laut LCL (Sea Freight SG–PNK)', 'fashion', 'Fashion & Consumer Goods', 'cbm', 3800000, 0.1, 7, 14, 1000000, 'All-in pelabuhan & pengurusan dokumen hingga gudang Pontianak.'),
  ('singapura', 'Singapura (Tuas / Changi)', 'laut', 'Jalur Laut LCL (Sea Freight SG–PNK)', 'elektronik', 'Elektronik / Peralatan Komersial', 'cbm', 4200000, 0.1, 8, 15, 1000000, 'Direkomendasikan asuransi & packing palet kayu untuk alat berat.'),
  ('singapura', 'Singapura (Tuas / Changi)', 'laut', 'Jalur Laut LCL (Sea Freight SG–PNK)', 'khusus', 'Lartas / Bahan Industri Khusus', 'cbm', 4700000, 0.1, 9, 16, 1000000, 'Hubungi admin untuk pengecekan HS Code sebelum pengiriman.')
ON CONFLICT (origin_country, shipping_method, cargo_category, unit) DO NOTHING;

-- 15 Pontianak & Kalimantan Barat Destinations
INSERT INTO public.imp_kalbar_destinations (city_name, extra_fee_per_kg, extra_fee_flat, extra_eta_days, sort_order) VALUES
  ('Pontianak (Ambil di Gudang)', 0, 0, 0, 1),
  ('Pontianak (Kurir Dalam Kota)', 0, 25000, 0, 2),
  ('Kubu Raya (Sungai Raya / Rasau)', 1500, 20000, 1, 3),
  ('Mempawah', 2500, 25000, 1, 4),
  ('Singkawang', 3500, 30000, 1, 5),
  ('Bengkayang', 4500, 35000, 2, 6),
  ('Sambas', 5000, 40000, 2, 7),
  ('Landak (Ngabang)', 4000, 35000, 1, 8),
  ('Sanggau', 4500, 40000, 2, 9),
  ('Sekadau', 5500, 45000, 2, 10),
  ('Sintang', 6500, 50000, 2, 11),
  ('Melawi (Nanga Pinoh)', 7500, 60000, 3, 12),
  ('Kapuas Hulu (Putussibau)', 9500, 75000, 4, 13),
  ('Ketapang', 8000, 65000, 3, 14),
  ('Kayong Utara (Sukadana)', 8500, 70000, 3, 15)
ON CONFLICT (city_name) DO NOTHING;

-- 3 Overseas Transit Warehouses
INSERT INTO public.imp_warehouses (
  origin_country, warehouse_name, city, address_local, address_english, recipient_format, phone, postal_code, supported_methods, notes
) VALUES
  (
    'china',
    'Gudang Transit Guangzhou (Importir Pontianak)',
    'Guangzhou, Guangdong',
    '广东省广州市白云区石井镇鸦岗大道18号 A区3仓 (唛头: [MARKING_CODE])',
    'Block A Warehouse 3, No. 18 Yagang Avenue, Shijing Town, Baiyun District, Guangzhou, Guangdong, China (Marking: [MARKING_CODE])',
    'ImportirPNK / [MARKING_CODE]',
    '+86 138-0013-8899',
    '510430',
    ARRAY['udara', 'laut'],
    'Wajib cantumkan Marking Code Anda pada label dus & informasi resi lokal China (SF Express / ZTO / YTO / Yunda) agar tidak tertukar saat konsolidasi.'
  ),
  (
    'malaysia',
    'Gudang Transit Kuching & Hub Kuala Lumpur',
    'Kuching, Sarawak (Lintas Batas Entikong/Aruk)',
    'Lot 128, Pending Industrial Estate, Jalan Gedong, 93450 Kuching, Sarawak, Malaysia (Ref: [MARKING_CODE]) | Hub KL: Jalan Chan Sow Lin, 55200 Kuala Lumpur',
    'Lot 128, Pending Industrial Estate, Jalan Gedong, 93450 Kuching, Sarawak, Malaysia (Ref: [MARKING_CODE])',
    'PNK-MY / [MARKING_CODE]',
    '+60 82-550-891',
    '93450',
    ARRAY['darat', 'udara'],
    'Paket Shopee MY / supplier Sarawak langsung kirim ke gudang Kuching untuk jalur darat cepat 2–4 hari ke Pontianak. Barang dari Semenanjung bisa via Hub KL Udara atau Pos Laju ke Kuching.'
  ),
  (
    'singapura',
    'Gudang Transit Tuas Singapura',
    'Tuas, West Region, Singapore',
    '28 Tuas South Avenue 2, Unit #02-14 Westlink Hub, Singapore 637519 (Attn: [MARKING_CODE])',
    '28 Tuas South Avenue 2, Unit #02-14 Westlink Hub, Singapore 637519 (Attn: [MARKING_CODE])',
    'PNK-SG / [MARKING_CODE]',
    '+65 6892-4410',
    '637519',
    ARRAY['udara', 'laut'],
    'Harap sertakan Commercial Invoice & Packing List (PDF/foto) kepada admin saat resi lokal Singapura (NinjaVan / J&T SG / Lalamove) dikirim ke gudang Tuas.'
  )
ON CONFLICT (origin_country) DO NOTHING;

-- 2 Demo RFQ Orders
INSERT INTO public.imp_rfq_orders (
  id, rfq_code, service_type, customer_name, customer_whatsapp, company_name, destination_city,
  origin_country, shipping_method, cargo_category, product_url, product_name, currency,
  estimated_goods_value, quantity, estimated_weight_kg, estimated_cbm, estimated_total_idr,
  quoted_total_idr, customer_notes, admin_notes, status
) VALUES
  (
    '11111111-1111-4111-8111-111111111101',
    'RFQ-PNK-2611-0001',
    'titip_beli',
    'Hendra Wijaya',
    '6281255443322',
    'Toko Cahaya Kopi Pontianak',
    'Pontianak (Kurir Dalam Kota)',
    'china',
    'laut',
    'elektronik',
    'https://detail.1688.com/offer/782910384712.html',
    'Mesin Grinder Kopi Komersial 600N Stainless (5 Unit)',
    'RMB',
    3250,
    5,
    42.5,
    0.35,
    10248000,
    10150000,
    'Mohon cek voltase 220V colokan Indonesia dan tambahkan packing kayu per dus.',
    'Supplier Yiwu sudah dikonfirmasi ready stok 220V. Menunggu konfirmasi DP 50%.',
    'penawaran_dikirim'
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'RFQ-PNK-2611-0002',
    'forwarder',
    'Siti Rahmawati',
    '6285249981122',
    'Boutique Singkawang Collection',
    'Singkawang',
    'malaysia',
    'darat',
    'fashion',
    'https://shopee.com.my/example-batik-sarawak-grosir',
    'Kain Tenun & Busana Muslim Grosir (3 Koli)',
    'MYR',
    4500,
    60,
    28.0,
    NULL,
    1388000,
    NULL,
    'Barang sudah dibeli langsung ke supplier Kuching, siap kirim ke gudang Pending Kuching.',
    'Segera berikan marking code PNK-MY setelah konfirmasi nomor resi Pos Laju.',
    'baru'
  )
ON CONFLICT (rfq_code) DO NOTHING;

-- 3 Demo Shipments (covering China Laut, Malaysia Darat, Singapura Udara)
INSERT INTO public.imp_shipments (
  id, tracking_number, marking_code, supplier_tracking_no, rfq_id,
  customer_name, customer_whatsapp, origin_country, shipping_method, cargo_category,
  destination_city, item_summary, actual_weight_kg, actual_cbm, colli_count,
  invoice_amount_idr, payment_status, current_status, estimated_arrival
) VALUES
  (
    '22222222-2222-4222-8222-222222222201',
    'IMP-PNK-2026-0001',
    'PNK-CN-BUDI88',
    'SF1629384710293',
    NULL,
    'CV Borneo Packaging (Budi)',
    '628115678221',
    'china',
    'laut',
    'general',
    'Pontianak (Ambil di Gudang)',
    'Kemasan Standing Pouch & Mesin Sealer (12 Koli)',
    210.00,
    0.850,
    12,
    4080000,
    'dp',
    'in_transit',
    CURRENT_DATE + INTERVAL '8 days'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    'IMP-PNK-2026-0002',
    'PNK-MY-SINTA04',
    'MYPL882716253',
    NULL,
    'Sinta Mart Sintang',
    '6281345009988',
    'malaysia',
    'darat',
    'fashion',
    'Sintang',
    'Produk Rumah Tangga & Busana Malaysia (4 Koli)',
    36.50,
    NULL,
    4,
    1929750,
    'lunas',
    'arrived_pontianak',
    CURRENT_DATE + INTERVAL '1 day'
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    'IMP-PNK-2026-0003',
    'PNK-SG-TECH19',
    'SG-NV-9928172',
    NULL,
    'Bengkel Diesel Khatulistiwa',
    '6281622334455',
    'singapura',
    'udara',
    'elektronik',
    'Pontianak (Kurir Dalam Kota)',
    'Sparepart Sensor & Modul Kontrol Genset (1 Koli)',
    4.20,
    NULL,
    1,
    812500,
    'lunas',
    'delivered',
    CURRENT_DATE - INTERVAL '2 days'
  )
ON CONFLICT (tracking_number) DO NOTHING;

-- Tracking Events for IMP-PNK-2026-0001 (China Laut - In Transit)
INSERT INTO public.imp_tracking_events (id, shipment_id, status, title, location, description, event_time) VALUES
  ('33333333-3333-4333-8333-333333330101', '22222222-2222-4222-8222-222222222201', 'order_confirmed', 'Order & Marking Code Diterbitkan', 'Pontianak, Kalbar', 'Marking code PNK-CN-BUDI88 aktif dan diteruskan ke supplier Guangzhou.', NOW() - INTERVAL '14 days'),
  ('33333333-3333-4333-8333-333333330102', '22222222-2222-4222-8222-222222222201', 'received_origin_warehouse', 'Diterima & Diukur di Gudang Guangzhou', 'Guangzhou, China', '12 koli diterima via SF Express. Hasil ukur final 0.850 CBM (210 kg). Kondisi dus utuh.', NOW() - INTERVAL '11 days'),
  ('33333333-3333-4333-8333-333333330103', '22222222-2222-4222-8222-222222222201', 'in_transit', 'Kapal Berangkat Menuju Hub Kalbar', 'Pelabuhan Nansha, Guangzhou', 'Kontainer LCL telah stuffing dan berlayar menuju Indonesia (estimasi tiba di gudang Pontianak 8 hari lagi).', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Tracking Events for IMP-PNK-2026-0002 (Malaysia Darat - Arrived Pontianak)
INSERT INTO public.imp_tracking_events (id, shipment_id, status, title, location, description, event_time) VALUES
  ('33333333-3333-4333-8333-333333330201', '22222222-2222-4222-8222-222222222202', 'order_confirmed', 'Resi Lokal Didaftarkan', 'Pontianak, Kalbar', 'Marking code PNK-MY-SINTA04 terdaftar untuk rute darat Kuching–Pontianak.', NOW() - INTERVAL '4 days'),
  ('33333333-3333-4333-8333-333333330202', '22222222-2222-4222-8222-222222222202', 'received_origin_warehouse', 'Paket Tiba di Gudang Kuching', 'Kuching, Sarawak', '4 koli diterima dan ditimbang 36.5 kg. Siap diberangkatkan via armada darat.', NOW() - INTERVAL '3 days'),
  ('33333333-3333-4333-8333-333333330203', '22222222-2222-4222-8222-222222222202', 'in_transit', 'Berangkat Menuju Perbatasan Entikong', 'Kuching – Tebedu', 'Armada box menuju pos lintas batas Tebedu / Entikong.', NOW() - INTERVAL '2 days'),
  ('33333333-3333-4333-8333-333333330204', '22222222-2222-4222-8222-222222222202', 'customs_clearance', 'Selesai Pemeriksaan Lintas Batas', 'PLBN Entikong, Sanggau', 'Proses pemeriksaan dokumen & kepabeanan lintas batas selesai lancar.', NOW() - INTERVAL '1 day'),
  ('33333333-3333-4333-8333-333333330205', '22222222-2222-4222-8222-222222222202', 'arrived_pontianak', 'Tiba di Gudang Pontianak (Siap Diteruskan ke Sintang)', 'Gudang Pontianak, Jl. Ahmad Yani II', 'Kargo tiba di gudang Pontianak dan dijadwalkan penerusan ekspedisi darat ke Sintang.', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Tracking Events for IMP-PNK-2026-0003 (Singapura Udara - Delivered)
INSERT INTO public.imp_tracking_events (id, shipment_id, status, title, location, description, event_time) VALUES
  ('33333333-3333-4333-8333-333333330301', '22222222-2222-4222-8222-222222222203', 'order_confirmed', 'Booking Pengiriman Udara Disetujui', 'Pontianak, Kalbar', 'Instruksi pengiriman sparepart dari Singapura diterbitkan.', NOW() - INTERVAL '6 days'),
  ('33333333-3333-4333-8333-333333330302', '22222222-2222-4222-8222-222222222203', 'received_origin_warehouse', 'Diterima di Gudang Tuas Singapura', 'Tuas, Singapura', '1 koli diterima dari supplier, berat aktual 4.2 kg.', NOW() - INTERVAL '5 days'),
  ('33333333-3333-4333-8333-333333330303', '22222222-2222-4222-8222-222222222203', 'in_transit', 'Diberangkatkan via Kargo Udara', 'Changi Airfreight Centre', 'Paket masuk jadwal penerbangan kargo ekspres.', NOW() - INTERVAL '4 days'),
  ('33333333-3333-4333-8333-333333330304', '22222222-2222-4222-8222-222222222203', 'customs_clearance', 'Proses Bea Cukai Selesai', 'Bandara Supadio / Hub Clearance', 'Clearance selesai tanpa kendala.', NOW() - INTERVAL '3 days'),
  ('33333333-3333-4333-8333-333333330305', '22222222-2222-4222-8222-222222222203', 'arrived_pontianak', 'Tiba di Gudang Pontianak', 'Pontianak, Kalbar', 'Pembayaran lunas terverifikasi, disiapkan kurir dalam kota.', NOW() - INTERVAL '2 days' - INTERVAL '4 hours'),
  ('33333333-3333-4333-8333-333333330306', '22222222-2222-4222-8222-222222222203', 'delivered', 'Paket Diterima Customer', 'Pontianak Selatan', 'Diterima langsung oleh teknisi Bengkel Diesel Khatulistiwa dalam kondisi baik.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Reload PostgREST schema cache so all new imp_* tables are immediately exposed via REST API
NOTIFY pgrst, 'reload schema';
