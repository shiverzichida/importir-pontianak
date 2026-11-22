export type OriginCountry = 'china' | 'malaysia' | 'singapura';
export type ShippingMethod = 'udara' | 'laut' | 'darat';
export type RfqShippingMethod = ShippingMethod | 'transfer_only';
export type CargoCategory = 'general' | 'fashion' | 'elektronik' | 'khusus';
export type RateUnit = 'kg' | 'cbm';
export type ServiceType = 'titip_beli' | 'forwarder' | 'transfer_valas';
export type CurrencyCode = 'RMB' | 'MYR' | 'SGD' | 'IDR';

export type RfqStatus =
  | 'baru'
  | 'diproses'
  | 'penawaran_dikirim'
  | 'disetujui'
  | 'dibatalkan';

export type PaymentStatus = 'belum_bayar' | 'dp' | 'lunas';

export type ShipmentStatus =
  | 'order_confirmed'
  | 'received_origin_warehouse'
  | 'in_transit'
  | 'customs_clearance'
  | 'arrived_pontianak'
  | 'out_for_delivery'
  | 'delivered';

export interface ImpSettingRow {
  key: string;
  value: string;
  label: string;
  updated_at: string;
}

export interface PublicSettings {
  rate_rmb_idr: number;
  rate_myr_idr: number;
  rate_sgd_idr: number;
  sourcing_fee_percent: number;
  sourcing_fee_min_idr: number;
  transfer_fee_idr: number;
  whatsapp_admin: string;
  company_name: string;
  company_address: string;
  operating_hours: string;
  fx_mode: 'auto' | 'manual';
  fx_spread_percent: number;
  fx_spread_flat_idr: number;
  fx_spot_rmb_idr: number;
  fx_spot_myr_idr: number;
  fx_spot_sgd_idr: number;
  fx_source: string;
  fx_last_synced_at: string | null;
}

export interface ShippingRate {
  id: string;
  origin_country: OriginCountry;
  origin_label: string;
  shipping_method: ShippingMethod;
  method_label: string;
  cargo_category: CargoCategory;
  category_label: string;
  unit: RateUnit;
  rate_idr: number;
  min_charge: number;
  eta_min_days: number;
  eta_max_days: number;
  volumetric_divisor: number;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface KalbarDestination {
  id: string;
  city_name: string;
  extra_fee_per_kg: number;
  extra_fee_flat: number;
  extra_eta_days: number;
  sort_order: number;
  is_active: boolean;
}

export interface WarehouseInfo {
  id: string;
  origin_country: OriginCountry;
  warehouse_name: string;
  city: string;
  address_local: string;
  address_english: string;
  recipient_format: string;
  phone: string;
  postal_code: string;
  supported_methods: string[];
  notes: string | null;
  is_active: boolean;
}

export interface RfqOrder {
  id: string;
  rfq_code: string;
  service_type: ServiceType;
  customer_name: string;
  customer_whatsapp: string;
  company_name: string | null;
  destination_city: string;
  origin_country: OriginCountry;
  shipping_method: RfqShippingMethod;
  cargo_category: CargoCategory;
  product_url: string | null;
  product_name: string;
  product_photo_url: string | null;
  currency: CurrencyCode;
  estimated_goods_value: number | null;
  quantity: number | null;
  estimated_weight_kg: number | null;
  estimated_cbm: number | null;
  estimated_total_idr: number | null;
  quoted_total_idr: number | null;
  customer_notes: string | null;
  admin_notes: string | null;
  status: RfqStatus;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  marking_code: string;
  supplier_tracking_no: string | null;
  rfq_id: string | null;
  customer_name: string;
  customer_whatsapp: string;
  origin_country: OriginCountry;
  shipping_method: ShippingMethod;
  cargo_category: CargoCategory;
  destination_city: string;
  item_summary: string;
  actual_weight_kg: number | null;
  actual_cbm: number | null;
  colli_count: number;
  invoice_amount_idr: number | null;
  payment_status: PaymentStatus;
  current_status: ShipmentStatus;
  estimated_arrival: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicShipment {
  id: string;
  tracking_number: string;
  marking_code: string;
  supplier_tracking_no: string | null;
  customer_name: string;
  origin_country: OriginCountry;
  shipping_method: ShippingMethod;
  cargo_category: CargoCategory;
  destination_city: string;
  item_summary: string;
  actual_weight_kg: number | null;
  actual_cbm: number | null;
  colli_count: number;
  invoice_amount_idr: number | null;
  payment_status: PaymentStatus;
  current_status: ShipmentStatus;
  estimated_arrival: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus | string;
  title: string;
  location: string;
  description: string | null;
  event_time: string;
  created_at: string;
}

export interface PublicConfig {
  settings: PublicSettings;
  rates: ShippingRate[];
  destinations: KalbarDestination[];
  warehouses: WarehouseInfo[];
}

export interface CalculatorPrefill {
  origin_country: OriginCountry;
  shipping_method: ShippingMethod;
  cargo_category: CargoCategory;
  destination_city: string;
  currency: CurrencyCode;
  estimated_goods_value?: number;
  quantity?: number;
  estimated_weight_kg?: number;
  estimated_cbm?: number;
  estimated_total_idr: number;
  summary_note: string;
  product_name?: string;
  product_url?: string;
  service_type?: ServiceType;
}

export type CatalogCategory =
  | 'kopi_fb'
  | 'walet'
  | 'otomotif'
  | 'fashion'
  | 'grooming'
  | 'bangunan'
  | 'industri_kebun'
  | 'rumah_tangga';

export type ShipmentScale = 'lcl' | 'fcl' | 'lcl_fcl';

export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  category: CatalogCategory;
  cargo_category: CargoCategory;
  shipment_scale: ShipmentScale;
  origin_hub: string;
  image_url: string;
  supplier_platform: string;
  supplier_url: string;
  secondary_url: string | null;
  mandarin_keyword: string | null;
  price_rmb_min: number;
  price_rmb_max: number;
  unit_label: string;
  moq_note: string;
  estimated_cbm_note: string;
  est_landed_idr_min: number;
  est_landed_idr_max: number;
  est_sell_idr_min: number;
  est_sell_idr_max: number;
  margin_note: string;
  why_pontianak: string;
  lcl_tip: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type LclBatchStatus =
  | 'open'
  | 'almost_full'
  | 'closed'
  | 'sailing'
  | 'arrived';

export interface LclBatch {
  id: string;
  batch_code: string;
  title: string;
  origin_country: OriginCountry;
  origin_warehouse: string;
  shipping_method: ShippingMethod;
  container_size: string;
  capacity_cbm: number;
  filled_cbm: number;
  min_slot_cbm: number;
  cutoff_date: string;
  etd_date: string | null;
  eta_date: string | null;
  status: LclBatchStatus;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminSessionUser {
  userId: string;
  email: string;
  name: string;
  role: string;
}
