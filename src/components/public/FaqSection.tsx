'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Apa bedanya impor lewat Importir Pontianak dibanding forwarder di Jakarta?',
    a: 'Forwarder Jakarta umumnya menghitung biaya sampai gudang Jakarta saja, sehingga pebisnis Kalbar harus membayar dan mengurus kargo domestik Jakarta–Pontianak secara terpisah. Di Importir Pontianak, estimasi tarif di kalkulator sudah mencakup pengurusan hingga gudang Pontianak (bahkan penerusan ke Singkawang, Sintang, Ketapang, dan kabupaten Kalbar lainnya) dalam satu penawaran transparan.',
  },
  {
    q: 'Bagaimana cara kerja layanan Titip Beli (1688 / Taobao / Alibaba / Shopee MY)?',
    a: 'Anda cukup copy-paste link produk atau unggah foto barang melalui form RFQ kami. Tim akan mengecek stok, menghubungi supplier, lalu mengirim penawaran all-in dalam Rupiah (harga barang + kurs live + ongkir + bea cukai + fee jasa). Setelah Anda setuju dan bayar DP/lunas, kami belikan, lakukan QC dasar di gudang asal, lalu kirim hingga Pontianak.',
  },
  {
    q: 'Apakah saya harus paham bahasa Mandarin atau punya rekening bank luar negeri?',
    a: 'Tidak perlu. Seluruh komunikasi negosiasi dengan supplier 1688/Taobao maupun pembayaran Yuan (RMB), Ringgit (MYR), dan SGD dibantu penuh oleh tim kami. Anda bertransaksi cukup memakai Rupiah (IDR).',
  },
  {
    q: 'Berapa lama pengiriman jalur darat dari Kuching / Malaysia ke Pontianak?',
    a: 'Untuk barang yang masuk gudang transit kami di Kuching (Sarawak), rute darat lintas batas via Entikong / Aruk umumnya memakan waktu 2–4 hari kerja hingga gudang Pontianak. Sangat cocok bagi UMKM & reseller Kalbar yang kulakan cepat dari Malaysia.',
  },
  {
    q: 'Kapan saya mendapatkan Marking Code dan nomor resi tracking?',
    a: 'Jika memakai layanan Forwarder (Kirim Saja), Anda bisa menuliskan Marking Code pribadi sesuai panduan di bagian Gudang Transit lalu daftarkan resi lokal supplier melalui Form Order / WhatsApp. Setelah order dikonfirmasi, admin menerbitkan nomor resi resmi (IMP-PNK-...) yang dapat dipantau di halaman Cek Resi.',
  },
  {
    q: 'Apakah ada minimal berat atau volume untuk mulai impor?',
    a: 'Sangat ramah UMKM pemula: jalur udara mulai dari minimal 1 Kg, jalur darat Kuching mulai 3 Kg, dan jalur laut LCL mulai 0,1 CBM (kubik).',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 lg:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/5 text-navy text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
            Pertanyaan yang Sering Diajukan
          </div>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">
            FAQ Layanan Impor & Forwarder Kalimantan Barat
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-navy text-sm sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
