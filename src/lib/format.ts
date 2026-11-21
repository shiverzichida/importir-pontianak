import type { Locale } from './i18n/types';
import type {
  CargoCategory,
  OriginCountry,
  PaymentStatus,
  RfqShippingMethod,
  RfqStatus,
  ServiceType,
  ShipmentStatus,
} from './types';

function toIntlLocale(locale: Locale = 'id'): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'zh') return 'zh-CN';
  return 'id-ID';
}

export function formatIdr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatNumberId(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || Number.isNaN(num)) return '-';
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDateWib(
  isoString: string | null | undefined,
  locale: Locale = 'id'
): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return (
    new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone: 'Asia/Pontianak',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date) + ' WIB'
  );
}

export function formatDateOnly(
  isoString: string | null | undefined,
  locale: Locale = 'id'
): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    timeZone: 'Asia/Pontianak',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function normalizeWaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWaPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function maskCustomerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Customer';
  // Keep business names intact (CV/PT/Toko/UD/Boutique/Bengkel), mask personal names lightly
  if (/^(cv|pt|ud|toko|tb|boutique|bengkel|warung|kios|mart)\b/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) return `${part[0]}*`;
      return `${part.slice(0, 2)}${'*'.repeat(Math.min(4, part.length - 2))}`;
    })
    .join(' ');
}

export const ORIGIN_LABELS: Record<OriginCountry, string> = {
  china: 'China (Guangzhou / Yiwu)',
  malaysia: 'Malaysia / Kuching',
  singapura: 'Singapura (Tuas / Changi)',
};

export const METHOD_LABELS: Record<RfqShippingMethod, string> = {
  udara: 'Jalur Udara',
  laut: 'Jalur Laut LCL',
  darat: 'Jalur Darat Lintas Batas',
  transfer_only: 'Transfer Valas Saja',
};

export const CATEGORY_LABELS: Record<CargoCategory, string> = {
  general: 'General Cargo',
  fashion: 'Fashion & Aksesoris',
  elektronik: 'Elektronik / Mesin Ringan',
  khusus: 'Barang Khusus / Lartas',
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  titip_beli: 'Titip Beli / Sourcing',
  forwarder: 'Forwarder (Kirim Saja)',
  transfer_valas: 'Jasa Transfer Valas (RMB/MYR/SGD)',
};

export const RFQ_STATUSES: Record<
  RfqStatus,
  { label: string; badgeClass: string }
> = {
  baru: {
    label: 'Baru Masuk',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  diproses: {
    label: 'Sedang Dicek Tim',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  penawaran_dikirim: {
    label: 'Penawaran Dikirim',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  disetujui: {
    label: 'Disetujui / Lanjut Order',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; badgeClass: string }
> = {
  belum_bayar: {
    label: 'Belum Bayar',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  dp: {
    label: 'DP / Sebagian',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  lunas: {
    label: 'Lunas',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};

export const SHIPMENT_STEPS: Array<{
  key: ShipmentStatus;
  shortLabel: string;
  label: string;
}> = [
  {
    key: 'order_confirmed',
    shortLabel: 'Konfirmasi',
    label: 'Order Dikonfirmasi',
  },
  {
    key: 'received_origin_warehouse',
    shortLabel: 'Gudang Asal',
    label: 'Diterima Gudang Asal',
  },
  {
    key: 'in_transit',
    shortLabel: 'Perjalanan',
    label: 'Dalam Pengiriman',
  },
  {
    key: 'customs_clearance',
    shortLabel: 'Bea Cukai',
    label: 'Proses Bea Cukai',
  },
  {
    key: 'arrived_pontianak',
    shortLabel: 'Gudang PNK',
    label: 'Tiba di Pontianak',
  },
  {
    key: 'delivered',
    shortLabel: 'Diterima',
    label: 'Selesai / Diterima',
  },
];

export const SHIPMENT_STATUS_META: Record<
  ShipmentStatus,
  { label: string; stepIndex: number; badgeClass: string }
> = {
  order_confirmed: {
    label: 'Order Dikonfirmasi',
    stepIndex: 0,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  received_origin_warehouse: {
    label: 'Diterima di Gudang Asal',
    stepIndex: 1,
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  in_transit: {
    label: 'Dalam Perjalanan ke Kalbar',
    stepIndex: 2,
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  customs_clearance: {
    label: 'Proses Kepabeanan / Lintas Batas',
    stepIndex: 3,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  arrived_pontianak: {
    label: 'Tiba di Gudang Pontianak',
    stepIndex: 4,
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  out_for_delivery: {
    label: 'Sedang Dikirim ke Alamat Tujuan',
    stepIndex: 4,
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  delivered: {
    label: 'Paket Diterima Customer',
    stepIndex: 5,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};
