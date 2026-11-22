import type { CalculatorPrefill, CatalogProduct, LclBatch } from './types';

export const PENDING_ORDER_PREFILL_KEY = 'imp_pending_order_prefill';

export function catalogProductToPrefill(
  product: CatalogProduct,
  defaultDest = 'Pontianak (Ambil di Gudang)'
): CalculatorPrefill {
  return {
    service_type: 'titip_beli',
    origin_country: 'china',
    shipping_method: 'laut',
    cargo_category: product.cargo_category,
    destination_city: defaultDest,
    currency: 'RMB',
    product_name: product.title,
    product_url: product.supplier_url,
    estimated_goods_value:
      Number(product.price_rmb_min) > 0
        ? Number(product.price_rmb_min)
        : undefined,
    estimated_total_idr: 0,
    summary_note: `Katalog LCL/FCL (${product.shipment_scale.toUpperCase()}): ${product.title} · ${product.estimated_cbm_note}`,
  };
}

export function lclBatchToPrefill(
  batch: LclBatch,
  defaultDest = 'Pontianak (Ambil di Gudang)'
): CalculatorPrefill {
  const remaining = Math.max(
    0,
    Number((Number(batch.capacity_cbm) - Number(batch.filled_cbm)).toFixed(2))
  );
  return {
    service_type: 'forwarder',
    origin_country: batch.origin_country,
    shipping_method: batch.shipping_method,
    cargo_category: 'general',
    destination_city: defaultDest,
    currency:
      batch.origin_country === 'china'
        ? 'RMB'
        : batch.origin_country === 'malaysia'
          ? 'MYR'
          : 'SGD',
    estimated_cbm: Number(batch.min_slot_cbm) || 0.1,
    estimated_total_idr: 0,
    lcl_batch_code: batch.batch_code,
    summary_note: `Booking Slot Kloter ${batch.batch_code} (${batch.title}) · Cutoff ${batch.cutoff_date} · Sisa slot ${remaining} CBM`,
  };
}

export function savePendingOrderPrefill(prefill: CalculatorPrefill | null): void {
  if (typeof window === 'undefined' || !prefill) return;
  try {
    window.sessionStorage.setItem(
      PENDING_ORDER_PREFILL_KEY,
      JSON.stringify(prefill)
    );
  } catch {
    // Ignore storage errors
  }
}

export function consumePendingOrderPrefill(): CalculatorPrefill | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_ORDER_PREFILL_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(PENDING_ORDER_PREFILL_KEY);
    return JSON.parse(raw) as CalculatorPrefill;
  } catch {
    return null;
  }
}
