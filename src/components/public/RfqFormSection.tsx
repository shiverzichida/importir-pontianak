'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  FileText,
  ImagePlus,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { formatIdr } from '@/lib/format';
import type {
  CalculatorPrefill,
  CargoCategory,
  CurrencyCode,
  KalbarDestination,
  OriginCountry,
  RfqOrder,
  RfqShippingMethod,
  ServiceType,
} from '@/lib/types';

interface RfqFormSectionProps {
  destinations: KalbarDestination[];
  prefill: CalculatorPrefill | null;
  serviceTrigger: { service: ServiceType; nonce: number } | null;
  onClearPrefill: () => void;
}

export default function RfqFormSection({
  destinations,
  prefill,
  serviceTrigger,
  onClearPrefill,
}: RfqFormSectionProps) {
  const [serviceType, setServiceType] = useState<ServiceType>('titip_beli');
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [destinationCity, setDestinationCity] = useState(
    destinations[0]?.city_name || 'Pontianak (Ambil di Gudang)'
  );
  const [originCountry, setOriginCountry] = useState<OriginCountry>('china');
  const [shippingMethod, setShippingMethod] = useState<RfqShippingMethod>('laut');
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('general');
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('RMB');
  const [estimatedGoodsValue, setEstimatedGoodsValue] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState('');
  const [estimatedCbm, setEstimatedCbm] = useState('');
  const [estimatedTotalIdr, setEstimatedTotalIdr] = useState<number | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    order: RfqOrder;
    whatsapp_url: string;
  } | null>(null);
  const [copiedRfqCode, setCopiedRfqCode] = useState(false);

  useEffect(() => {
    if (!serviceTrigger) return;
    setServiceType(serviceTrigger.service);
    setShippingMethod((prev) => {
      if (serviceTrigger.service === 'transfer_valas') return 'transfer_only';
      return prev === 'transfer_only' ? 'laut' : prev;
    });
  }, [serviceTrigger]);

  useEffect(() => {
    if (!prefill) return;
    setOriginCountry(prefill.origin_country);
    setShippingMethod(prefill.shipping_method);
    setCargoCategory(prefill.cargo_category);
    setDestinationCity(prefill.destination_city);
    setCurrency(prefill.currency);
    if (prefill.estimated_goods_value !== undefined) {
      setEstimatedGoodsValue(String(prefill.estimated_goods_value));
    }
    if (prefill.quantity !== undefined) {
      setQuantity(String(prefill.quantity));
    }
    if (prefill.estimated_weight_kg !== undefined) {
      setEstimatedWeightKg(String(prefill.estimated_weight_kg));
    }
    if (prefill.estimated_cbm !== undefined) {
      setEstimatedCbm(String(prefill.estimated_cbm));
    }
    setEstimatedTotalIdr(prefill.estimated_total_idr);
    setCustomerNotes((prev) =>
      prev ? prev : prefill.summary_note
    );
  }, [prefill]);

  const handleOriginChange = (origin: OriginCountry) => {
    setOriginCountry(origin);
    setCurrency(
      origin === 'china' ? 'RMB' : origin === 'malaysia' ? 'MYR' : 'SGD'
    );
    if (origin === 'malaysia' && shippingMethod === 'laut') {
      setShippingMethod('darat');
    } else if (origin !== 'malaysia' && shippingMethod === 'darat') {
      setShippingMethod('laut');
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setErrorMsg(data.error || 'Gagal mengunggah foto.');
      } else {
        setPhotoUrl(data.url);
      }
    } catch {
      setErrorMsg('Gagal mengunggah foto produk.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: serviceType,
          customer_name: customerName,
          customer_whatsapp: customerWhatsapp,
          company_name: companyName || null,
          destination_city: destinationCity,
          origin_country: originCountry,
          shipping_method:
            serviceType === 'transfer_valas' ? 'transfer_only' : shippingMethod,
          cargo_category: cargoCategory,
          product_url: productUrl || null,
          product_name: productName,
          product_photo_url: photoUrl,
          currency,
          estimated_goods_value: estimatedGoodsValue
            ? Number(estimatedGoodsValue)
            : null,
          quantity: quantity ? Number(quantity) : 1,
          estimated_weight_kg: estimatedWeightKg
            ? Number(estimatedWeightKg)
            : null,
          estimated_cbm: estimatedCbm ? Number(estimatedCbm) : null,
          estimated_total_idr: estimatedTotalIdr,
          customer_notes: customerNotes || null,
        }),
      });

      const data = (await res.json()) as {
        order?: RfqOrder;
        whatsapp_url?: string;
        error?: string;
      };

      if (!res.ok || !data.order || !data.whatsapp_url) {
        setErrorMsg(data.error || 'Gagal mengirim pengajuan RFQ.');
      } else {
        setSubmittedResult({
          order: data.order,
          whatsapp_url: data.whatsapp_url,
        });
      }
    } catch {
      setErrorMsg('Koneksi bermasalah. Silakan coba beberapa saat lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setProductUrl('');
    setProductName('');
    setPhotoUrl(null);
    setCustomerNotes('');
    setEstimatedTotalIdr(null);
    onClearPrefill();
  };

  return (
    <section id="rfq" className="py-16 lg:py-20 bg-white border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3 border border-teal-200">
            <FileText className="h-3.5 w-3.5" />
            Request For Quotation (RFQ) & Order Impor
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Ajukan Titip Beli, Booking Gudang, atau Transfer RMB/MYR
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Tempelkan tautan produk (1688, Taobao, Alibaba, Shopee MY) atau
            unggah foto barang. Data otomatis tercatat dan langsung terhubung ke
            WhatsApp tim Pontianak kami.
          </p>
        </div>

        {submittedResult ? (
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 p-6 sm:p-10 text-center space-y-5 shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Pengajuan Berhasil Disimpan
              </span>
              <h3 className="text-2xl font-extrabold text-navy mt-1">
                Terima Kasih, {submittedResult.order.customer_name}!
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Kode RFQ Anda telah tercatat di sistem kami. Klik tombol
                WhatsApp di bawah untuk langsung memverifikasi penawaran dengan
                admin.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-xl bg-white border border-emerald-200 px-5 py-3 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Kode RFQ:</span>
              <span className="font-mono font-extrabold text-lg text-navy">
                {submittedResult.order.rfq_code}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(submittedResult.order.rfq_code);
                  setCopiedRfqCode(true);
                  setTimeout(() => setCopiedRfqCode(false), 2000);
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedRfqCode ? 'Disalin' : 'Salin'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={submittedResult.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 text-sm shadow-md transition"
              >
                <MessageCircle className="h-5 w-5" />
                Kirim Pengajuan ke WhatsApp Admin
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3.5 text-sm transition"
              >
                Buat Pengajuan Baru
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-8 space-y-6 shadow-sm"
          >
            {/* Service Tabs */}
            <div>
              <label className="block text-sm font-bold text-navy mb-2.5">
                Pilih Jenis Layanan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    {
                      id: 'titip_beli',
                      title: 'Titip Beli / Sourcing',
                      desc: 'Kami belikan dari 1688, Taobao, Alibaba & QC gudang.',
                    },
                    {
                      id: 'forwarder',
                      title: 'Forwarder (Kirim Saja)',
                      desc: 'Anda sudah punya supplier, kirim ke gudang kami.',
                    },
                    {
                      id: 'transfer_valas',
                      title: 'Jasa Transfer RMB / MYR',
                      desc: 'Titip bayar invoice supplier via Alipay / Bank.',
                    },
                  ] as const
                ).map((tab) => {
                  const active = serviceType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setServiceType(tab.id);
                        if (tab.id === 'transfer_valas') {
                          setShippingMethod('transfer_only');
                        } else if (shippingMethod === 'transfer_only') {
                          setShippingMethod(
                            originCountry === 'malaysia' ? 'darat' : 'laut'
                          );
                        }
                      }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        active
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <div className="font-bold text-sm">{tab.title}</div>
                      <div
                        className={`text-xs mt-1 ${
                          active ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {tab.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {prefill && (
              <div className="flex items-start justify-between gap-3 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-xs text-teal-900">
                <div>
                  <strong className="block">
                    Estimasi dari Kalkulator Diterapkan:
                  </strong>
                  <span>
                    {prefill.summary_note} (Estimasi Total:{' '}
                    <strong>{formatIdr(prefill.estimated_total_idr)}</strong>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClearPrefill();
                    setEstimatedTotalIdr(null);
                  }}
                  className="text-teal-700 hover:text-teal-900 shrink-0"
                  title="Hapus prefill"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="cth: Budi Santoso"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="cth: 081256789012"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Nama Toko / Usaha (Opsional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="cth: Toko Borneo Jaya"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Route & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Negara Asal *
                </label>
                <select
                  value={originCountry}
                  onChange={(e) => handleOriginChange(e.target.value as OriginCountry)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                >
                  <option value="china">China (Guangzhou / Yiwu)</option>
                  <option value="malaysia">Malaysia / Kuching</option>
                  <option value="singapura">Singapura</option>
                </select>
              </div>

              {serviceType !== 'transfer_valas' && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Jalur Pengiriman *
                  </label>
                  <select
                    value={shippingMethod}
                    onChange={(e) =>
                      setShippingMethod(e.target.value as RfqShippingMethod)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                  >
                    <option value="udara">Jalur Udara (Cepat)</option>
                    <option value="laut">Jalur Laut LCL (Hemat CBM)</option>
                    {originCountry === 'malaysia' && (
                      <option value="darat">Jalur Darat Entikong / Aruk</option>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Kategori Barang
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                >
                  <option value="general">General Cargo</option>
                  <option value="fashion">Fashion & Aksesoris</option>
                  <option value="elektronik">Elektronik / Mesin</option>
                  <option value="khusus">Lartas / Khusus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Kota Tujuan Kalbar *
                </label>
                <select
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.city_name}>
                      {d.city_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Nama Barang / Deskripsi Order *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="cth: Mesin Press Cup Otomatis / Tas Wanita 50 pcs"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Link Produk (1688 / Taobao / Alibaba / Shopee MY)
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://detail.1688.com/offer/..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Numerical Estimates */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Mata Uang
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                >
                  <option value="RMB">RMB (Yuan)</option>
                  <option value="MYR">MYR (Ringgit)</option>
                  <option value="SGD">SGD</option>
                  <option value="IDR">IDR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Nilai Barang / Transfer
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedGoodsValue}
                  onChange={(e) => setEstimatedGoodsValue(e.target.value)}
                  placeholder="cth: 1500"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Qty (Pcs)
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Perkiraan Berat (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={estimatedWeightKg}
                  onChange={(e) => setEstimatedWeightKg(e.target.value)}
                  placeholder="opsional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Perkiraan Vol (CBM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedCbm}
                  onChange={(e) => setEstimatedCbm(e.target.value)}
                  placeholder="opsional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Photo Upload & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Unggah Foto Produk / Invoice (Opsional, Maks 3 MB)
                </label>
                {photoUrl ? (
                  <div className="relative rounded-xl border border-slate-300 bg-white p-2 flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Preview Produk"
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-emerald-700">
                        Foto terunggah siap dikirim
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {photoUrl}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Hapus foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-teal-500 px-4 py-5 cursor-pointer transition">
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                        <span className="text-xs font-semibold text-slate-600">
                          Mengunggah foto...
                        </span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">
                          Pilih Foto JPG / PNG / WebP (Maks 3 MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Catatan Tambahan (Varian, Resi Lokal, atau Permintaan Khusus)
                </label>
                <textarea
                  rows={3}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Contoh: Warna hitam 20 pcs, putih 30 pcs. Mohon QC sebelum berangkat."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">
                Pengajuan tidak dipungut biaya. Anda dapat meninjau penawaran
                resmi all-in sebelum melakukan pembayaran DP.
              </p>
              <button
                type="submit"
                disabled={submitting || uploadingPhoto}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-60 text-white font-bold px-7 py-3.5 text-sm shadow-md transition shrink-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengirim RFQ...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim Pengajuan & Lanjut WhatsApp
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
