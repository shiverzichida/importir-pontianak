'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, MapPin, Phone, Tag } from 'lucide-react';
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
    const clean =
      shopName
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
      // Clipboard API unavailable in non-secure context
    }
  };

  const formatWithMarking = (raw: string) =>
    raw.replace(/\[MARKING_CODE\]/g, markingCode);

  return (
    <section
      id="gudang"
      className="py-14 lg:py-16 bg-ice border-b border-[#E2EAF6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand mb-1">
              <span className="w-6 h-0.5 bg-brand rounded-full" aria-hidden="true" />
              Gudang Transit Resmi
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Alamat Gudang &amp; Generator Marking Code
            </h2>
            <p className="mt-2 text-slate-700 text-sm sm:text-base">
              Untuk layanan Forwarder (Kirim Saja), minta supplier di China,
              Malaysia, atau Singapura menuliskan <strong>Marking Code</strong>{' '}
              pada label dus agar paket tidak tertukar saat konsolidasi.
            </p>
          </div>

          <div className="bg-white border border-[#DCE6F5] rounded-2xl p-4 shadow-sm w-full lg:w-[400px]">
            <label
              htmlFor="marking-shop-input"
              className="block text-xs font-bold text-ink mb-2"
            >
              Preview Marking Code Anda (Ketik Inisial Toko)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="marking-shop-input"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Nama / Inisial Toko"
                className="w-36 min-h-[42px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-semibold text-ink"
              />
              <div className="flex-1 min-h-[42px] flex items-center justify-between rounded-xl bg-navy text-gold px-3 py-2 font-mono text-sm font-bold">
                <span className="truncate">{markingCode}</span>
                <button
                  type="button"
                  onClick={() => copyText('marking', markingCode)}
                  className="ml-2 min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg text-white hover:text-gold"
                  aria-label="Salin Marking Code"
                >
                  {copiedKey === 'marking' ? (
                    <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Pilih gudang negara asal"
          className="flex flex-wrap gap-2.5 mb-6"
        >
          {(['china', 'malaysia', 'singapura'] as OriginCountry[]).map((origin) => {
            const active = selectedOrigin === origin;
            return (
              <button
                key={origin}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedOrigin(origin)}
                className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-bold border transition-colors ${
                  active
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-white text-ink border-[#DCE6F5] hover:border-brand'
                }`}
              >
                {ORIGIN_LABELS[origin]}
              </button>
            );
          })}
        </div>

        {activeWarehouse ? (
          <div className="bg-white rounded-2xl border border-[#DCE6F5] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#0C2B6B] to-[#1748A8] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">
                  {activeWarehouse.warehouse_name}
                </h3>
                <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  {activeWarehouse.city} · Kode Pos {activeWarehouse.postal_code}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 font-mono text-xs font-semibold text-white">
                <Phone className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {activeWarehouse.phone}
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-ink">
                      Alamat Gudang Lokal (Untuk Supplier)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          'local',
                          formatWithMarking(activeWarehouse.address_local)
                        )
                      }
                      className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-soft"
                      aria-label="Salin alamat gudang lokal"
                    >
                      {copiedKey === 'local' ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Salin Alamat
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-ice border border-[#DCE6F5] p-4 text-sm font-medium text-ink leading-relaxed">
                    {formatWithMarking(activeWarehouse.address_local)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-ink">
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
                      className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-soft"
                      aria-label="Salin alamat gudang versi Inggris"
                    >
                      {copiedKey === 'eng' ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-ice border border-[#DCE6F5] p-3.5 text-xs text-slate-700 leading-relaxed">
                    {formatWithMarking(activeWarehouse.address_english)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-ink">
                      Format Nama Penerima &amp; Label Dus
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          'recipient',
                          formatWithMarking(activeWarehouse.recipient_format)
                        )
                      }
                      className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg text-xs font-bold text-brand hover:bg-brand-soft"
                      aria-label="Salin format penerima"
                    >
                      {copiedKey === 'recipient' ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-[#EEF5FF] border border-[#C6DAFA] p-4 flex items-center gap-3">
                    <Tag className="h-5 w-5 text-brand shrink-0" aria-hidden="true" />
                    <span className="font-mono font-bold text-ink text-sm">
                      {formatWithMarking(activeWarehouse.recipient_format)}
                    </span>
                  </div>
                </div>

                {activeWarehouse.notes && (
                  <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-950 leading-relaxed">
                    <strong className="block mb-1">Instruksi Penting:</strong>
                    {activeWarehouse.notes}
                  </div>
                )}

                <div className="text-xs text-slate-700">
                  Jalur tersedia dari gudang ini:{' '}
                  <span className="font-bold text-brand uppercase font-mono">
                    {activeWarehouse.supported_methods.join(' | ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#DCE6F5] bg-white p-6 text-sm text-slate-700">
            Data alamat gudang transit sedang dimuat atau belum tersedia.
          </div>
        )}
      </div>
    </section>
  );
}
