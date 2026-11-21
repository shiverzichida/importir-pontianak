'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Check,
  MessageCircle,
  Package,
  Search,
  Ship,
  ShoppingBag,
} from 'lucide-react';
import { calculateImportEstimate } from '@/lib/calculator';
import { buildWhatsAppUrl, formatIdr, ORIGIN_LABELS } from '@/lib/format';
import type {
  CalculatorPrefill,
  OriginCountry,
  PublicConfig,
  ServiceType,
} from '@/lib/types';
import CalculatorSection, {
  type CalculatorScenarioPreset,
} from './CalculatorSection';
import FaqSection from './FaqSection';
import Navbar from './Navbar';
import RfqFormSection from './RfqFormSection';
import WarehouseSection from './WarehouseSection';

interface LandingClientProps {
  config: PublicConfig;
}

export default function LandingClient({ config }: LandingClientProps) {
  const router = useRouter();
  const [quickResi, setQuickResi] = useState('');
  const [prefill, setPrefill] = useState<CalculatorPrefill | null>(null);
  const [serviceTrigger, setServiceTrigger] = useState<{
    service: ServiceType;
    nonce: number;
  } | null>(null);
  const [scenarioPreset, setScenarioPreset] =
    useState<CalculatorScenarioPreset | null>(null);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickResi.trim();
    if (!q) {
      router.push('/tracking');
      return;
    }
    router.push(`/tracking?q=${encodeURIComponent(q)}`);
  };

  const scrollToRfq = (service: ServiceType) => {
    setServiceTrigger({ service, nonce: Date.now() });
    const el = document.getElementById('rfq');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyToRfq = (data: CalculatorPrefill) => {
    setPrefill(data);
    const el = document.getElementById('rfq');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const loadScenarioToCalculator = (
    preset: Omit<CalculatorScenarioPreset, 'nonce'>
  ) => {
    setScenarioPreset({ ...preset, nonce: Date.now() });
    const el = document.getElementById('kalkulator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const routeLedgers = useMemo(() => {
    const origins: OriginCountry[] = ['china', 'malaysia', 'singapura'];
    return origins.map((origin) => {
      const originRates = config.rates.filter(
        (r) => r.is_active && r.origin_country === origin
      );
      const uniqueModes = new Map<
        string,
        {
          methodLabel: string;
          unit: string;
          minRate: number;
          etaMin: number;
          etaMax: number;
        }
      >();
      for (const r of originRates) {
        const key = `${r.shipping_method}:${r.unit}`;
        const existing = uniqueModes.get(key);
        if (!existing || r.rate_idr < existing.minRate) {
          uniqueModes.set(key, {
            methodLabel: r.method_label,
            unit: r.unit.toUpperCase(),
            minRate: existing ? Math.min(existing.minRate, r.rate_idr) : r.rate_idr,
            etaMin: r.eta_min_days,
            etaMax: r.eta_max_days,
          });
        }
      }
      return {
        origin,
        label: ORIGIN_LABELS[origin],
        modes: Array.from(uniqueModes.values()),
      };
    });
  }, [config.rates]);

  const liveScenarios = useMemo(() => {
    const specs: Array<{
      id: string;
      title: string;
      subtitle: string;
      preset: Omit<CalculatorScenarioPreset, 'nonce'>;
    }> = [
      {
        id: 'cn-lcl',
        title: 'Mesin Usaha & Kemasan dari Yiwu / Guangzhou',
        subtitle: 'China Laut LCL · 0,35 CBM · Elektronik · Pontianak Dalam Kota',
        preset: {
          originCountry: 'china',
          shippingMethod: 'laut',
          unit: 'cbm',
          cargoCategory: 'elektronik',
          actualWeightKg: '42',
          directCbm: '0.35',
          lengthCm: '0',
          widthCm: '0',
          heightCm: '0',
          colliCount: '1',
          destinationCity: 'Pontianak (Kurir Dalam Kota)',
          includeGoodsValue: false,
          goodsValueForeign: '0',
          quantity: '1',
        },
      },
      {
        id: 'my-darat',
        title: 'Belanja Grosir Fashion dari Kuching',
        subtitle: 'Malaysia Darat Entikong/Aruk · 25 Kg · Fashion · Tujuan Singkawang',
        preset: {
          originCountry: 'malaysia',
          shippingMethod: 'darat',
          unit: 'kg',
          cargoCategory: 'fashion',
          actualWeightKg: '25',
          directCbm: '0',
          lengthCm: '0',
          widthCm: '0',
          heightCm: '0',
          colliCount: '1',
          destinationCity: 'Singkawang',
          includeGoodsValue: false,
          goodsValueForeign: '0',
          quantity: '1',
        },
      },
      {
        id: 'sg-udara',
        title: 'Sparepart Teknik Ekspres dari Singapura',
        subtitle: 'Singapura Udara · 4 Kg · Elektronik · Ambil Gudang Pontianak',
        preset: {
          originCountry: 'singapura',
          shippingMethod: 'udara',
          unit: 'kg',
          cargoCategory: 'elektronik',
          actualWeightKg: '4',
          directCbm: '0',
          lengthCm: '0',
          widthCm: '0',
          heightCm: '0',
          colliCount: '1',
          destinationCity: 'Pontianak (Ambil di Gudang)',
          includeGoodsValue: false,
          goodsValueForeign: '0',
          quantity: '1',
        },
      },
    ];

    return specs.map((item) => {
      const calc = calculateImportEstimate(
        {
          originCountry: item.preset.originCountry,
          shippingMethod: item.preset.shippingMethod,
          unit: item.preset.unit,
          cargoCategory: item.preset.cargoCategory,
          actualWeightKg: Number(item.preset.actualWeightKg),
          lengthCm: Number(item.preset.lengthCm),
          widthCm: Number(item.preset.widthCm),
          heightCm: Number(item.preset.heightCm),
          colliCount: Number(item.preset.colliCount),
          directCbm: Number(item.preset.directCbm),
          destinationCity: item.preset.destinationCity,
          includeGoodsValue: false,
          goodsValueForeign: 0,
          quantity: 1,
        },
        config.rates,
        config.destinations,
        config.settings
      );
      return { ...item, calc };
    });
  }, [config.rates, config.destinations, config.settings]);

  const generalWaUrl = buildWhatsAppUrl(
    config.settings.whatsapp_admin,
    `Halo Admin ${config.settings.company_name}, saya ingin konsultasi layanan impor / forwarder ke Kalimantan Barat.`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={config.settings} />

      <main id="main-content" className="flex-1">
        <section className="bg-navy text-white py-12 sm:py-16 lg:py-20 border-b border-navy-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="font-mono text-xs text-teal-300 border-b border-white/15 pb-3 mb-8 flex flex-wrap items-center justify-between gap-2">
              <span>0°00&apos;N 109°20&apos;E · HUB PONTIANAK, KALIMANTAN BARAT</span>
              <span className="text-slate-300">
                PENERUSAN AKTIF: 15 KOTA & KABUPATEN KALBAR
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.14]">
                  Impor dari{' '}
                  <span className="text-teal-300">China, Malaysia & Singapura</span>{' '}
                  Langsung Sampai Pontianak, Tanpa Hitung Ongkir Dua Kali
                </h1>

                <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Layanan satu pintu untuk pebisnis Kalimantan Barat: jasa titip
                  beli (1688, Taobao, Alibaba, Shopee MY), forwarder door-to-door
                  dengan marking code, dan transfer valas RMB, MYR, SGD dalam
                  Rupiah.
                </p>

                <form
                  onSubmit={handleQuickTrack}
                  className="bg-navy-light border border-white/20 rounded-xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl"
                >
                  <div className="relative flex-1">
                    <label htmlFor="hero-quick-resi" className="sr-only">
                      Masukkan nomor resi atau marking code
                    </label>
                    <Search
                      className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                      aria-hidden="true"
                    />
                    <input
                      id="hero-quick-resi"
                      type="text"
                      value={quickResi}
                      onChange={(e) => setQuickResi(e.target.value)}
                      placeholder="No. Resi / Marking Code (cth: IMP-PNK-2026-0001)"
                      className="w-full min-h-[44px] rounded-lg bg-white text-slate-900 placeholder:text-slate-500 pl-10 pr-3.5 py-2 text-sm font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[44px] rounded-lg bg-amber-light hover:bg-amber text-navy hover:text-white font-bold px-5 text-sm transition-colors shrink-0"
                  >
                    Cek Resi Live
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span>Contoh resi aktif:</span>
                  {[
                    'IMP-PNK-2026-0001',
                    'IMP-PNK-2026-0002',
                    'IMP-PNK-2026-0003',
                  ].map((code) => (
                    <Link
                      key={code}
                      href={`/tracking?q=${code}`}
                      className="font-mono px-2.5 py-1.5 rounded-md bg-navy-light hover:bg-white/15 border border-white/15 text-teal-200 transition-colors"
                    >
                      {code}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href="#kalkulator"
                    className="min-h-[48px] inline-flex items-center justify-center rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-6 text-sm transition-colors"
                  >
                    Hitung Ongkir All-In
                  </a>
                  <a
                    href="#rfq"
                    className="min-h-[48px] inline-flex items-center justify-center rounded-lg bg-navy-light hover:bg-white/15 border border-white/25 text-white font-bold px-6 text-sm transition-colors"
                  >
                    Ajukan Order / RFQ
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl bg-navy-dark border border-white/15 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
                  <h2 className="text-sm font-bold text-white">
                    Papan Tarif Dasar All-In ke Pontianak
                  </h2>
                  <span className="font-mono text-xs text-teal-300">
                    LIVE DB
                  </span>
                </div>

                {routeLedgers.every((g) => g.modes.length === 0) ? (
                  <p className="text-sm text-slate-300 py-4">
                    Tarif rute sedang disinkronkan. Gunakan formulir RFQ untuk
                    penawaran langsung.
                  </p>
                ) : (
                  <div className="divide-y divide-white/10">
                    {routeLedgers.map((group) => (
                      <div key={group.origin} className="py-3 first:pt-0 last:pb-0">
                        <div className="text-xs font-bold text-teal-300 mb-1.5">
                          {group.label}
                        </div>
                        <div className="space-y-1.5">
                          {group.modes.map((m) => (
                            <div
                              key={`${group.origin}-${m.methodLabel}`}
                              className="flex items-baseline justify-between gap-3 text-xs"
                            >
                              <span className="text-slate-200">
                                {m.methodLabel} ({m.etaMin}–{m.etaMax} hr)
                              </span>
                              <span className="font-mono font-bold text-white shrink-0">
                                Mulai {formatIdr(m.minRate)}/{m.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/15 text-xs text-slate-300 flex items-center justify-between gap-2">
                  <span>Fee Transfer Valas Flat</span>
                  <span className="font-mono font-bold text-amber-light">
                    {formatIdr(config.settings.transfer_fee_idr)} / transaksi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="layanan" className="py-16 lg:py-20 bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                Layanan Sesuai Kebutuhan Impor Anda
              </h2>
              <p className="mt-3 text-slate-700 text-base">
                Pilih layanan titip beli bagi pemula 1688 atau gunakan fasilitas
                gudang forwarder dan transfer valas bila sudah memiliki supplier
                tetap.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 rounded-xl bg-navy text-white p-6 sm:p-8 flex flex-col justify-between border border-navy-light">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="h-11 w-11 rounded-lg bg-navy-light border border-white/15 text-teal-300 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="px-3 py-1 rounded-md bg-amber-light text-navy text-xs font-bold">
                      Layanan Utama UMKM
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold">
                    Titip Beli / Sourcing (1688, Taobao, Alibaba, Shopee MY)
                  </h3>
                  <p className="mt-3 text-sm text-slate-200 leading-relaxed max-w-xl">
                    Cukup kirim tautan produk atau foto barang. Tim kami
                    membantu konfirmasi stok ke supplier, pembayaran kurs lokal,
                    pemeriksaan jumlah di gudang asal, pengurusan kepabeanan,
                    hingga pengiriman ke Pontianak.
                  </p>
                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
                    {[
                      'Penawaran HPP all-in Rupiah sebelum bayar',
                      'Pembayaran aman via transfer bank Indonesia',
                      'Pengecekan jumlah & kondisi dasar di gudang transit',
                      'Bisa digabung untuk berbagai supplier sekaligus',
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <Check
                          className="h-4 w-4 text-teal-300 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-mono text-teal-200">
                    Fee jasa {config.settings.sourcing_fee_percent}% (min{' '}
                    {formatIdr(config.settings.sourcing_fee_min_idr)})
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToRfq('titip_beli')}
                    className="min-h-[48px] rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-6 text-sm transition-colors"
                  >
                    Ajukan Titip Beli
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="flex-1 rounded-xl bg-white border border-slate-300 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-paper border border-slate-300 text-navy flex items-center justify-center">
                        <Package className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-navy">
                        Jasa Forwarder (Kirim Saja + Marking Code)
                      </h3>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Sudah punya supplier sendiri? Pakai alamat gudang
                      Guangzhou, Kuching, atau Tuas SG dengan Marking Code
                      unik, lengkap dengan pengukuran akurat dan live tracking.
                    </p>
                  </div>
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => scrollToRfq('forwarder')}
                      className="w-full min-h-[44px] rounded-lg bg-navy hover:bg-navy-light text-white font-bold px-4 text-sm transition-colors"
                    >
                      Booking Gudang Forwarder
                    </button>
                  </div>
                </div>

                <div className="flex-1 rounded-xl bg-white border border-slate-300 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-paper border border-slate-300 text-navy flex items-center justify-center">
                        <Banknote className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-navy">
                        Jasa Transfer Valas (RMB / MYR / SGD)
                      </h3>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Titip bayar invoice supplier atau top-up Alipay, WeChat Pay,
                      dan rekening bank Malaysia/Singapura dengan bukti transfer
                      resmi.
                    </p>
                  </div>
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => scrollToRfq('transfer_valas')}
                      className="w-full min-h-[44px] rounded-lg border border-navy text-navy hover:bg-navy hover:text-white font-bold px-4 text-sm transition-colors"
                    >
                      Ajukan Transfer Valas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="keunggulan"
          className="py-16 lg:py-20 bg-white border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-3xl font-extrabold text-navy tracking-tight">
                  Kenapa Pebisnis Kalbar Tidak Harus Transit Jakarta?
                </h2>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  Mayoritas forwarder nasional hanya menghitung tarif hingga
                  gudang Jakarta atau Surabaya, sehingga pelaku usaha di
                  Pontianak masih menanggung ongkir domestik lanjutan. Di sini,
                  perhitungan dan tracking menyatu sampai tujuan akhir Kalbar.
                </p>
              </div>

              <div className="lg:col-span-7 overflow-hidden rounded-xl border border-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="bg-paper p-6 space-y-3">
                    <h3 className="text-sm font-bold text-slate-700">
                      Forwarder Konvensional (Via Jakarta)
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li>• Hitung ongkir dua kali (Asal ke JKT, lalu JKT ke PNK)</li>
                      <li>• Harus mencari ekspedisi domestik sendiri</li>
                      <li>• Tidak melayani jalur darat lintas batas Kuching</li>
                      <li>• Estimasi HPP final baru jelas setelah kargo tiba</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 p-6 space-y-3">
                    <h3 className="text-sm font-bold text-navy">
                      Importir Pontianak (All-In Kalbar)
                    </h3>
                    <ul className="space-y-2 text-sm text-navy font-medium">
                      <li>• 1 kalkulasi all-in langsung sampai gudang Pontianak</li>
                      <li>• Penerusan ke Singkawang, Sintang, Ketapang, dan 11 kabupaten lain</li>
                      <li>• Tersedia jalur darat Kuching via Entikong / Aruk (2–4 hari)</li>
                      <li>• Bisa ambil langsung di gudang Ahmad Yani II / Kubu Raya</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-paper border-b border-slate-300 text-xs font-bold text-navy">
                    <th className="px-5 py-3.5">Negara & Hub Asal</th>
                    <th className="px-5 py-3.5">Jalur Tersedia</th>
                    <th className="px-5 py-3.5">Estimasi Lead Time</th>
                    <th className="px-5 py-3.5">Tarif Mulai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {routeLedgers.flatMap((g) =>
                    g.modes.map((m, idx) => (
                      <tr key={`${g.origin}-${idx}`} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5 font-bold text-navy whitespace-nowrap">
                          {g.label}
                        </td>
                        <td className="px-5 py-3.5 text-slate-800">
                          {m.methodLabel}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                          {m.etaMin}–{m.etaMax} hari
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-teal-dark whitespace-nowrap">
                          {formatIdr(m.minRate)} / {m.unit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <CalculatorSection
          rates={config.rates}
          destinations={config.destinations}
          settings={config.settings}
          scenarioPreset={scenarioPreset}
          onApplyToRfq={handleApplyToRfq}
        />

        <section className="py-16 bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl font-extrabold text-navy tracking-tight">
                Alur Kerja Transparan dalam 5 Tahap
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border border-slate-300 rounded-xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              {[
                {
                  step: '01',
                  title: 'Hitung / Kirim Link',
                  desc: 'Simulasikan biaya di kalkulator atau isi form RFQ dengan tautan produk dan foto barang.',
                },
                {
                  step: '02',
                  title: 'Penawaran All-In',
                  desc: 'Tim kami verifikasi stok supplier lalu kirim rincian biaya final dalam Rupiah.',
                },
                {
                  step: '03',
                  title: 'Beli & Masuk Gudang',
                  desc: 'Pembayaran diproses, barang diterima di gudang Guangzhou, Kuching, atau Singapura lalu diukur.',
                },
                {
                  step: '04',
                  title: 'Kirim & Live Tracking',
                  desc: 'Pantau pergerakan paket secara langsung melalui nomor resi IMP-PNK Anda.',
                },
                {
                  step: '05',
                  title: 'Tiba di Pontianak',
                  desc: 'Ambil di gudang kami atau teruskan ke alamat Anda di seluruh Kalimantan Barat.',
                },
              ].map((item) => (
                <div key={item.step} className="p-5 space-y-2">
                  <div className="font-mono text-xl font-extrabold text-teal-dark">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-base text-navy">{item.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <WarehouseSection warehouses={config.warehouses} />

        <RfqFormSection
          destinations={config.destinations}
          prefill={prefill}
          serviceTrigger={serviceTrigger}
          onClearPrefill={() => setPrefill(null)}
        />

        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold text-navy tracking-tight">
                  Contoh Simulasi Tarif Nyata ke Kalimantan Barat
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  Dihitung otomatis dari tabel tarif aktif di database untuk
                  membantu Anda memperkirakan ongkir sebelum order.
                </p>
              </div>
              <Link
                href="/tracking"
                className="min-h-[44px] inline-flex items-center text-sm font-bold text-teal-dark hover:underline"
              >
                Buka Halaman Cek Resi Publik
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveScenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="rounded-xl bg-paper border border-slate-300 p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <h3 className="font-bold text-navy text-base leading-snug">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-slate-700">{sc.subtitle}</p>

                    {sc.calc ? (
                      <div className="rounded-lg bg-white border border-slate-200 p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between gap-2 text-slate-700">
                          <span>Ongkir Internasional:</span>
                          <span className="font-mono font-semibold text-navy">
                            {formatIdr(sc.calc.internationalShippingIdr)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2 text-slate-700">
                          <span>Penerusan Kalbar:</span>
                          <span className="font-mono font-semibold text-navy">
                            {formatIdr(sc.calc.localKalbarFeeIdr)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2 pt-2 border-t border-slate-200 font-bold text-navy">
                          <span>Total Estimasi ({sc.calc.etaMinDays}–{sc.calc.etaMaxDays} hr):</span>
                          <span className="font-mono text-teal-dark">
                            {formatIdr(sc.calc.totalAllInIdr)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        Simulasi tersedia di kalkulator di atas.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => loadScenarioToCalculator(sc.preset)}
                    className="w-full min-h-[44px] rounded-lg border border-navy text-navy hover:bg-navy hover:text-white font-bold text-xs transition-colors"
                  >
                    Muat di Kalkulator
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FaqSection
          whatsappAdmin={config.settings.whatsapp_admin}
          companyName={config.settings.company_name}
        />
      </main>

      <footer className="bg-navy-dark text-slate-300 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Ship className="h-5 w-5 text-teal-300" aria-hidden="true" />
              {config.settings.company_name}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Partner jasa impor, titip beli (1688, Taobao, Alibaba), transfer
              valas, dan forwarder door-to-door dari China, Malaysia/Kuching, dan
              Singapura langsung ke Pontianak & Kalimantan Barat.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-white font-bold text-sm mb-2">
              Gudang & Operasional Pontianak
            </div>
            <p className="text-slate-200">{config.settings.company_address}</p>
            <p className="text-slate-300">{config.settings.operating_hours}</p>
            <div className="pt-2">
              <a
                href={generalWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 text-xs transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat WhatsApp Admin (+{config.settings.whatsapp_admin})
              </a>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-white font-bold text-sm mb-2">Tautan Cepat</div>
            <div className="flex flex-col gap-2">
              <a href="#kalkulator" className="hover:text-teal-300 py-0.5">
                Kalkulator Ongkir All-In Kalbar
              </a>
              <a href="#gudang" className="hover:text-teal-300 py-0.5">
                Alamat Gudang China, Malaysia & Singapura
              </a>
              <a href="#rfq" className="hover:text-teal-300 py-0.5">
                Form Request Quotation (RFQ)
              </a>
              <Link href="/tracking" className="hover:text-teal-300 py-0.5">
                Cek Resi / Live Tracking Publik
              </Link>
              <Link href="/admin" className="hover:text-teal-300 py-0.5">
                Dashboard Admin Operasional
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-slate-300">
          © {new Date().getFullYear()} {config.settings.company_name}. Melayani
          Kalimantan Barat.
        </div>
      </footer>
    </div>
  );
}
