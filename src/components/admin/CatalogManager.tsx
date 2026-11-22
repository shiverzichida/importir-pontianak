'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { formatDateOnly, formatIdr, formatNumberId } from '@/lib/format';
import type {
  CargoCategory,
  CatalogCategory,
  CatalogProduct,
  LclBatch,
  PublicConfig,
  ShipmentScale,
} from '@/lib/types';

const CATEGORY_OPTIONS: Array<{ value: CatalogCategory; label: string }> = [
  { value: 'kopi_fb', label: 'Alat Kopi & Kemasan F&B' },
  { value: 'walet', label: 'Peralatan Walet' },
  { value: 'otomotif', label: 'Lampu LED & Otomotif' },
  { value: 'bangunan', label: 'Bangunan, WPC & Sanitary' },
  { value: 'fashion', label: 'Fashion & Aksesori Yiwu' },
  { value: 'grooming', label: 'Barbershop & Beauty Tools' },
  { value: 'industri_kebun', label: 'Sawit, Kebun & Solar' },
  { value: 'rumah_tangga', label: 'Rumah Tangga Grosir' },
];

const SCALE_LABELS: Record<ShipmentScale, string> = {
  lcl: 'LCL Gabungan',
  fcl: '1 Kontainer (FCL)',
  lcl_fcl: 'LCL & FCL',
};

interface FormState {
  title: string;
  category: CatalogCategory;
  cargo_category: CargoCategory;
  shipment_scale: ShipmentScale;
  origin_hub: string;
  image_url: string;
  supplier_platform: string;
  supplier_url: string;
  secondary_url: string;
  mandarin_keyword: string;
  price_rmb_min: string;
  price_rmb_max: string;
  unit_label: string;
  moq_note: string;
  estimated_cbm_note: string;
  est_landed_idr_min: string;
  est_landed_idr_max: string;
  est_sell_idr_min: string;
  est_sell_idr_max: string;
  margin_note: string;
  why_pontianak: string;
  lcl_tip: string;
  sort_order: string;
  is_featured: boolean;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  title: '',
  category: 'kopi_fb',
  cargo_category: 'general',
  shipment_scale: 'lcl',
  origin_hub: 'Guangzhou / Yiwu',
  image_url: '',
  supplier_platform: '1688.com',
  supplier_url: '',
  secondary_url: '',
  mandarin_keyword: '',
  price_rmb_min: '15',
  price_rmb_max: '45',
  unit_label: 'pcs',
  moq_note: 'Min. 20 pcs',
  estimated_cbm_note: 'Muat padat mulai 0,15 CBM (bisa gabung LCL)',
  est_landed_idr_min: '55000',
  est_landed_idr_max: '165000',
  est_sell_idr_min: '140000',
  est_sell_idr_max: '350000',
  margin_note: '100% - 200%',
  why_pontianak: '',
  lcl_tip: '',
  sort_order: '10',
  is_featured: false,
  is_active: true,
};

function productToForm(p: CatalogProduct): FormState {
  return {
    title: p.title,
    category: p.category,
    cargo_category: p.cargo_category,
    shipment_scale: p.shipment_scale,
    origin_hub: p.origin_hub,
    image_url: p.image_url,
    supplier_platform: p.supplier_platform,
    supplier_url: p.supplier_url,
    secondary_url: p.secondary_url || '',
    mandarin_keyword: p.mandarin_keyword || '',
    price_rmb_min: String(p.price_rmb_min),
    price_rmb_max: String(p.price_rmb_max),
    unit_label: p.unit_label,
    moq_note: p.moq_note,
    estimated_cbm_note: p.estimated_cbm_note,
    est_landed_idr_min: String(p.est_landed_idr_min),
    est_landed_idr_max: String(p.est_landed_idr_max),
    est_sell_idr_min: String(p.est_sell_idr_min),
    est_sell_idr_max: String(p.est_sell_idr_max),
    margin_note: p.margin_note,
    why_pontianak: p.why_pontianak,
    lcl_tip: p.lcl_tip || '',
    sort_order: String(p.sort_order),
    is_featured: p.is_featured,
    is_active: p.is_active,
  };
}

