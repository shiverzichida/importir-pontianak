'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, MapPin, Phone, Tag, Warehouse } from 'lucide-react';
import { ORIGIN_LABELS } from '@/lib/format';
import type { OriginCountry, WarehouseInfo } from '@/lib/types';

interface WarehouseSectionProps {
  warehouses: WarehouseInfo[];
}

export default function WarehouseSection({ warehouses }: WarehouseSectionProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<OriginCountry>('china');
  const [shopName, setShopName] = useState<string>('BORNEO88');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeWarehouse = useMemo(() => {
    return (
      warehouses.find((w) => w.origin_country === selectedOrigin) ||
      warehouses[0] ||
      null
    );
  }, [warehouses, selectedOrigin]);

  const markingCode = useMemo(() => {
    const prefix =
      selectedOrigin === 'china'
        ? 'CN'
        : selectedOrigin === 'malaysia'
          ? 'MY'
          : 'SG';
    const clean = shopName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'TOKO';
    return `PNK-${prefix}-${clean}`;
  }, [selectedOrigin, shopName]);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const formatWithMarking = (raw: string) =>
    raw.replace(/\[MARKING_CODE\]/g, markingCode);

  return (
    <section id="gudang" className="py-16 lg:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
              <Warehouse className="h-3.5 w-3.5" />
              Panduan Gudang Transit & Marking Code
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Sudah Punya Supplier? Kirim ke Gudang Transit Kami
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Untuk layanan Forwarder (Kirim Saja), minta supplier di China,
              Malaysia, atau Singapura mencantumkan{' '}
              <strong>Marking Code</strong> Anda pada paket agar mudah terdeteksi
              saat tiba di gudang transit.
            </p>
          </div>

          {/* Marking Code Preview Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm w-full lg:w-96">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Simulasi Marking Code Anda
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Nama / Inisial Toko"
                className="w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold focus:border-teal-600 focus:outline-none"
              />
              <div className="flex-1 flex items-center justify-between rounded-lg bg-navy text-teal-300 px-3 py-1.5 font-mono text-sm font-bold">
                <span className="truncate">{markingCode}</span>
                <button
                  type="button"
                  onClick={() => copyText('marking', markingCode)}
                  className="ml-2 text-white/80 hover:text-white"
                  title="Salin Marking Code"
                >
                  {copiedKey === 'marking' ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Origin Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {(['china', 'malaysia', 'singapura'] as OriginCountry[]).map((origin) => {
            const active = selectedOrigin === origin;
            return (
              <button
                key={origin}
                type="button"
                onClick={() => setSelectedOrigin(origin)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                  active
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                }`}
              >
                {ORIGIN_LABELS[origin]}
              </button>
            );
          })}
        </div>

        {activeWarehouse && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-navy-light text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">
                  {activeWarehouse.warehouse_name}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-teal-300" />
                  {activeWarehouse.city} • Kode Pos {activeWarehouse.postal_code}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/10 font-mono">
                  <Phone className="h-3 w-3 inline mr-1.5 text-teal-300" />
                  {activeWarehouse.phone}
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Alamat Gudang Lokal (Untuk Diberikan ke Supplier)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          'local',
                          formatWithMarking(activeWarehouse.address_local)
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {copiedKey === 'local' ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin Alamat
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm font-medium text-slate-800 leading-relaxed">
                    {formatWithMarking(activeWarehouse.address_local)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Alamat Versi Inggris / Referensi
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          'eng',
                          formatWithMarking(activeWarehouse.address_english)
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {copiedKey === 'eng' ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 leading-relaxed">
                    {formatWithMarking(activeWarehouse.address_english)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Format Nama Penerima & Label Dus
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          'recipient',
                          formatWithMarking(activeWarehouse.recipient_format)
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {copiedKey === 'recipient' ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 flex items-center gap-3">
                    <Tag className="h-5 w-5 text-teal-700 shrink-0" />
                    <span className="font-mono font-bold text-teal-900 text-sm">
                      {formatWithMarking(activeWarehouse.recipient_format)}
                    </span>
                  </div>
                </div>

                {activeWarehouse.notes && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed">
                    <strong className="block mb-1">Instruksi Penting:</strong>
                    {activeWarehouse.notes}
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  Jalur tersedia dari gudang ini:{' '}
                  <span className="font-semibold text-navy uppercase">
                    {activeWarehouse.supported_methods.join(' • ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
