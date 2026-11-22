-- Customer Registration, Login & Member Portal Schema Migration
-- Coexists cleanly in shared public schema under imp_* prefix

CREATE TABLE IF NOT EXISTS public.imp_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT UNIQUE NOT NULL,
  marking_code_base TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  company_name TEXT,
  default_destination_city TEXT NOT NULL DEFAULT 'Pontianak (Ambil di Gudang)',
  address_detail TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  admin_notes TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imp_customers_whatsapp
  ON public.imp_customers(whatsapp);

CREATE INDEX IF NOT EXISTS idx_imp_customers_created_at
  ON public.imp_customers(created_at DESC);

ALTER TABLE public.imp_customers ENABLE ROW LEVEL SECURITY;

-- Link RFQ Orders to Customer Member & Optional LCL Batch Code
ALTER TABLE public.imp_rfq_orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.imp_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lcl_batch_code TEXT;

CREATE INDEX IF NOT EXISTS idx_imp_rfq_orders_customer_id
  ON public.imp_rfq_orders(customer_id, created_at DESC);

-- Link Shipments to Customer Member & Support Payment Proof Upload
ALTER TABLE public.imp_shipments
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.imp_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_note TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_imp_shipments_customer_id
  ON public.imp_shipments(customer_id, updated_at DESC);

-- Reload PostgREST schema cache so new table & columns are immediately exposed
NOTIFY pgrst, 'reload schema';
