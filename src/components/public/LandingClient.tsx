'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Calculator,
  Check,
  Clock,
  Globe2,
  MapPin,
  MessageCircle,
  Package,
  Plane,
  Search,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { buildWhatsAppUrl, formatIdr } from '@/lib/format';
import type { CalculatorPrefill, PublicConfig, ServiceType } from '@/lib/types';
import CalculatorSection from './CalculatorSection';
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

  const generalWaUrl = buildWhatsAppUrl(
    config.settings.whatsapp_admin,
    `Halo Admin ${config.settings.company_name}, saya ingin konsultasi layanan impor / forwarder ke Kalimantan Barat.`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={config.settings} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-navy-grid text-white py-14 sm:py-20 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-400/30 px-3.5 py-1.5 text-xs font-semibold text-teal-200">
                  <MapPin className="h-3.5 w-3.5 text-teal-300" />
                  Spesialis Impor & Forwarder Kalimantan Barat — Direct ke Pontianak
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
                  Impor dari{' '}
                  <span className="text-teal-300">China, Malaysia & Singapura</span>{' '}
                  Langsung Sampai Pontianak — Tanpa Hitung Ongkir Dua Kali
                </h1>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Solusi satu pintu untuk UMKM & pebisnis Kalbar: jasa titip beli
                  (1688, Taobao, Alibaba, Shopee MY), forwarder door-to-door
                  dengan marking code, serta transfer RMB/MYR/SGD transparan
                  dalam Rupiah.
                </p>

                {/* Inline Quick Tracking Bar */}
                <form
                  onSubmit={handleQuickTrack}
                  className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl"
                >
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={quickResi}
                      onChange={(e) => setQuickResi(e.target.value)}
                      placeholder="Masukkan No. Resi / Marking Code (cth: IMP-PNK-2026-0001)"
                      className="w-full rounded-xl bg-white text-slate-900 placeholder:text-slate-400 pl-10 pr-3.5 py-2.5 text-sm font-mono focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber hover:bg-amber-light text-white font-bold px-5 py-2.5 text-sm transition shrink-0"
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
                      className="font-mono px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-teal-200 transition"
                    >
                      {code}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="#kalkulator"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal hover:bg-teal-light text-white font-bold px-6 py-3.5 text-sm shadow-lg transition"
                  >
                    <Calculator className="h-4 w-4" />
                    Hitung Estimasi Ongkir All-In
                  </a>
                  <a
                    href="#rfq"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-6 py-3.5 text-sm transition"
                  >
                    Ajukan Titip Beli / Order
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right Trust Stats Grid */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Globe2,
                    value: '3 Negara',
                    label: 'China • Malaysia/Kuching • Singapura',
                    accent: 'text-teal-300',
                  },
                  {
                    icon: Truck,
                    value: '2–4 Hari',
                    label: 'Rute Darat Cepat Kuching–Entikong–PNK',
                    accent: 'text-amber-300',
                  },
                  {
                    icon: MapPin,
                    value: '14 Kota/Kab',
                    label: 'Penerusan ke Singkawang, Sintang, Ketapang',
                    accent: 'text-sky-300',
                  },
                  {
                    icon: ShieldCheck,
                    value: '100% Rupiah',
                    label: 'All-In Bea Cukai & Tanpa Biaya Tersembunyi',
                    accent: 'text-emerald-300',
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.value}
                      className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-5 space-y-2"
                    >
                      <Icon className={`h-6 w-6 ${stat.accent}`} />
                      <div className="text-2xl font-extrabold">{stat.value}</div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE SERVICES */}
        <section id="layanan" className="py-16 lg:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Layanan Terintegrasi
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                Pilih Layanan Sesuai Kebutuhan Bisnis Anda
              </h2>
              <p className="mt-3 text-slate-600">
                Dari pemula yang baru ingin belanja produk 1688 hingga toko
                grosir yang sudah rutin kulakan dari supplier China, Kuching,
                dan Singapura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'titip_beli' as ServiceType,
                  icon: ShoppingBag,
                  badge: 'Paling Populer UMKM',
                  title: 'Titip Beli / Sourcing (1688, Taobao, Alibaba)',
                  desc: 'Cukup kirim link atau foto barang. Kami bantu nego supplier, bayar pakai RMB/MYR/SGD, QC di gudang asal, hingga tiba di Pontianak.',
                  bullets: [
                    'Penawaran HPP all-in transparan sebelum bayar',
                    'Pembayaran aman pakai Rupiah (transfer bank lokal)',
                    'Pengecekan jumlah & kondisi dasar di gudang transit',
                  ],
                  cta: 'Ajukan Titip Beli',
                },
                {
                  id: 'forwarder' as ServiceType,
                  icon: Package,
                  badge: 'Untuk Grosir & Reseller',
                  title: 'Jasa Forwarder (Kirim Saja + Marking Code)',
                  desc: 'Sudah punya supplier sendiri? Pakai alamat gudang Guangzhou, Kuching, atau Tuas SG kami dengan Marking Code unik.',
                  bullets: [
                    'Jalur Udara (Kg), Laut LCL (CBM), & Darat Kuching',
                    'Pengukuran akurat di gudang & invoice jelas',
                    'Live tracking publik dari gudang asal ke Kalbar',
                  ],
                  cta: 'Booking Gudang Forwarder',
                },
                {
                  id: 'transfer_valas' as ServiceType,
                  icon: Banknote,
                  badge: `Fee Flat ${formatIdr(config.settings.transfer_fee_idr)}`,
                  title: 'Jasa Transfer Valas (RMB / MYR / SGD)',
                  desc: 'Butuh bayar invoice supplier atau top-up Alipay / WeChat Pay / Maybank MY / DBS SG dengan kurs kompetitif dan bukti transfer resmi.',
                  bullets: [
                    'Kurs live kompetitif tanpa biaya tersembunyi',
                    'Proses cepat dengan bukti resi transfer ke supplier',
                    'Bisa digabung dengan pengiriman forwarder kami',
                  ],
                  cta: 'Ajukan Transfer Valas',
                },
              ].map((srv) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.id}
                    className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-teal-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-navy text-teal-300 flex items-center justify-center">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                          {srv.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-navy">
                        {srv.title}
                      </h3>
                      <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                        {srv.desc}
                      </p>
                      <ul className="mt-5 space-y-2.5">
                        {srv.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2 text-xs sm:text-sm text-slate-700"
                          >
                            <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToRfq(srv.id)}
                      className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-navy hover:bg-navy-light text-white font-bold py-3 px-4 text-sm transition"
                    >
                      {srv.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* KEUNGGULAN PONTIANAK & 3 ORIGIN ROUTES */}
        <section id="keunggulan" className="py-16 lg:py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Diferensiasi Khusus Kalimantan Barat
                </span>
                <h2 className="text-3xl font-extrabold text-navy tracking-tight">
                  Kenapa Pebisnis Pontianak & Kalbar Memilih Kami?
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Sebagian besar forwarder nasional hanya menghitung ongkir sampai
                  gudang Jakarta atau Surabaya. Pebisnis Kalbar sering terkejut
                  dengan biaya kargo domestik tambahan. Kami merancang tarif
                  transparan hingga Pontianak & seluruh kabupaten Kalbar.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Forwarder Konvensional (Via Jakarta)
                  </div>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li>• Hitung ongkir dua kali (China → JKT + JKT → PNK)</li>
                    <li>• Harus cari ekspedisi domestik terpisah</li>
                    <li>• Tidak melayani jalur darat lintas batas Kuching</li>
                    <li>• Sulit estimasi HPP final sebelum barang tiba</li>
                  </ul>
                </div>

                <div className="rounded-2xl border-2 border-teal-500 bg-teal-50/50 p-6 space-y-3 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-teal-600" />
                    Importir Pontianak (All-In Kalbar)
                  </div>
                  <ul className="space-y-2.5 text-sm text-navy font-medium">
                    <li>• 1 kalkulasi all-in langsung sampai gudang Pontianak</li>
                    <li>• Terhubung penerusan Singkawang, Sintang, Ketapang, dll</li>
                    <li>• Tersedia jalur cepat Kuching–Entikong/Aruk (2–4 hari)</li>
                    <li>• Bisa pickup langsung di gudang Ahmad Yani II / Kubu Raya</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3 Origin Route Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Ship,
                  origin: 'China (Guangzhou & Yiwu)',
                  subtitle: 'Pusat Pabrik 1688, Taobao, Alibaba',
                  routes: [
                    'Udara Ekspres: Mulai Rp 185.000/kg (5–8 hari)',
                    'Laut LCL Hemat: Mulai Rp 4.800.000/CBM (25–35 hari)',
                  ],
                  highlight: 'Cocok untuk mesin UMKM, fashion, kemasan, dan stok grosir.',
                },
                {
                  icon: Truck,
                  origin: 'Malaysia / Kuching',
                  subtitle: 'Rute Unggulan Lintas Batas Kalbar',
                  routes: [
                    'Darat Entikong / Aruk: Mulai Rp 38.000/kg (2–4 hari)',
                    'Darat LCL: Mulai Rp 2.400.000/CBM • Udara KL: Rp 115.000/kg',
                  ],
                  highlight: 'Rute tercepat untuk produk Shopee MY, kuliner kemasan, & grosir Sarawak.',
                },
                {
                  icon: Plane,
                  origin: 'Singapura (Tuas & Changi)',
                  subtitle: 'Hub Regional Sparepart & Ritel',
                  routes: [
                    'Udara Ekspres: Mulai Rp 135.000/kg (3–5 hari)',
                    'Laut LCL SG–PNK: Mulai Rp 3.400.000/CBM (7–14 hari)',
                  ],
                  highlight: 'Ideal untuk sparepart industri, alat teknis, & barang elektronik resmi.',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.origin}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-navy text-teal-300 flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy text-base">
                          {card.origin}
                        </h3>
                        <p className="text-xs text-slate-500">{card.subtitle}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2 text-xs font-medium text-slate-700">
                      {card.routes.map((r) => (
                        <div
                          key={r}
                          className="rounded-lg bg-white border border-slate-200 px-3 py-2"
                        >
                          {r}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 pt-1">{card.highlight}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INTERACTIVE CALCULATOR */}
        <CalculatorSection
          rates={config.rates}
          destinations={config.destinations}
          settings={config.settings}
          onApplyToRfq={handleApplyToRfq}
        />

        {/* 5-STEP WORKFLOW */}
        <section className="py-16 bg-navy text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Alur Kerja Transparan
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
                5 Langkah Mudah Impor Sampai Pontianak
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  step: '01',
                  title: 'Hitung / Kirim Link',
                  desc: 'Simulasikan biaya di kalkulator atau isi form RFQ dengan link produk / foto barang.',
                },
                {
                  step: '02',
                  title: 'Penawaran All-In',
                  desc: 'Tim kami verifikasi stok supplier & kirim rincian biaya final dalam Rupiah.',
                },
                {
                  step: '03',
                  title: 'Beli & Masuk Gudang',
                  desc: 'Pembayaran diproses, barang tiba di gudang Guangzhou / Kuching / SG & diukur.',
                },
                {
                  step: '04',
                  title: 'Kirim & Live Tracking',
                  desc: 'Pantau pergerakan paket secara real-time melalui nomor resi IMP-PNK Anda.',
                },
                {
                  step: '05',
                  title: 'Tiba di Pontianak',
                  desc: 'Ambil di gudang kami atau teruskan ke alamat Anda di seluruh Kalbar.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2"
                >
                  <div className="font-mono text-2xl font-extrabold text-teal-300">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-base">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WAREHOUSE & MARKING CODE GUIDE */}
        <WarehouseSection warehouses={config.warehouses} />

        {/* RFQ & ORDER FORM */}
        <RfqFormSection
          destinations={config.destinations}
          prefill={prefill}
          serviceTrigger={serviceTrigger}
          onClearPrefill={() => setPrefill(null)}
        />

        {/* BUKTI PENGIRIMAN & TESTIMONI UMKM KALBAR */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Studi Kasus & Ilustrasi Pengiriman UMKM Kalbar
                </span>
                <h2 className="mt-2 text-3xl font-extrabold text-navy tracking-tight">
                  Melayani Pengusaha Pontianak hingga Pedalaman Kalbar
                </h2>
              </div>
              <Link
                href="/tracking"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
              >
                Lihat Contoh Tracking Resi Aktif
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  city: 'Pontianak — Kedai Kopi & Roastery',
                  route: 'Yiwu, China → Laut LCL (0.35 CBM)',
                  quote:
                    '“Biasanya bingung menghitung ongkir mesin grinder dari Guangzhou ke Jakarta lalu kargo kapal lagi ke Pontianak. Pakai kalkulator all-in ini, HPP per unit langsung jelas sebelum order.”',
                  tag: 'Studi Kasus Titip Beli 1688',
                },
                {
                  city: 'Singkawang — Grosir Fashion & Muslim',
                  route: 'Kuching → Darat Entikong (28 Kg)',
                  quote:
                    '“Paket dari supplier Sarawak masuk gudang Kuching hari Senin, Kamis sudah sampai di Pontianak dan langsung diteruskan ke Singkawang. Sangat membantu perputaran stok cepat.”',
                  tag: 'Studi Kasus Forwarder Lintas Batas',
                },
                {
                  city: 'Sintang & Ketapang — Bengkel & Teknik',
                  route: 'Singapura → Udara Ekspres (4.2 Kg)',
                  quote:
                    '“Sparepart sensor alat berat dari Singapura butuh cepat. Tinggal pantau lewat halaman Cek Resi, status bea cukai sampai tiba di Pontianak terupdate rapi.”',
                  tag: 'Studi Kasus Kargo Udara SG–PNK',
                },
              ].map((card) => (
                <div
                  key={card.city}
                  className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold">
                      {card.tag}
                    </span>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {card.quote}
                  </p>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="font-bold text-navy text-sm">{card.city}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{card.route}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />
      </main>

      {/* FOOTER */}
      <footer className="bg-navy-dark text-slate-300 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Ship className="h-5 w-5 text-teal-300" />
              {config.settings.company_name}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partner jasa impor, titip beli (1688/Taobao/Alibaba), transfer
              valas, dan forwarder door-to-door dari China, Malaysia/Kuching, dan
              Singapura langsung ke Pontianak & Kalimantan Barat.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-white font-bold text-sm mb-2">
              Gudang & Operasional Pontianak
            </div>
            <p className="text-slate-300">{config.settings.company_address}</p>
            <p className="text-slate-400">{config.settings.operating_hours}</p>
            <div className="pt-2">
              <a
                href={generalWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-xs transition"
              >
                <MessageCircle className="h-4 w-4" />
                Chat WhatsApp Admin (+{config.settings.whatsapp_admin})
              </a>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-white font-bold text-sm mb-2">Tautan Cepat</div>
            <div className="flex flex-col gap-1.5">
              <a href="#kalkulator" className="hover:text-teal-300">
                Kalkulator Ongkir All-In Kalbar
              </a>
              <a href="#gudang" className="hover:text-teal-300">
                Alamat Gudang China, Malaysia & Singapura
              </a>
              <a href="#rfq" className="hover:text-teal-300">
                Form Request Quotation (RFQ)
              </a>
              <Link href="/tracking" className="hover:text-teal-300">
                Cek Resi / Live Tracking Publik
              </Link>
              <Link href="/admin" className="hover:text-teal-300">
                Dashboard Admin Operasional
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {config.settings.company_name}. Melayani
          Kalimantan Barat.
        </div>
      </footer>
    </div>
  );
}
