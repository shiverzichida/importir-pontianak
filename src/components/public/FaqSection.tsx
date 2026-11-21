'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/format';

interface FaqSectionProps {
  whatsappAdmin?: string;
  companyName?: string;
}

const FAQ_ITEMS = [
  {
    q: 'Apa bedanya impor lewat Importir Pontianak dibanding forwarder di Jakarta?',
    a: 'Forwarder Jakarta umumnya menghitung ongkir sampai gudang Jakarta saja, sehingga pebisnis Kalbar harus membayar dan mengurus kargo domestik Jakarta ke Pontianak secara terpisah. Di Importir Pontianak, estimasi tarif di kalkulator sudah mencakup pengurusan hingga gudang Pontianak dan penerusan ke kabupaten di Kalimantan Barat dalam satu penawaran.',
  },
  {
    q: 'Bagaimana cara kerja layanan Titip Beli (1688 / Taobao / Alibaba / Shopee MY)?',
    a: 'Anda kirim tautan produk atau unggah foto barang lewat form RFQ. Tim mengecek stok ke supplier, lalu mengirim penawaran all-in dalam Rupiah (harga barang, kurs transaksi, ongkir, bea cukai, dan fee jasa). Setelah disetujui dan DP/lunas masuk, barang dibelikan, diperiksa jumlahnya di gudang asal, lalu dikirim hingga Pontianak.',
  },
  {
    q: 'Apakah saya harus bisa bahasa Mandarin atau punya rekening bank luar negeri?',
    a: 'Tidak perlu. Seluruh komunikasi dengan supplier 1688/Taobao maupun pembayaran Yuan (RMB), Ringgit (MYR), dan Dolar Singapura (SGD) ditangani oleh tim kami. Anda bertransaksi memakai Rupiah via transfer bank lokal.',
  },
  {
    q: 'Berapa lama pengiriman jalur darat dari Kuching / Malaysia ke Pontianak?',
    a: 'Untuk barang yang masuk gudang transit di Kuching (Sarawak), rute darat lintas batas melalui Entikong atau Aruk umumnya memakan waktu 2 sampai 4 hari kerja hingga gudang Pontianak.',
  },
  {
    q: 'Kapan saya mendapatkan Marking Code dan nomor resi tracking?',
    a: 'Pada layanan Forwarder (Kirim Saja), Anda dapat langsung memakai format Marking Code pada bagian Gudang Transit lalu mendaftarkan resi lokal supplier lewat Form RFQ atau WhatsApp. Setelah order dikonfirmasi admin, nomor resi resmi (IMP-PNK-...) aktif di halaman Cek Resi.',
  },
  {
    q: 'Apakah ada minimal berat atau volume untuk mulai impor?',
    a: 'Jalur udara dimulai dari minimal 1 Kg, jalur darat Kuching mulai 3 Kg, dan jalur laut LCL mulai 0,1 CBM (kubik).',
  },
];

export default function FaqSection({
  whatsappAdmin = '6281256789012',
  companyName = 'Importir Pontianak',
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const waFaqUrl = buildWhatsAppUrl(
    whatsappAdmin,
    `Halo Admin ${companyName}, saya ingin bertanya seputar prosedur dan tarif impor ke Pontianak / Kalbar.`
  );

  return (
    <section
      id="faq"
      className="py-14 lg:py-16 bg-ice border-b border-[#E2EAF6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand">
              <span className="w-6 h-0.5 bg-brand rounded-full" aria-hidden="true" />
              FAQ Impor Kalbar
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Penjelasan praktis seputar prosedur impor, kepabeanan, jalur
              Kuching-Entikong, hingga penerusan ke kabupaten di Kalimantan
              Barat.
            </p>
            <div className="pt-1">
              <a
                href={waFaqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full bg-wa hover:bg-wa-dark text-white text-sm font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Tanya Langsung via WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              const triggerId = `faq-trigger-${idx}`;
              const panelId = `faq-panel-${idx}`;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-[#DCE6F5] bg-white overflow-hidden shadow-sm"
                >
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full min-h-[54px] flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ice/60 transition-colors"
                    >
                      <span className="font-bold text-ink text-sm sm:text-base">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-brand shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="px-5 pb-5 pt-2 text-sm text-slate-700 leading-relaxed border-t border-[#E6EEF9]"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