export default function CatalogManager() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [rmbRate, setRmbRate] = useState<number>(2750);
  const [openBatch, setOpenBatch] = useState<LclBatch | null>(null);
  const [copiedBroadcastId, setCopiedBroadcastId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/public-config', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/lcl-batches', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([cfgData, batchData]) => {
        const cfg = cfgData as Partial<PublicConfig>;
        if (cfg.settings?.rate_rmb_idr) {
          setRmbRate(cfg.settings.rate_rmb_idr);
        }
        const batches = (batchData as { batches?: LclBatch[] })?.batches ?? [];
        const chinaOpen =
          batches.find(
            (b) =>
              b.origin_country === 'china' &&
              (b.status === 'open' || b.status === 'almost_full')
          ) || batches[0] || null;
        setOpenBatch(chinaOpen);
      })
      .catch(() => {
        // Keep defaults if auxiliary fetch fails
      });
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (search.trim()) params.set('q', search.trim());

      const res = await fetch(`/api/admin/catalog?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as {
        products?: CatalogProduct[];
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memuat katalog produk.');
      } else {
        setProducts(data.products ?? []);
      }
    } catch {
      setErrorMsg('Koneksi bermasalah saat memuat katalog produk.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (product: CatalogProduct) => {
    setEditingId(product.id);
    setForm(productToForm(product));
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || 'Gagal mengunggah foto produk.');
      } else {
        setForm((prev) => ({ ...prev, image_url: data.url || '' }));
      }
    } catch {
      setErrorMsg('Gagal mengunggah foto ke server.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingModal(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const payload = {
        ...form,
        price_rmb_min: Number(form.price_rmb_min) || 0,
        price_rmb_max: Number(form.price_rmb_max) || 0,
        est_landed_idr_min: Number(form.est_landed_idr_min) || 0,
        est_landed_idr_max: Number(form.est_landed_idr_max) || 0,
        est_sell_idr_min: Number(form.est_sell_idr_min) || 0,
        est_sell_idr_max: Number(form.est_sell_idr_max) || 0,
        sort_order: Number(form.sort_order) || 0,
      };

      const url = editingId
        ? `/api/admin/catalog/${editingId}`
        : '/api/admin/catalog';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal menyimpan produk katalog.');
      } else {
        setModalOpen(false);
        setStatusMsg(
          editingId
            ? 'Produk katalog berhasil diperbarui.'
            : 'Produk baru berhasil ditambahkan ke katalog.'
        );
        await loadProducts();
      }
    } catch {
      setErrorMsg('Koneksi bermasalah saat menyimpan produk.');
    } finally {
      setSavingModal(false);
    }
  };

  const toggleFlag = async (
    product: CatalogProduct,
    field: 'is_active' | 'is_featured'
  ) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/catalog/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !product[field] }),
      });
      if (res.ok) {
        await loadProducts();
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error || 'Gagal mengubah status produk.');
      }
    } catch {
      setErrorMsg('Gagal mengubah status produk.');
    }
  };

  const deleteProduct = async (product: CatalogProduct) => {
    if (
      !window.confirm(
        `Hapus "${product.title}" dari katalog publik secara permanen?`
      )
    ) {
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/catalog/${product.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMsg(`Produk "${product.title}" telah dihapus.`);
        await loadProducts();
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error || 'Gagal menghapus produk.');
      }
    } catch {
      setErrorMsg('Gagal menghapus produk.');
    }
  };

  const copyBroadcastWa = async (product: CatalogProduct) => {
    const siteOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://importir-pontianak.43-173-33-53.sslip.io';
    const rmbMin = Number(product.price_rmb_min);
    const rmbMax = Number(product.price_rmb_max);
    const rmbText =
      rmbMax > rmbMin
        ? `RMB ${formatNumberId(rmbMin, 2)}-${formatNumberId(rmbMax, 2)}`
        : `RMB ${formatNumberId(rmbMin, 2)}`;
    const idrMin = Math.round(rmbMin * rmbRate);
    const idrMax = Math.round(rmbMax * rmbRate);
    const idrText =
      idrMax > idrMin
        ? `${formatIdr(idrMin)}-${formatIdr(idrMax)}`
        : formatIdr(idrMin);

    const remainingCbm = openBatch
      ? Math.max(
          0,
          Number(
            (
              Number(openBatch.capacity_cbm) - Number(openBatch.filled_cbm)
            ).toFixed(1)
          )
        )
      : 0;

    const lines = [
      `*REKOMENDASI PRODUK IMPOR PONTIANAK (LCL KONTAINER)*`,
      ``,
      `*${product.title}*`,
      `Sentra Asal: ${product.origin_hub}`,
      `Harga Pabrik: *${rmbText} / ${product.unit_label}* (~${idrText})`,
      `Est. Modal Sampai PNK: ${formatIdr(product.est_landed_idr_min)}${
        product.est_landed_idr_max > product.est_landed_idr_min
          ? ` - ${formatIdr(product.est_landed_idr_max)}`
          : ''
      }`,
      `Pasaran Jual Kalbar: *${formatIdr(product.est_sell_idr_min)} - ${formatIdr(product.est_sell_idr_max)}* (Margin ${product.margin_note})`,
      `MOQ & Muat: ${product.moq_note} · ${product.estimated_cbm_note}`,
      openBatch
        ? `Kloter LCL Terdekat: *${openBatch.batch_code}* (Cutoff ${formatDateOnly(openBatch.cutoff_date)}, sisa slot ${formatNumberId(remainingCbm, 1)} CBM)`
        : '',
      ``,
      `Lihat detail foto, link 1688/Alibaba & ikut gabung kontainer di sini:`,
      `${siteOrigin}/katalog/${product.slug}`,
    ].filter((line, idx, arr) => line !== '' || arr[idx - 1] !== '');

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedBroadcastId(product.id);
      setStatusMsg(`Caption WhatsApp untuk "${product.title}" berhasil disalin.`);
      setTimeout(() => setCopiedBroadcastId(null), 2200);
    } catch {
      setErrorMsg('Browser tidak mengizinkan akses clipboard.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            Katalog Produk &amp; LCL Kontainer
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tambah atau perbarui rekomendasi barang murah dari China untuk grup
            WhatsApp importir Pontianak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProducts}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-navy font-bold px-3.5 text-xs"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-4 text-xs shadow-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Produk Katalog
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white border border-slate-300 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul produk, keyword Mandarin, atau alasan Pontianak..."
            className="w-full min-h-[42px] rounded-lg border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-navy"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-navy"
        >
          <option value="all">Semua Kategori</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {statusMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 text-sm font-medium text-emerald-900">
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-300 px-4 py-3 text-sm font-medium text-rose-900"
        >
          {errorMsg}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="rounded-xl bg-white border border-slate-300 p-10 text-center text-sm text-slate-600 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-teal" aria-hidden="true" />
          Memuat daftar katalog produk...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl bg-white border border-slate-300 p-10 text-center text-sm text-slate-600">
          Belum ada produk pada filter ini. Klik &quot;Tambah Produk Katalog&quot;
          untuk menambahkan rekomendasi baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-xl bg-white border p-4 flex flex-col sm:flex-row gap-4 transition-colors ${
                product.is_active ? 'border-slate-300' : 'border-slate-200 opacity-75'
              }`}
            >
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full sm:w-36 h-28 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-navy text-white text-[11px] font-bold">
                    {CATEGORY_OPTIONS.find((c) => c.value === product.category)
                      ?.label || product.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-navy text-[11px] font-bold">
                    {SCALE_LABELS[product.shipment_scale]}
                  </span>
                  {!product.is_active && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                      Nonaktif
                    </span>
                  )}
                </div>

                <h2 className="font-bold text-navy text-sm leading-snug">
                  {product.title}
                </h2>

                <div className="text-xs font-mono text-slate-700 space-y-0.5">
                  <div>
                    Pabrik: RMB {formatNumberId(Number(product.price_rmb_min), 2)} -{' '}
                    {formatNumberId(Number(product.price_rmb_max), 2)} /{' '}
                    {product.unit_label}
                  </div>
                  <div>
                    Jual Kalbar: {formatIdr(product.est_sell_idr_min)} -{' '}
                    {formatIdr(product.est_sell_idr_max)} ({product.margin_note})
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyBroadcastWa(product)}
                    className="min-h-[34px] inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold bg-wa hover:bg-wa-dark text-white shadow-sm"
                  >
                    {copiedBroadcastId === product.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Caption WA Tersalin!
                      </>
                    ) : (
                      <>
                        <MessageSquare
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Salin Broadcast WA
                      </>
                    )}
                  </button>

                  <Link
                    href={`/katalog/${product.slug}`}
                    target="_blank"
                    className="min-h-[34px] inline-flex items-center gap-1 px-2.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-navy border border-slate-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    Lihat Halaman
                  </Link>

                  <a
                    href={product.supplier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-dark hover:underline mr-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    {product.supplier_platform}
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleFlag(product, 'is_featured')}
                    className={`min-h-[34px] inline-flex items-center gap-1 px-2.5 rounded-lg text-xs font-bold border ${
                      product.is_featured
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    {product.is_featured ? 'Utama' : 'Set Utama'}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFlag(product, 'is_active')}
                    className={`min-h-[34px] px-2.5 rounded-lg text-xs font-bold border ${
                      product.is_active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {product.is_active ? 'Aktif' : 'Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="min-h-[34px] inline-flex items-center gap-1 px-2.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-navy hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(product)}
                    className="min-h-[34px] inline-flex items-center gap-1 px-2.5 rounded-lg text-xs font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50"
                    aria-label={`Hapus ${product.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 p-4 overflow-y-auto flex items-start justify-center"
        >
          <div className="bg-white rounded-2xl border border-slate-300 shadow-xl w-full max-w-3xl my-6 overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between gap-3">
              <h2 id="catalog-modal-title" className="font-bold text-base">
                {editingId
                  ? 'Edit Produk Katalog'
                  : 'Tambah Produk Katalog Impor China'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg hover:bg-white/10"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="cth: Mesin Press Cup Otomatis / Lampu LED Sorot 24V"
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Kategori Katalog *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as CatalogCategory,
                      })
                    }
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Skala Pengiriman *
                  </label>
                  <select
                    value={form.shipment_scale}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shipment_scale: e.target.value as ShipmentScale,
                      })
                    }
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  >
                    <option value="lcl">Bisa LCL Gabungan (Mulai 0,1 CBM)</option>
                    <option value="lcl_fcl">Fleksibel (LCL &amp; 1 Kontainer FCL)</option>
                    <option value="fcl">Rekomendasi 1 Kontainer (FCL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Kategori Tarif Ongkir
                  </label>
                  <select
                    value={form.cargo_category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cargo_category: e.target.value as CargoCategory,
                      })
                    }
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  >
                    <option value="general">General Cargo</option>
                    <option value="fashion">Fashion &amp; Aksesoris</option>
                    <option value="elektronik">Elektronik / Mesin</option>
                    <option value="khusus">Lartas / Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Sentra Asal China
                  </label>
                  <input
                    type="text"
                    value={form.origin_hub}
                    onChange={(e) =>
                      setForm({ ...form, origin_hub: e.target.value })
                    }
                    placeholder="Guangzhou / Yiwu"
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
              </div>

              {/* Image Upload or URL */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-navy">
                    Foto Produk * (Unggah atau masukkan URL `/images/...`)
                  </span>
                  <label className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg bg-navy text-white px-3 text-xs font-bold cursor-pointer hover:bg-navy-light">
                    {uploadingPhoto ? (
                      <>
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                        Upload Foto (JPG/PNG/WebP)
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {form.image_url && (
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-16 w-20 rounded-lg object-cover border border-slate-300 bg-white shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    required
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    placeholder="/api/uploads/... atau /images/catalog/..."
                    className="flex-1 min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-navy"
                  />
                </div>
              </div>

              {/* Links & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Platform Supplier Utama
                  </label>
                  <input
                    type="text"
                    value={form.supplier_platform}
                    onChange={(e) =>
                      setForm({ ...form, supplier_platform: e.target.value })
                    }
                    placeholder="1688.com"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Kata Kunci Mandarin (1688)
                  </label>
                  <input
                    type="text"
                    value={form.mandarin_keyword}
                    onChange={(e) =>
                      setForm({ ...form, mandarin_keyword: e.target.value })
                    }
                    placeholder="cth: 手摇磨豆机 咖啡电子秤"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1">
                    Link Supplier Utama (1688 / Alibaba) *
                  </label>
                  <input
                    type="url"
                    required
                    value={form.supplier_url}
                    onChange={(e) =>
                      setForm({ ...form, supplier_url: e.target.value })
                    }
                    placeholder="https://s.1688.com/selloffer/offer_search.htm?keywords=..."
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-navy"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1">
                    Link Pembanding Alibaba (Opsional)
                  </label>
                  <input
                    type="url"
                    value={form.secondary_url}
                    onChange={(e) =>
                      setForm({ ...form, secondary_url: e.target.value })
                    }
                    placeholder="https://www.alibaba.com/trade/search?SearchText=..."
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-navy"
                  />
                </div>
              </div>

              {/* Pricing & Margin */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    RMB Min
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_rmb_min}
                    onChange={(e) =>
                      setForm({ ...form, price_rmb_min: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    RMB Max
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_rmb_max}
                    onChange={(e) =>
                      setForm({ ...form, price_rmb_max: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={form.unit_label}
                    onChange={(e) =>
                      setForm({ ...form, unit_label: e.target.value })
                    }
                    placeholder="pcs / set / m2"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Margin Kotor
                  </label>
                  <input
                    type="text"
                    value={form.margin_note}
                    onChange={(e) =>
                      setForm({ ...form, margin_note: e.target.value })
                    }
                    placeholder="100% - 200%"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Est. Landed Min (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.est_landed_idr_min}
                    onChange={(e) =>
                      setForm({ ...form, est_landed_idr_min: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Est. Landed Max (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.est_landed_idr_max}
                    onChange={(e) =>
                      setForm({ ...form, est_landed_idr_max: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Pasaran Jual Min (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.est_sell_idr_min}
                    onChange={(e) =>
                      setForm({ ...form, est_sell_idr_min: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Pasaran Jual Max (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.est_sell_idr_max}
                    onChange={(e) =>
                      setForm({ ...form, est_sell_idr_max: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Catatan MOQ Supplier
                  </label>
                  <input
                    type="text"
                    value={form.moq_note}
                    onChange={(e) =>
                      setForm({ ...form, moq_note: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Catatan Volume / Kubikasi CBM
                  </label>
                  <input
                    type="text"
                    value={form.estimated_cbm_note}
                    onChange={(e) =>
                      setForm({ ...form, estimated_cbm_note: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1">
                    Alasan Peluang di Pontianak &amp; Kalbar *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.why_pontianak}
                    onChange={(e) =>
                      setForm({ ...form, why_pontianak: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1">
                    Tips Gabung Kontainer LCL / QC (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={form.lcl_tip}
                    onChange={(e) =>
                      setForm({ ...form, lcl_tip: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-5">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-navy">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) =>
                        setForm({ ...form, is_featured: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-teal"
                    />
                    Tampilkan di Beranda (Utama)
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-navy">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-teal"
                    />
                    Aktif di Katalog Publik
                  </label>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-navy">
                    <span>Urutan:</span>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm({ ...form, sort_order: e.target.value })
                      }
                      className="w-16 min-h-[34px] rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono text-navy"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="min-h-[42px] px-4 rounded-lg border border-slate-300 text-xs font-bold text-navy hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingModal || uploadingPhoto}
                    className="min-h-[42px] inline-flex items-center gap-2 px-5 rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-60 text-white text-xs font-bold"
                  >
                    {savingModal && (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {editingId ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
