import type {
  CargoCategory,
  CurrencyCode,
  OriginCountry,
  PaymentStatus,
  RfqShippingMethod,
  ServiceType,
  ShipmentStatus,
} from '@/lib/types';
import type { Locale } from './types';

export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    subtitle: string;
  };
  nav: {
    skipToContent: string;
    fxLabel: string;
    adminPanel: string;
    languageSwitcherAria: string;
    mainNavAria: string;
    mobileNavAria: string;
    home: string;
    services: string;
    calculator: string;
    tracking: string;
    guide: string;
    rfq: string;
    contact: string;
    serviceItems: {
      titipBeli: string;
      forwarder: string;
      transferValas: string;
      warehouse: string;
    };
    guideItems: {
      workflow: string;
      warehouseMarking: string;
      faq: string;
    };
    chatWhatsapp: string;
    chatWhatsappAdmin: string;
    calculatorMobile: string;
    trackingMobile: string;
    warehouseMobile: string;
    rfqMobile: string;
    faqMobile: string;
    adminDashboard: string;
    openMenuAria: string;
    closeMenuAria: string;
    waGreeting: (companyName: string) => string;
  };
  hero: {
    imageAlt: string;
    headline: string;
    subtitle: string;
    bullets: [string, string, string];
    ctaPrimary: string;
    ctaSecondary: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    cards: {
      titipBeli: { title: string; desc: string };
      forwarder: { title: string; desc: string };
      transferValas: { title: string; desc: (formattedFee: string) => string };
      gudang: { title: string; desc: string };
    };
  };
  workflow: {
    eyebrow: string;
    heading: string;
    steps: Array<{ title: string; desc: string }>;
  };
  quickTrack: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    trackBtn: string;
    demoLabel: string;
  };
  scenarios: {
    heading: string;
    shippingForwardingLabel: string;
    etaLabel: string;
    daysUnit: string;
    loadInCalcBtn: string;
    dotAria: (index: number) => string;
    prevAria: string;
    nextAria: string;
    items: Record<
      'cn-lcl' | 'my-darat' | 'sg-udara',
      { title: string; routeSummary: string; detail: string }
    >;
  };
  calculator: {
    title: string;
    subtitle: string;
    badge: string;
    originTabLabels: Record<OriginCountry, string>;
    routeLabels: {
      air: string;
      sea: string;
      landCbm: string;
      landKg: string;
    };
    inputs: {
      volumeCbm: string;
      volumePlaceholder: string;
      weightKg: string;
      weightPlaceholder: string;
      dimensions: string;
      dimLengthAria: string;
      dimWidthAria: string;
      dimHeightAria: string;
      dimLengthPlaceholder: string;
      dimWidthPlaceholder: string;
      dimHeightPlaceholder: string;
      categoryLabel: string;
      destinationLabel: string;
      includeGoodsLabel: (currency: CurrencyCode, feePercent: number) => string;
      goodsValueLabel: (currency: CurrencyCode) => string;
      qtyLabel: string;
    };
    categoryOptions: Record<CargoCategory, string>;
    applyRfqBtn: string;
    summary: {
      estimateTitle: string;
      etaText: (
        min: number,
        max: number,
        qtyFormatted: string,
        unit: string,
        isVolumetric: boolean
      ) => string;
      intlShipping: string;
      localForwarding: string;
      goodsLine: (amount: string, currency: CurrencyCode) => string;
      sourcingFee: string;
      hppPerUnit: (qty: string) => string;
      updatingRates: string;
      consultWaBtn: string;
    };
    waTemplate: (params: {
      companyName: string;
      originLabel: string;
      methodLabel: string;
      categoryLabel: string;
      chargeableQty: number;
      unit: string;
      destination: string;
      totalFormatted: string;
    }) => string;
    rfqSummaryTemplate: (params: {
      originLabel: string;
      methodLabel: string;
      chargeableQty: number;
      unit: string;
      destination: string;
      totalFormatted: string;
    }) => string;
  };
  warehouse: {
    eyebrow: string;
    heading: string;
    descriptionPart1: string;
    markingCodeHighlight: string;
    descriptionPart2: string;
    previewLabel: string;
    previewPlaceholder: string;
    copyMarkingAria: string;
    tablistAria: string;
    postalCode: string;
    localAddrLabel: string;
    copyAddr: string;
    copyAddrAria: string;
    copied: string;
    copy: string;
    engAddrLabel: string;
    copyEngAria: string;
    recipientLabel: string;
    copyRecipientAria: string;
    importantNotes: string;
    supportedMethodsLabel: string;
    emptyState: string;
    localizedMeta: Record<
      OriginCountry,
      { name: string; city: string; notes: string }
    >;
  };
  rfq: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    success: {
      badge: string;
      thankYou: (name: string) => string;
      desc: string;
      codeLabel: string;
      copy: string;
      copied: string;
      sendWaBtn: string;
      newOrderBtn: string;
    };
    formHeader: {
      title: string;
      subtitle: string;
      fastReplyBadge: string;
    };
    serviceSelector: {
      label: string;
      ariaLabel: string;
      items: Record<ServiceType, { title: string; desc: string }>;
    };
    prefillBanner: {
      title: string;
      estimateTotalLabel: string;
      removeAria: string;
    };
    fields: {
      fullNameLabel: string;
      fullNamePlaceholder: string;
      whatsappLabel: string;
      whatsappPlaceholder: string;
      companyLabel: string;
      companyPlaceholder: string;
      originLabel: string;
      originOptions: Record<OriginCountry, string>;
      methodLabel: string;
      methodOptions: {
        udara: string;
        laut: string;
        darat: string;
      };
      categoryLabel: string;
      categoryOptions: Record<CargoCategory, string>;
      destinationLabel: string;
      productNameLabel: string;
      productNamePlaceholder: string;
      productUrlLabel: string;
      productUrlPlaceholder: string;
      currencyLabel: string;
      currencyOptions: Record<CurrencyCode, string>;
      goodsValueLabel: string;
      goodsValuePlaceholder: string;
      qtyLabel: string;
      weightLabel: string;
      cbmLabel: string;
      optionalPlaceholder: string;
      photoLabel: string;
      photoAlt: string;
      photoUploaded: string;
      photoDeleteAria: string;
      photoUploading: string;
      photoPick: string;
      notesLabel: string;
      notesPlaceholder: string;
    };
    footerDisclaimer: string;
    submitIdle: string;
    submitLoading: string;
    errors: {
      uploadFail: string;
      submitFail: string;
      networkFail: string;
    };
  };
  faq: {
    eyebrow: string;
    heading: string;
    description: string;
    askWaBtn: string;
    waGreeting: (companyName: string) => string;
    items: Array<{ q: string; a: string }>;
  };
  tracking: {
    title: string;
    subtitle: string;
    searchAriaLabel: string;
    searchPlaceholder: string;
    searchBtn: string;
    searchingBtn: string;
    demoLabel: string;
    demoLabels: Record<
      'IMP-PNK-2026-0001' | 'IMP-PNK-2026-0002' | 'IMP-PNK-2026-0003',
      string
    >;
    askWaBtn: string;
    waInquiryQuery: (companyName: string, query: string) => string;
    waUpdateResi: (
      companyName: string,
      trackingNo: string,
      markingCode: string
    ) => string;
    result: {
      trackingNoLabel: string;
      paymentPrefix: string;
      outForDeliveryNotice: (city: string) => string;
      customerMarking: string;
      markingPrefix: string;
      routeMethod: string;
      goodsWarehouse: string;
      colliUnit: string;
      destinationInvoice: string;
      etaPrefix: string;
      historyHeading: string;
      supplierResiPrefix: string;
      noEvents: string;
      needUpdatePrompt: string;
      contactAdminBtn: string;
    };
    empty: {
      title: string;
      desc: string;
      cta: string;
    };
    errors: {
      notFound: string;
      serverError: string;
    };
  };
  footer: {
    quickLink: string;
    links: {
      home: string;
      services: string;
      calculator: string;
      warehouse: string;
      tracking: string;
      rfq: string;
      faq: string;
      admin: string;
    };
    contactUs: string;
    quickAccess: string;
    waAria: string;
    emailAria: string;
    trackingAria: string;
    warehouseAria: string;
    allRightsReserved: string;
    locationLabel: string;
    operatingHoursDefault: string;
    waGreeting: (companyName: string) => string;
  };
  domain: {
    originLabels: Record<OriginCountry, string>;
    methodLabels: Record<RfqShippingMethod, string>;
    categoryLabels: Record<CargoCategory, string>;
    serviceLabels: Record<ServiceType, string>;
    paymentStatusLabels: Record<PaymentStatus, string>;
    shipmentStepShortLabels: Record<
      | 'order_confirmed'
      | 'received_origin_warehouse'
      | 'in_transit'
      | 'customs_clearance'
      | 'arrived_pontianak'
      | 'delivered',
      string
    >;
    shipmentStatusLabels: Record<ShipmentStatus, string>;
  };
  api: {
    trackingMinChars: string;
    trackingNotFound: (query: string) => string;
    trackingEventsError: string;
    trackingServerError: string;
    rfqInvalidService: string;
    rfqMissingName: string;
    rfqInvalidWhatsapp: string;
    rfqMissingDestination: string;
    rfqInvalidOrigin: string;
    rfqInvalidMethod: string;
    rfqInvalidCategory: string;
    rfqMissingProduct: string;
    rfqSaveError: string;
    rfqServerError: string;
    rfqWaTemplate: {
      greeting: (companyName: string) => string;
      code: string;
      service: string;
      name: string;
      originRoute: string;
      category: string;
      product: string;
      productUrl: string;
      goodsValue: string;
      weight: string;
      cbm: string;
      calcEstimate: string;
      destination: string;
      notes: string;
      closing: string;
    };
  };
}

const ID_DICTIONARY: Dictionary = {
  meta: {
    title:
      'Importir Pontianak | Jasa Impor, Sourcing & Forwarder China, Malaysia, Singapura ke Kalbar',
    description:
      'Platform jasa titip beli (1688, Taobao, Alibaba), forwarder door-to-door, dan transfer valas dari China, Malaysia/Kuching, dan Singapura langsung ke Pontianak & seluruh Kalimantan Barat.',
  },
  brand: {
    subtitle: 'Impor Lebih Mudah, Sampai ke Kalbar',
  },
  nav: {
    skipToContent: 'Lewati ke konten utama',
    fxLabel: 'Kurs Transaksi:',
    adminPanel: 'Admin Panel',
    languageSwitcherAria: 'Pilih bahasa website',
    mainNavAria: 'Navigasi utama',
    mobileNavAria: 'Navigasi seluler',
    home: 'Beranda',
    services: 'Layanan',
    calculator: 'Kalkulator',
    tracking: 'Cek Resi',
    guide: 'Panduan',
    rfq: 'Form RFQ',
    contact: 'Kontak',
    serviceItems: {
      titipBeli: 'Jasa Titip Beli / Sourcing',
      forwarder: 'Freight Forwarder (Kirim Saja)',
      transferValas: 'Transfer Valas RMB / MYR / SGD',
      warehouse: 'Alamat Gudang Transit',
    },
    guideItems: {
      workflow: 'Alur Kerja 4 Langkah',
      warehouseMarking: 'Gudang & Marking Code',
      faq: 'FAQ Impor Kalbar',
    },
    chatWhatsapp: 'Chat WhatsApp',
    chatWhatsappAdmin: 'Chat WhatsApp Admin',
    calculatorMobile: 'Kalkulator Impor',
    trackingMobile: 'Cek Resi / Live Tracking',
    warehouseMobile: 'Gudang Transit & Marking Code',
    rfqMobile: 'Ajukan Order / Form RFQ',
    faqMobile: 'FAQ Impor',
    adminDashboard: 'Dashboard Admin',
    openMenuAria: 'Buka menu navigasi',
    closeMenuAria: 'Tutup menu navigasi',
    waGreeting: (companyName) =>
      `Halo Admin ${companyName}, saya ingin konsultasi layanan impor ke Pontianak / Kalbar.`,
  },
  hero: {
    imageAlt: 'Kapal kontainer dan derek pelabuhan di Pontianak Kalimantan Barat',
    headline: 'Solusi Impor & Forwarder Terpercaya di Pontianak',
    subtitle:
      'Dari China, Malaysia/Kuching & Singapura hingga ke seluruh Kalimantan Barat, dengan harga transparan dan layanan profesional.',
    bullets: [
      'Estimasi All-In sampai Pontianak',
      'Tracking Real-Time',
      'Tim Profesional & Responsif',
    ],
    ctaPrimary: 'Hitung Estimasi Biaya',
    ctaSecondary: 'Pelajari Layanan',
  },
  services: {
    eyebrow: 'Layanan Kami',
    heading: 'Lengkap & Terpercaya',
    cards: {
      titipBeli: {
        title: 'Jasa Titip Beli / Sourcing',
        desc: 'Paste link 1688, Taobao, Alibaba, atau Shopee MY, kami urus pembelian & QC.',
      },
      forwarder: {
        title: 'Freight Forwarder',
        desc: 'Kirim barang dari China, Kuching Malaysia & Singapura langsung ke Pontianak.',
      },
      transferValas: {
        title: 'Transfer Valas RMB / MYR',
        desc: (fee) =>
          `Titip bayar supplier aman dalam Rupiah dengan fee flat ${fee}.`,
      },
      gudang: {
        title: 'Gudang & Marking Code',
        desc: 'Alamat gudang Guangzhou, Kuching & Singapura serta generator marking code.',
      },
    },
  },
  workflow: {
    eyebrow: 'Alur Kerja Kami',
    heading: 'Mudah, Transparan, Terpercaya',
    steps: [
      {
        title: '1. Kirim Link / Permintaan Order',
        desc: 'Paste link produk atau unggah foto barang melalui form RFQ',
      },
      {
        title: '2. Dapatkan Penawaran',
        desc: 'Harga all-in transparan: barang, ongkir & pengurusan bea cukai',
      },
      {
        title: '3. Proses & Pengiriman',
        desc: 'QC gudang asal, packing aman dan pengiriman menuju Pontianak',
      },
      {
        title: '4. Terima Barang',
        desc: 'Ambil di gudang Pontianak atau teruskan ke alamat Kalbar',
      },
    ],
  },
  quickTrack: {
    title: 'Cek Resi / Live Tracking',
    subtitle: 'Pantau status pengiriman Anda secara real-time',
    inputLabel: 'Masukkan Nomor Resi atau Marking Code',
    inputPlaceholder: 'Masukkan Nomor Resi...',
    trackBtn: 'Lacak',
    demoLabel: 'Demo resi:',
  },
  scenarios: {
    heading: 'Simulasi Rute Nyata ke Kalbar',
    shippingForwardingLabel: 'Ongkir Internasional + Penerusan:',
    etaLabel: 'Estimasi waktu:',
    daysUnit: 'hari',
    loadInCalcBtn: 'Muat di Kalkulator',
    dotAria: (idx) => `Lihat simulasi ${idx}`,
    prevAria: 'Simulasi sebelumnya',
    nextAria: 'Simulasi berikutnya',
    items: {
      'cn-lcl': {
        title: 'Mesin Usaha & Kemasan dari Yiwu / Guangzhou',
        routeSummary: 'China Laut LCL · 0,35 CBM · Elektronik -> Pontianak',
        detail:
          'Sudah termasuk kepabeanan laut hingga Pontianak dan antar dalam kota.',
      },
      'my-darat': {
        title: 'Belanja Grosir Fashion Lintas Batas Kuching',
        routeSummary:
          'Malaysia Darat Entikong/Aruk · 25 Kg · Fashion -> Singkawang',
        detail:
          'Jalur darat cepat 2 sampai 4 hari kerja dari Sarawak langsung diteruskan ke Singkawang.',
      },
      'sg-udara': {
        title: 'Sparepart Teknik Ekspres dari Singapura',
        routeSummary: 'Singapura Udara · 4 Kg · Elektronik -> Gudang Pontianak',
        detail:
          'Pengiriman udara cepat dari gudang Tuas Singapura siap ambil di Pontianak.',
      },
    },
  },
  calculator: {
    title: 'Kalkulator Impor',
    subtitle: 'Hitung estimasi biaya impor ke Pontianak dengan mudah',
    badge: 'Pontianak & Kalbar',
    originTabLabels: {
      china: 'China',
      malaysia: 'Malaysia / Kuching',
      singapura: 'Singapura',
    },
    routeLabels: {
      air: 'Jalur Udara',
      sea: 'Jalur Laut',
      landCbm: 'Darat (CBM)',
      landKg: 'Darat (Kg)',
    },
    inputs: {
      volumeCbm: 'Volume (CBM)',
      volumePlaceholder: 'cth: 0.35',
      weightKg: 'Berat Barang (Kg)',
      weightPlaceholder: 'Masukkan berat...',
      dimensions: 'Dimensi (P × L × T cm)',
      dimLengthAria: 'Panjang cm',
      dimWidthAria: 'Lebar cm',
      dimHeightAria: 'Tinggi cm',
      dimLengthPlaceholder: 'P',
      dimWidthPlaceholder: 'L',
      dimHeightPlaceholder: 'T',
      categoryLabel: 'Kategori Barang',
      destinationLabel: 'Kota Tujuan Kalbar',
      includeGoodsLabel: (currency, feePercent) =>
        `Hitung juga modal barang (${currency}) & fee titip beli ${feePercent}%`,
      goodsValueLabel: (currency) => `Nilai Barang (${currency})`,
      qtyLabel: 'Qty (Pcs)',
    },
    categoryOptions: {
      general: 'General Cargo',
      fashion: 'Fashion & Tekstil',
      elektronik: 'Elektronik / Mesin',
      khusus: 'Lartas / Khusus',
    },
    applyRfqBtn: 'Ajukan Penawaran dengan Estimasi Ini',
    summary: {
      estimateTitle: 'Estimasi Biaya (All-In)',
      etaText: (min, max, qtyFormatted, unit, isVolumetric) =>
        `ETA ${min}-${max} hari · ${qtyFormatted} ${unit}${isVolumetric ? ' (Volumetrik)' : ''}`,
      intlShipping: "Ongkir Int'l + Bea Cukai:",
      localForwarding: 'Penerusan Kalbar:',
      goodsLine: (amount, currency) => `Barang (${amount} ${currency}):`,
      sourcingFee: 'Fee Titip Beli:',
      hppPerUnit: (qty) => `HPP / pcs (${qty}):`,
      updatingRates: 'Tarif rute sedang diperbarui.',
      consultWaBtn: 'Konsultasi Tarif via WhatsApp',
    },
    waTemplate: (p) =>
      [
        `Halo Admin ${p.companyName}, saya ingin konsultasi estimasi kalkulator:`,
        `- Asal: ${p.originLabel}`,
        `- Jalur: ${p.methodLabel}`,
        `- Kategori: ${p.categoryLabel}`,
        `- Kuantitas Tertagih: ${p.chargeableQty} ${p.unit}`,
        `- Tujuan: ${p.destination}`,
        `- Estimasi All-In: ${p.totalFormatted}`,
      ].join('\n'),
    rfqSummaryTemplate: (p) =>
      `Simulasi kalkulator: ${p.originLabel} (${p.methodLabel}), ${p.chargeableQty} ${p.unit}, tujuan ${p.destination}. Estimasi total ${p.totalFormatted}.`,
  },
  warehouse: {
    eyebrow: 'Gudang Transit Resmi',
    heading: 'Alamat Gudang & Generator Marking Code',
    descriptionPart1:
      'Untuk layanan Forwarder (Kirim Saja), minta supplier di China, Malaysia, atau Singapura menuliskan ',
    markingCodeHighlight: 'Marking Code',
    descriptionPart2: ' pada label dus agar paket tidak tertukar saat konsolidasi.',
    previewLabel: 'Preview Marking Code Anda (Ketik Inisial Toko)',
    previewPlaceholder: 'Nama / Inisial Toko',
    copyMarkingAria: 'Salin Marking Code',
    tablistAria: 'Pilih gudang negara asal',
    postalCode: 'Kode Pos',
    localAddrLabel: 'Alamat Gudang Lokal (Untuk Supplier)',
    copyAddr: 'Salin Alamat',
    copyAddrAria: 'Salin alamat gudang lokal',
    copied: 'Tersalin',
    copy: 'Salin',
    engAddrLabel: 'Alamat Versi Inggris / Referensi',
    copyEngAria: 'Salin alamat gudang versi Inggris',
    recipientLabel: 'Format Nama Penerima & Label Dus',
    copyRecipientAria: 'Salin format penerima',
    importantNotes: 'Instruksi Penting:',
    supportedMethodsLabel: 'Jalur tersedia dari gudang ini:',
    emptyState: 'Data alamat gudang transit sedang dimuat atau belum tersedia.',
    localizedMeta: {
      china: {
        name: 'Gudang Transit Guangzhou (Importir Pontianak)',
        city: 'Guangzhou, Guangdong',
        notes:
          'Wajib cantumkan Marking Code Anda pada label dus & informasi resi lokal China (SF Express / ZTO / YTO / Yunda) agar tidak tertukar saat konsolidasi.',
      },
      malaysia: {
        name: 'Gudang Transit Kuching & Hub Kuala Lumpur',
        city: 'Kuching, Sarawak (Lintas Batas Entikong/Aruk)',
        notes:
          'Paket Shopee MY / supplier Sarawak langsung kirim ke gudang Kuching untuk jalur darat cepat 2-4 hari ke Pontianak. Barang dari Semenanjung bisa via Hub KL Udara atau Pos Laju ke Kuching.',
      },
      singapura: {
        name: 'Gudang Transit Tuas Singapura',
        city: 'Tuas, West Region, Singapore',
        notes:
          'Harap sertakan Commercial Invoice & Packing List (PDF/foto) kepada admin saat resi lokal Singapura (NinjaVan / J&T SG / Lalamove) dikirim ke gudang Tuas.',
      },
    },
  },
  rfq: {
    eyebrow: 'Request For Quotation (RFQ)',
    heading: 'Ajukan Titip Beli, Booking Gudang, atau Transfer Valas',
    subtitle:
      'Tempelkan tautan produk (1688, Taobao, Alibaba, Shopee MY) atau unggah foto barang. Data otomatis tercatat dan langsung terhubung ke WhatsApp admin Pontianak.',
    success: {
      badge: 'Pengajuan Berhasil Disimpan',
      thankYou: (name) => `Terima Kasih, ${name}!`,
      desc: 'Kode RFQ Anda telah tercatat di sistem kami. Klik tombol WhatsApp di bawah untuk verifikasi penawaran dengan admin.',
      codeLabel: 'Kode RFQ:',
      copy: 'Salin',
      copied: 'Disalin',
      sendWaBtn: 'Kirim Pengajuan ke WhatsApp Admin',
      newOrderBtn: 'Buat Pengajuan Baru',
    },
    formHeader: {
      title: 'Formulir Permintaan Penawaran',
      subtitle: 'Semua data dikirim ke tim Pontianak dalam hitungan detik',
      fastReplyBadge: 'Respon Cepat via WA',
    },
    serviceSelector: {
      label: 'Pilih Jenis Layanan',
      ariaLabel: 'Pilih jenis layanan RFQ',
      items: {
        titip_beli: {
          title: 'Titip Beli / Sourcing',
          desc: 'Kami belikan dari 1688, Taobao, Alibaba & QC gudang.',
        },
        forwarder: {
          title: 'Forwarder (Kirim Saja)',
          desc: 'Anda sudah punya supplier, kirim ke gudang kami.',
        },
        transfer_valas: {
          title: 'Jasa Transfer RMB / MYR',
          desc: 'Titip bayar invoice supplier via Alipay atau bank.',
        },
      },
    },
    prefillBanner: {
      title: 'Estimasi dari Kalkulator Diterapkan:',
      estimateTotalLabel: 'Estimasi Total:',
      removeAria: 'Hapus estimasi kalkulator',
    },
    fields: {
      fullNameLabel: 'Nama Lengkap *',
      fullNamePlaceholder: 'cth: Budi Santoso',
      whatsappLabel: 'Nomor WhatsApp Aktif *',
      whatsappPlaceholder: 'cth: 081256789012',
      companyLabel: 'Nama Toko / Usaha (Opsional)',
      companyPlaceholder: 'cth: Toko Borneo Jaya',
      originLabel: 'Negara Asal *',
      originOptions: {
        china: 'China (Guangzhou / Yiwu)',
        malaysia: 'Malaysia / Kuching',
        singapura: 'Singapura',
      },
      methodLabel: 'Jalur Pengiriman *',
      methodOptions: {
        udara: 'Jalur Udara (Cepat)',
        laut: 'Jalur Laut LCL (Hemat CBM)',
        darat: 'Jalur Darat Entikong / Aruk',
      },
      categoryLabel: 'Kategori Barang',
      categoryOptions: {
        general: 'General Cargo',
        fashion: 'Fashion & Aksesoris',
        elektronik: 'Elektronik / Mesin',
        khusus: 'Lartas / Khusus',
      },
      destinationLabel: 'Kota Tujuan Kalbar *',
      productNameLabel: 'Nama Barang / Deskripsi Order *',
      productNamePlaceholder:
        'cth: Mesin Press Cup Otomatis / Tas Wanita 50 pcs',
      productUrlLabel: 'Link Produk (1688 / Taobao / Alibaba / Shopee MY)',
      productUrlPlaceholder: 'https://detail.1688.com/offer/...',
      currencyLabel: 'Mata Uang',
      currencyOptions: {
        RMB: 'RMB (Yuan)',
        MYR: 'MYR (Ringgit)',
        SGD: 'SGD',
        IDR: 'IDR',
      },
      goodsValueLabel: 'Nilai Barang / Transfer',
      goodsValuePlaceholder: 'cth: 1500',
      qtyLabel: 'Qty (Pcs)',
      weightLabel: 'Perkiraan Berat (Kg)',
      cbmLabel: 'Perkiraan Vol (CBM)',
      optionalPlaceholder: 'opsional',
      photoLabel: 'Unggah Foto Produk / Invoice (Opsional, Maks 3 MB)',
      photoAlt: 'Pratinjau foto produk yang diunggah',
      photoUploaded: 'Foto terunggah siap dikirim',
      photoDeleteAria: 'Hapus foto produk',
      photoUploading: 'Mengunggah foto...',
      photoPick: 'Pilih Foto JPG / PNG / WebP (Maks 3 MB)',
      notesLabel: 'Catatan Tambahan (Varian, Resi Lokal, atau Permintaan Khusus)',
      notesPlaceholder:
        'Contoh: Warna hitam 20 pcs, putih 30 pcs. Mohon QC sebelum berangkat.',
    },
    footerDisclaimer:
      'Pengajuan gratis. Anda meninjau penawaran resmi all-in sebelum pembayaran DP.',
    submitIdle: 'Kirim Pengajuan & Lanjut WhatsApp',
    submitLoading: 'Mengirim RFQ...',
    errors: {
      uploadFail: 'Gagal mengunggah foto.',
      submitFail: 'Gagal mengirim pengajuan RFQ.',
      networkFail: 'Koneksi bermasalah. Silakan coba beberapa saat lagi.',
    },
  },
  faq: {
    eyebrow: 'FAQ Impor Kalbar',
    heading: 'Pertanyaan yang Sering Diajukan',
    description:
      'Penjelasan praktis seputar prosedur impor, kepabeanan, jalur Kuching-Entikong, hingga penerusan ke kabupaten di Kalimantan Barat.',
    askWaBtn: 'Tanya Langsung via WhatsApp',
    waGreeting: (companyName) =>
      `Halo Admin ${companyName}, saya ingin bertanya seputar prosedur dan tarif impor ke Pontianak / Kalbar.`,
    items: [
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
    ],
  },
  tracking: {
    title: 'Cek Resi / Live Tracking',
    subtitle:
      'Pantau status pengiriman China, Malaysia & Singapura ke Pontianak secara real-time',
    searchAriaLabel: 'Nomor Resi, Marking Code, atau Resi Supplier',
    searchPlaceholder: 'Masukkan Nomor Resi (cth: IMP-PNK-2026-0001)...',
    searchBtn: 'Lacak',
    searchingBtn: 'Mencari...',
    demoLabel: 'Coba resi demo:',
    demoLabels: {
      'IMP-PNK-2026-0001': 'China Laut (In Transit)',
      'IMP-PNK-2026-0002': 'Kuching Darat (Tiba Pontianak)',
      'IMP-PNK-2026-0003': 'Singapura Udara (Diterima)',
    },
    askWaBtn: 'Tanya Admin via WhatsApp',
    waInquiryQuery: (companyName, q) =>
      `Halo Admin ${companyName}, saya ingin menanyakan resi / marking code: ${q}`,
    waUpdateResi: (companyName, trackingNo, markingCode) =>
      `Halo Admin ${companyName}, saya ingin menanyakan update resi ${trackingNo} (${markingCode}).`,
    result: {
      trackingNoLabel: 'Nomor Resi Importir Pontianak',
      paymentPrefix: 'Pembayaran:',
      outForDeliveryNotice: (city) =>
        `Paket sedang dalam proses pengantaran kurir atau ekspedisi menuju alamat tujuan Anda di ${city}.`,
      customerMarking: 'Customer & Marking Code',
      markingPrefix: 'Marking:',
      routeMethod: 'Rute & Jalur',
      goodsWarehouse: 'Barang & Ukuran Gudang',
      colliUnit: 'Koli',
      destinationInvoice: 'Tujuan & Tagihan',
      etaPrefix: 'ETA:',
      historyHeading: 'Riwayat Perjalanan Kargo',
      supplierResiPrefix: 'Resi Supplier:',
      noEvents: 'Belum ada log perjalanan tambahan untuk resi ini.',
      needUpdatePrompt:
        'Butuh update jadwal pengambilan gudang Pontianak atau pembayaran?',
      contactAdminBtn: 'Hubungi Admin via WhatsApp',
    },
    empty: {
      title: 'Belum punya nomor resi atau ingin ajukan pengiriman baru?',
      desc: 'Hitung estimasi ongkir atau daftarkan resi supplier Anda melalui form RFQ kami.',
      cta: 'Ajukan Order / RFQ',
    },
    errors: {
      notFound: 'Data pengiriman tidak ditemukan.',
      serverError: 'Gagal menghubungi server tracking. Silakan coba lagi.',
    },
  },
  footer: {
    quickLink: 'Quick Link',
    links: {
      home: 'Beranda',
      services: 'Layanan',
      calculator: 'Kalkulator',
      warehouse: 'Gudang Transit',
      tracking: 'Cek Resi',
      rfq: 'Form RFQ',
      faq: 'FAQ Impor',
      admin: 'Admin Panel',
    },
    contactUs: 'Hubungi Kami',
    quickAccess: 'Akses Cepat',
    waAria: 'WhatsApp Importir Pontianak',
    emailAria: 'Email Importir Pontianak',
    trackingAria: 'Halaman Live Tracking',
    warehouseAria: 'Lokasi Gudang Transit',
    allRightsReserved: 'Semua Hak Dilindungi.',
    locationLabel: 'Pontianak, Kalimantan Barat',
    operatingHoursDefault: 'Senin - Sabtu, 08:30 - 17:30 WIB',
    waGreeting: (companyName) =>
      `Halo Admin ${companyName}, saya ingin konsultasi layanan impor ke Pontianak / Kalimantan Barat.`,
  },
  domain: {
    originLabels: {
      china: 'China (Guangzhou / Yiwu)',
      malaysia: 'Malaysia / Kuching',
      singapura: 'Singapura (Tuas / Changi)',
    },
    methodLabels: {
      udara: 'Jalur Udara',
      laut: 'Jalur Laut LCL',
      darat: 'Jalur Darat Lintas Batas',
      transfer_only: 'Transfer Valas Saja',
    },
    categoryLabels: {
      general: 'General Cargo',
      fashion: 'Fashion & Aksesoris',
      elektronik: 'Elektronik / Mesin Ringan',
      khusus: 'Barang Khusus / Lartas',
    },
    serviceLabels: {
      titip_beli: 'Titip Beli / Sourcing',
      forwarder: 'Forwarder (Kirim Saja)',
      transfer_valas: 'Jasa Transfer Valas (RMB/MYR/SGD)',
    },
    paymentStatusLabels: {
      belum_bayar: 'Belum Bayar',
      dp: 'DP / Sebagian',
      lunas: 'Lunas',
    },
    shipmentStepShortLabels: {
      order_confirmed: 'Konfirmasi',
      received_origin_warehouse: 'Gudang Asal',
      in_transit: 'Perjalanan',
      customs_clearance: 'Bea Cukai',
      arrived_pontianak: 'Gudang PNK',
      delivered: 'Diterima',
    },
    shipmentStatusLabels: {
      order_confirmed: 'Order Dikonfirmasi',
      received_origin_warehouse: 'Diterima di Gudang Asal',
      in_transit: 'Dalam Perjalanan ke Kalbar',
      customs_clearance: 'Proses Kepabeanan / Lintas Batas',
      arrived_pontianak: 'Tiba di Gudang Pontianak',
      out_for_delivery: 'Sedang Dikirim ke Alamat Tujuan',
      delivered: 'Paket Diterima Customer',
    },
  },
  api: {
    trackingMinChars:
      'Masukkan nomor resi, marking code, atau resi supplier minimal 3 karakter.',
    trackingNotFound: (query) =>
      `Resi atau Marking Code "${query}" tidak ditemukan. Periksa kembali kode Anda atau hubungi admin WhatsApp.`,
    trackingEventsError: 'Gagal memuat riwayat tracking.',
    trackingServerError: 'Terjadi kesalahan saat memeriksa status pengiriman.',
    rfqInvalidService: 'Jenis layanan tidak valid.',
    rfqMissingName: 'Nama lengkap wajib diisi.',
    rfqInvalidWhatsapp: 'Nomor WhatsApp aktif wajib diisi dengan benar.',
    rfqMissingDestination: 'Kota tujuan di Kalimantan Barat wajib dipilih.',
    rfqInvalidOrigin: 'Negara asal pengiriman tidak valid.',
    rfqInvalidMethod: 'Jalur pengiriman tidak valid.',
    rfqInvalidCategory: 'Kategori barang tidak valid.',
    rfqMissingProduct: 'Nama barang / deskripsi order wajib diisi.',
    rfqSaveError: 'Gagal menyimpan pengajuan RFQ. Silakan coba lagi.',
    rfqServerError: 'Terjadi kesalahan saat memproses pengajuan RFQ.',
    rfqWaTemplate: {
      greeting: (companyName) =>
        `Halo Admin ${companyName}, saya mengajukan permintaan penawaran (RFQ):`,
      code: 'Kode RFQ',
      service: 'Layanan',
      name: 'Nama',
      originRoute: 'Asal & Jalur',
      category: 'Kategori',
      product: 'Produk',
      productUrl: 'Link Produk',
      goodsValue: 'Nilai Barang',
      weight: 'Estimasi Berat',
      cbm: 'Estimasi Volume',
      calcEstimate: 'Estimasi Kalkulator',
      destination: 'Tujuan',
      notes: 'Catatan',
      closing:
        'Mohon bantuannya untuk penawaran resmi & estimasi HPP-nya. Terima kasih!',
    },
  },
};

const EN_DICTIONARY: Dictionary = {
  meta: {
    title:
      'Importir Pontianak | Import, Sourcing & Freight Forwarder from China, Malaysia & Singapore to West Kalimantan',
    description:
      'All-in sourcing (1688, Taobao, Alibaba), door-to-door freight forwarding, and supplier FX transfer from China, Malaysia/Kuching, and Singapore directly to Pontianak & West Kalimantan.',
  },
  brand: {
    subtitle: 'Easier Imports Across West Kalimantan',
  },
  nav: {
    skipToContent: 'Skip to main content',
    fxLabel: 'Exchange Rates:',
    adminPanel: 'Admin Panel',
    languageSwitcherAria: 'Select website language',
    mainNavAria: 'Main navigation',
    mobileNavAria: 'Mobile navigation',
    home: 'Home',
    services: 'Services',
    calculator: 'Calculator',
    tracking: 'Track Shipment',
    guide: 'Guide',
    rfq: 'RFQ Form',
    contact: 'Contact',
    serviceItems: {
      titipBeli: 'Purchasing & Sourcing Service',
      forwarder: 'Freight Forwarder (Ship Only)',
      transferValas: 'FX Transfer RMB / MYR / SGD',
      warehouse: 'Transit Warehouse Addresses',
    },
    guideItems: {
      workflow: '4-Step Workflow',
      warehouseMarking: 'Warehouses & Marking Code',
      faq: 'West Kalimantan Import FAQ',
    },
    chatWhatsapp: 'Chat WhatsApp',
    chatWhatsappAdmin: 'Chat Admin on WhatsApp',
    calculatorMobile: 'Import Calculator',
    trackingMobile: 'Track Shipment / Live Tracking',
    warehouseMobile: 'Transit Warehouses & Marking Code',
    rfqMobile: 'Submit Order / RFQ Form',
    faqMobile: 'Import FAQ',
    adminDashboard: 'Admin Dashboard',
    openMenuAria: 'Open navigation menu',
    closeMenuAria: 'Close navigation menu',
    waGreeting: (companyName) =>
      `Hello ${companyName} Admin, I would like to consult about import services to Pontianak / West Kalimantan.`,
  },
  hero: {
    imageAlt:
      'Container cargo ship and harbor cranes at Pontianak port, West Kalimantan',
    headline: 'Trusted Import & Freight Forwarder Partner in Pontianak',
    subtitle:
      'Shipping from China, Malaysia/Kuching & Singapore directly across West Kalimantan with transparent pricing and dedicated support.',
    bullets: [
      'All-In Cost Estimate to Pontianak',
      'Real-Time Cargo Tracking',
      'Responsive Dedicated Team',
    ],
    ctaPrimary: 'Calculate Import Cost',
    ctaSecondary: 'Explore Services',
  },
  services: {
    eyebrow: 'Our Services',
    heading: 'Complete & Reliable',
    cards: {
      titipBeli: {
        title: 'Assisted Purchasing / Sourcing',
        desc: 'Paste your 1688, Taobao, Alibaba, or Shopee MY link and we handle procurement & QC.',
      },
      forwarder: {
        title: 'Freight Forwarder',
        desc: 'Ship cargo from China, Kuching Malaysia & Singapore straight to Pontianak.',
      },
      transferValas: {
        title: 'FX Transfer RMB / MYR',
        desc: (fee) =>
          `Pay overseas suppliers securely in IDR with a flat ${fee} transfer fee.`,
      },
      gudang: {
        title: 'Warehouses & Marking Code',
        desc: 'Official Guangzhou, Kuching & Singapore warehouse addresses plus Marking Code tool.',
      },
    },
  },
  workflow: {
    eyebrow: 'How It Works',
    heading: 'Simple, Transparent, Reliable',
    steps: [
      {
        title: '1. Submit Product Link / Request',
        desc: 'Paste a supplier URL or upload item photos through the RFQ form',
      },
      {
        title: '2. Receive All-In Quotation',
        desc: 'Clear Rupiah breakdown covering goods, freight, and customs clearance',
      },
      {
        title: '3. QC & International Shipping',
        desc: 'Origin warehouse inspection, safe packing, and dispatch to Pontianak',
      },
      {
        title: '4. Receive Your Cargo',
        desc: 'Pick up at our Pontianak hub or forward to any West Kalimantan city',
      },
    ],
  },
  quickTrack: {
    title: 'Track Shipment / Live Tracking',
    subtitle: 'Monitor your cargo progress in real time',
    inputLabel: 'Enter Tracking Number or Marking Code',
    inputPlaceholder: 'Enter Tracking Number...',
    trackBtn: 'Track',
    demoLabel: 'Sample codes:',
  },
  scenarios: {
    heading: 'Real Route Simulations to West Kalimantan',
    shippingForwardingLabel: 'Intl Freight + Domestic Forwarding:',
    etaLabel: 'Estimated lead time:',
    daysUnit: 'days',
    loadInCalcBtn: 'Load in Calculator',
    dotAria: (idx) => `View simulation ${idx}`,
    prevAria: 'Previous simulation',
    nextAria: 'Next simulation',
    items: {
      'cn-lcl': {
        title: 'Commercial Machinery & Packaging from Yiwu / Guangzhou',
        routeSummary: 'China Sea LCL · 0.35 CBM · Electronics -> Pontianak',
        detail:
          'Includes sea customs clearance to Pontianak and inner-city courier delivery.',
      },
      'my-darat': {
        title: 'Cross-Border Wholesale Fashion from Kuching',
        routeSummary:
          'Malaysia Land Entikong/Aruk · 25 Kg · Fashion -> Singkawang',
        detail:
          'Fast 2 to 4 business days overland cross-border route from Sarawak directly to Singkawang.',
      },
      'sg-udara': {
        title: 'Express Industrial Spare Parts from Singapore',
        routeSummary:
          'Singapore Air Freight · 4 Kg · Electronics -> Pontianak Hub',
        detail:
          'Priority air dispatch from our Tuas Singapore hub ready for pickup in Pontianak.',
      },
    },
  },
  calculator: {
    title: 'Import Calculator',
    subtitle: 'Estimate your all-in landed import cost to Pontianak easily',
    badge: 'Pontianak & Kalbar',
    originTabLabels: {
      china: 'China',
      malaysia: 'Malaysia / Kuching',
      singapura: 'Singapore',
    },
    routeLabels: {
      air: 'Air Freight',
      sea: 'Sea Freight',
      landCbm: 'Land (CBM)',
      landKg: 'Land (Kg)',
    },
    inputs: {
      volumeCbm: 'Volume (CBM)',
      volumePlaceholder: 'e.g. 0.35',
      weightKg: 'Cargo Weight (Kg)',
      weightPlaceholder: 'Enter weight...',
      dimensions: 'Dimensions (L × W × H cm)',
      dimLengthAria: 'Length cm',
      dimWidthAria: 'Width cm',
      dimHeightAria: 'Height cm',
      dimLengthPlaceholder: 'L',
      dimWidthPlaceholder: 'W',
      dimHeightPlaceholder: 'H',
      categoryLabel: 'Cargo Category',
      destinationLabel: 'West Kalimantan Destination',
      includeGoodsLabel: (currency, feePercent) =>
        `Include goods value (${currency}) & ${feePercent}% sourcing fee`,
      goodsValueLabel: (currency) => `Goods Value (${currency})`,
      qtyLabel: 'Qty (Pcs)',
    },
    categoryOptions: {
      general: 'General Cargo',
      fashion: 'Fashion & Textiles',
      elektronik: 'Electronics / Machinery',
      khusus: 'Restricted / Special Cargo',
    },
    applyRfqBtn: 'Request Quotation with This Estimate',
    summary: {
      estimateTitle: 'Estimated Cost (All-In)',
      etaText: (min, max, qtyFormatted, unit, isVolumetric) =>
        `ETA ${min}-${max} days · ${qtyFormatted} ${unit}${isVolumetric ? ' (Volumetric)' : ''}`,
      intlShipping: "Int'l Freight + Customs:",
      localForwarding: 'Kalbar Forwarding:',
      goodsLine: (amount, currency) => `Goods (${amount} ${currency}):`,
      sourcingFee: 'Sourcing Fee:',
      hppPerUnit: (qty) => `Landed Cost / pc (${qty}):`,
      updatingRates: 'Route rates are currently being updated.',
      consultWaBtn: 'Consult Rates via WhatsApp',
    },
    waTemplate: (p) =>
      [
        `Hello ${p.companyName} Admin, I would like to discuss my calculator estimate:`,
        `- Origin: ${p.originLabel}`,
        `- Route: ${p.methodLabel}`,
        `- Category: ${p.categoryLabel}`,
        `- Chargeable Qty: ${p.chargeableQty} ${p.unit}`,
        `- Destination: ${p.destination}`,
        `- Estimated All-In Total: ${p.totalFormatted}`,
      ].join('\n'),
    rfqSummaryTemplate: (p) =>
      `Calculator simulation: ${p.originLabel} (${p.methodLabel}), ${p.chargeableQty} ${p.unit}, destination ${p.destination}. Estimated total ${p.totalFormatted}.`,
  },
  warehouse: {
    eyebrow: 'Official Transit Warehouses',
    heading: 'Warehouse Addresses & Marking Code Generator',
    descriptionPart1:
      'For Freight Forwarder (Ship Only) orders, ask your supplier in China, Malaysia, or Singapore to print your ',
    markingCodeHighlight: 'Marking Code',
    descriptionPart2: ' on every carton label so parcels are consolidated accurately.',
    previewLabel: 'Preview Your Marking Code (Enter Shop Initials)',
    previewPlaceholder: 'Shop / Brand Name',
    copyMarkingAria: 'Copy Marking Code',
    tablistAria: 'Select origin warehouse country',
    postalCode: 'Postal Code',
    localAddrLabel: 'Local Warehouse Address (For Supplier)',
    copyAddr: 'Copy Address',
    copyAddrAria: 'Copy local warehouse address',
    copied: 'Copied',
    copy: 'Copy',
    engAddrLabel: 'English Address / Reference',
    copyEngAria: 'Copy English warehouse address',
    recipientLabel: 'Recipient Format & Carton Label',
    copyRecipientAria: 'Copy recipient format',
    importantNotes: 'Important Instructions:',
    supportedMethodsLabel: 'Available routes from this warehouse:',
    emptyState: 'Transit warehouse addresses are loading or unavailable.',
    localizedMeta: {
      china: {
        name: 'Guangzhou Transit Warehouse (Importir Pontianak)',
        city: 'Guangzhou, Guangdong',
        notes:
          'Please ensure your supplier prints your Marking Code on the outer carton label and submits the domestic China courier tracking number (SF Express / ZTO / YTO / Yunda) to avoid mix-ups during consolidation.',
      },
      malaysia: {
        name: 'Kuching Transit Warehouse & Kuala Lumpur Hub',
        city: 'Kuching, Sarawak (Entikong/Aruk Border Crossing)',
        notes:
          'Shopee MY / Sarawak supplier parcels can ship directly to our Kuching warehouse for 2-4 day cross-border overland delivery to Pontianak. Peninsular orders can ship via KL Air Hub or Pos Laju to Kuching.',
      },
      singapura: {
        name: 'Tuas Singapore Transit Warehouse',
        city: 'Tuas, West Region, Singapore',
        notes:
          'Please attach the Commercial Invoice & Packing List (PDF/photo) when sending local Singapore deliveries (NinjaVan / J&T SG / Lalamove) to our Tuas warehouse.',
      },
    },
  },
  rfq: {
    eyebrow: 'Request For Quotation (RFQ)',
    heading: 'Request Sourcing, Warehouse Booking, or FX Transfer',
    subtitle:
      'Paste a supplier product link (1688, Taobao, Alibaba, Shopee MY) or upload an item photo. Your submission is saved and connected directly to our Pontianak WhatsApp team.',
    success: {
      badge: 'Submission Saved Successfully',
      thankYou: (name) => `Thank You, ${name}!`,
      desc: 'Your RFQ code has been recorded in our system. Click the WhatsApp button below to finalize your quotation with our admin.',
      codeLabel: 'RFQ Code:',
      copy: 'Copy',
      copied: 'Copied',
      sendWaBtn: 'Send Request to Admin WhatsApp',
      newOrderBtn: 'Create New Request',
    },
    formHeader: {
      title: 'Quotation Request Form',
      subtitle: 'Your request reaches our Pontianak operations team in seconds',
      fastReplyBadge: 'Fast WhatsApp Reply',
    },
    serviceSelector: {
      label: 'Select Service Type',
      ariaLabel: 'Select RFQ service type',
      items: {
        titip_beli: {
          title: 'Assisted Purchasing / Sourcing',
          desc: 'We buy from 1688, Taobao, Alibaba & run warehouse QC.',
        },
        forwarder: {
          title: 'Forwarder (Ship Only)',
          desc: 'Already have a supplier? Ship straight to our hub.',
        },
        transfer_valas: {
          title: 'FX Transfer RMB / MYR',
          desc: 'Pay supplier invoices safely via Alipay or bank transfer.',
        },
      },
    },
    prefillBanner: {
      title: 'Calculator Estimate Applied:',
      estimateTotalLabel: 'Estimated Total:',
      removeAria: 'Remove calculator estimate',
    },
    fields: {
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'e.g. Budi Santoso',
      whatsappLabel: 'Active WhatsApp Number *',
      whatsappPlaceholder: 'e.g. 081256789012',
      companyLabel: 'Store / Company Name (Optional)',
      companyPlaceholder: 'e.g. Borneo Jaya Store',
      originLabel: 'Origin Country *',
      originOptions: {
        china: 'China (Guangzhou / Yiwu)',
        malaysia: 'Malaysia / Kuching',
        singapura: 'Singapore',
      },
      methodLabel: 'Shipping Method *',
      methodOptions: {
        udara: 'Air Freight (Express)',
        laut: 'Sea Freight LCL (Cost-Effective CBM)',
        darat: 'Overland Cross-Border (Entikong / Aruk)',
      },
      categoryLabel: 'Cargo Category',
      categoryOptions: {
        general: 'General Cargo',
        fashion: 'Fashion & Accessories',
        elektronik: 'Electronics / Machinery',
        khusus: 'Restricted / Special Cargo',
      },
      destinationLabel: 'West Kalimantan Destination *',
      productNameLabel: 'Item Name / Order Description *',
      productNamePlaceholder:
        'e.g. Automatic Cup Sealer Machine / Women Bags 50 pcs',
      productUrlLabel: 'Product Link (1688 / Taobao / Alibaba / Shopee MY)',
      productUrlPlaceholder: 'https://detail.1688.com/offer/...',
      currencyLabel: 'Currency',
      currencyOptions: {
        RMB: 'RMB (Yuan)',
        MYR: 'MYR (Ringgit)',
        SGD: 'SGD',
        IDR: 'IDR',
      },
      goodsValueLabel: 'Goods / Transfer Value',
      goodsValuePlaceholder: 'e.g. 1500',
      qtyLabel: 'Qty (Pcs)',
      weightLabel: 'Est. Weight (Kg)',
      cbmLabel: 'Est. Volume (CBM)',
      optionalPlaceholder: 'optional',
      photoLabel: 'Upload Product Photo / Invoice (Optional, Max 3 MB)',
      photoAlt: 'Uploaded product photo preview',
      photoUploaded: 'Photo uploaded and ready to send',
      photoDeleteAria: 'Remove product photo',
      photoUploading: 'Uploading photo...',
      photoPick: 'Select JPG / PNG / WebP Image (Max 3 MB)',
      notesLabel:
        'Additional Notes (Variants, Local Tracking No., or Special Requests)',
      notesPlaceholder:
        'Example: Black 20 pcs, white 30 pcs. Please run QC before dispatch.',
    },
    footerDisclaimer:
      'Free quotation request. You review the official all-in offer before paying any deposit.',
    submitIdle: 'Submit Request & Continue to WhatsApp',
    submitLoading: 'Submitting RFQ...',
    errors: {
      uploadFail: 'Failed to upload image.',
      submitFail: 'Failed to submit RFQ request.',
      networkFail: 'Connection issue. Please try again in a moment.',
    },
  },
  faq: {
    eyebrow: 'West Kalimantan Import FAQ',
    heading: 'Frequently Asked Questions',
    description:
      'Practical answers covering import workflows, customs clearance, the Kuching-Entikong overland route, and distribution across West Kalimantan.',
    askWaBtn: 'Ask Directly via WhatsApp',
    waGreeting: (companyName) =>
      `Hello ${companyName} Admin, I have a question about import procedures and rates to Pontianak / West Kalimantan.`,
    items: [
      {
        q: 'How is Importir Pontianak different from forwarders based in Jakarta?',
        a: 'Jakarta forwarders usually quote freight only to their Jakarta warehouse, forcing West Kalimantan businesses to arrange and pay domestic air/sea cargo to Pontianak separately. At Importir Pontianak, calculator estimates cover end-to-end delivery straight to our Pontianak hub and onwards across West Kalimantan in a single transparent quote.',
      },
      {
        q: 'How does the Assisted Purchasing (1688 / Taobao / Alibaba / Shopee MY) service work?',
        a: 'Send your product link or photo via the RFQ form. Our team verifies supplier stock and sends an all-in Rupiah quote (goods cost, exchange rate, freight, customs clearance, and service fee). Once confirmed and paid, we purchase the items, verify quantity at our origin warehouse, and ship them to Pontianak.',
      },
      {
        q: 'Do I need to speak Mandarin or have an overseas bank account?',
        a: 'Not at all. Our team handles all supplier communication on 1688/Taobao as well as settlements in Yuan (RMB), Ringgit (MYR), and Singapore Dollars (SGD). You simply settle invoices in Rupiah via local bank transfer.',
      },
      {
        q: 'How long does overland shipping from Kuching / Malaysia to Pontianak take?',
        a: 'For parcels arriving at our Kuching (Sarawak) transit warehouse, cross-border trucking through Entikong or Aruk typically takes 2 to 4 business days to reach our Pontianak warehouse.',
      },
      {
        q: 'When do I receive my Marking Code and live tracking number?',
        a: 'For Forwarder (Ship Only) orders, you can generate your Marking Code right away in the Transit Warehouse section and register your domestic tracking number via the RFQ form or WhatsApp. Once confirmed by admin, your official tracking code (IMP-PNK-...) activates on the Track Shipment page.',
      },
      {
        q: 'Is there a minimum weight or volume to start importing?',
        a: 'Air freight starts from 1 Kg minimum, Kuching overland starts from 3 Kg, and Sea LCL freight starts from 0.1 CBM.',
      },
    ],
  },
  tracking: {
    title: 'Track Shipment / Live Tracking',
    subtitle:
      'Monitor your cargo status from China, Malaysia & Singapore to Pontianak in real time',
    searchAriaLabel: 'Tracking Number, Marking Code, or Supplier Tracking No.',
    searchPlaceholder: 'Enter Tracking Number (e.g. IMP-PNK-2026-0001)...',
    searchBtn: 'Track',
    searchingBtn: 'Searching...',
    demoLabel: 'Try sample codes:',
    demoLabels: {
      'IMP-PNK-2026-0001': 'China Sea (In Transit)',
      'IMP-PNK-2026-0002': 'Kuching Land (Arrived Pontianak)',
      'IMP-PNK-2026-0003': 'Singapore Air (Delivered)',
    },
    askWaBtn: 'Ask Admin via WhatsApp',
    waInquiryQuery: (companyName, q) =>
      `Hello ${companyName} Admin, I would like to check tracking / marking code: ${q}`,
    waUpdateResi: (companyName, trackingNo, markingCode) =>
      `Hello ${companyName} Admin, I would like an update on shipment ${trackingNo} (${markingCode}).`,
    result: {
      trackingNoLabel: 'Importir Pontianak Tracking Number',
      paymentPrefix: 'Payment:',
      outForDeliveryNotice: (city) =>
        `Your parcel is currently out for local courier delivery to your address in ${city}.`,
      customerMarking: 'Customer & Marking Code',
      markingPrefix: 'Marking:',
      routeMethod: 'Origin & Route',
      goodsWarehouse: 'Cargo & Warehouse Size',
      colliUnit: 'Cartons',
      destinationInvoice: 'Destination & Invoice',
      etaPrefix: 'ETA:',
      historyHeading: 'Shipment Tracking History',
      supplierResiPrefix: 'Supplier Tracking:',
      noEvents: 'No additional tracking logs yet for this shipment.',
      needUpdatePrompt:
        'Need an update on Pontianak pickup hours or invoice settlement?',
      contactAdminBtn: 'Contact Admin via WhatsApp',
    },
    empty: {
      title: "Don't have a tracking number yet or want to ship a new order?",
      desc: 'Calculate your freight cost or register your supplier parcel through our RFQ form.',
      cta: 'Submit Order / RFQ',
    },
    errors: {
      notFound: 'Shipment record not found.',
      serverError: 'Unable to reach tracking server. Please try again.',
    },
  },
  footer: {
    quickLink: 'Quick Links',
    links: {
      home: 'Home',
      services: 'Services',
      calculator: 'Calculator',
      warehouse: 'Transit Warehouses',
      tracking: 'Track Shipment',
      rfq: 'RFQ Form',
      faq: 'Import FAQ',
      admin: 'Admin Panel',
    },
    contactUs: 'Contact Us',
    quickAccess: 'Quick Access',
    waAria: 'WhatsApp Importir Pontianak',
    emailAria: 'Email Importir Pontianak',
    trackingAria: 'Live Tracking Page',
    warehouseAria: 'Transit Warehouse Locations',
    allRightsReserved: 'All Rights Reserved.',
    locationLabel: 'Pontianak, West Kalimantan',
    operatingHoursDefault: 'Monday - Saturday, 08:30 - 17:30 WIB',
    waGreeting: (companyName) =>
      `Hello ${companyName} Admin, I would like to consult about import services to Pontianak / West Kalimantan.`,
  },
  domain: {
    originLabels: {
      china: 'China (Guangzhou / Yiwu)',
      malaysia: 'Malaysia / Kuching',
      singapura: 'Singapore (Tuas / Changi)',
    },
    methodLabels: {
      udara: 'Air Freight',
      laut: 'Sea Freight LCL',
      darat: 'Overland Cross-Border',
      transfer_only: 'FX Transfer Only',
    },
    categoryLabels: {
      general: 'General Cargo',
      fashion: 'Fashion & Accessories',
      elektronik: 'Electronics / Light Machinery',
      khusus: 'Restricted / Special Cargo',
    },
    serviceLabels: {
      titip_beli: 'Assisted Purchasing / Sourcing',
      forwarder: 'Forwarder (Ship Only)',
      transfer_valas: 'FX Transfer Service (RMB/MYR/SGD)',
    },
    paymentStatusLabels: {
      belum_bayar: 'Unpaid',
      dp: 'Partial / Deposit',
      lunas: 'Paid in Full',
    },
    shipmentStepShortLabels: {
      order_confirmed: 'Confirmed',
      received_origin_warehouse: 'Origin Hub',
      in_transit: 'In Transit',
      customs_clearance: 'Customs',
      arrived_pontianak: 'PNK Hub',
      delivered: 'Delivered',
    },
    shipmentStatusLabels: {
      order_confirmed: 'Order Confirmed',
      received_origin_warehouse: 'Received at Origin Warehouse',
      in_transit: 'In Transit to West Kalimantan',
      customs_clearance: 'Customs / Cross-Border Clearance',
      arrived_pontianak: 'Arrived at Pontianak Warehouse',
      out_for_delivery: 'Out for Local Delivery',
      delivered: 'Delivered to Customer',
    },
  },
  api: {
    trackingMinChars:
      'Enter at least 3 characters for a tracking number, marking code, or supplier parcel ID.',
    trackingNotFound: (query) =>
      `Tracking or Marking Code "${query}" was not found. Please check your code or contact our admin on WhatsApp.`,
    trackingEventsError: 'Failed to load tracking timeline.',
    trackingServerError: 'An error occurred while checking shipment status.',
    rfqInvalidService: 'Invalid service type.',
    rfqMissingName: 'Full name is required.',
    rfqInvalidWhatsapp: 'Please enter a valid active WhatsApp number.',
    rfqMissingDestination: 'West Kalimantan destination city is required.',
    rfqInvalidOrigin: 'Invalid origin country.',
    rfqInvalidMethod: 'Invalid shipping method.',
    rfqInvalidCategory: 'Invalid cargo category.',
    rfqMissingProduct: 'Item name / order description is required.',
    rfqSaveError: 'Failed to save RFQ submission. Please try again.',
    rfqServerError: 'An error occurred while processing your RFQ request.',
    rfqWaTemplate: {
      greeting: (companyName) =>
        `Hello ${companyName} Admin, I am submitting a Request For Quotation (RFQ):`,
      code: 'RFQ Code',
      service: 'Service',
      name: 'Name',
      originRoute: 'Origin & Route',
      category: 'Category',
      product: 'Product',
      productUrl: 'Product Link',
      goodsValue: 'Goods Value',
      weight: 'Est. Weight',
      cbm: 'Est. Volume',
      calcEstimate: 'Calculator Estimate',
      destination: 'Destination',
      notes: 'Notes',
      closing:
        'Please assist with the official all-in quotation & landed cost estimate. Thank you!',
    },
  },
};

const ZH_DICTIONARY: Dictionary = {
  meta: {
    title: '坤甸进口通 Importir Pontianak | 中国、马来西亚、新加坡直达西加里曼丹进口专线与代购货代',
    description:
      '专注印尼西加里曼丹（坤甸及全境）的 1688/淘宝/阿里巴巴代购采购、双清包税门到门国际货代及 RMB/MYR/SGD 外汇代付服务。',
  },
  brand: {
    subtitle: '轻松进口，直达西加里曼丹',
  },
  nav: {
    skipToContent: '跳至正文内容',
    fxLabel: '交易汇率:',
    adminPanel: '管理后台',
    languageSwitcherAria: '切换网站语言',
    mainNavAria: '主导航',
    mobileNavAria: '移动端导航',
    home: '首页',
    services: '核心服务',
    calculator: '运费试算',
    tracking: '运单查询',
    guide: '操作指南',
    rfq: '在线询价',
    contact: '联系我们',
    serviceItems: {
      titipBeli: '代购采购 / 货源对接',
      forwarder: '国际货代（纯集运代发）',
      transferValas: '外汇代付 RMB / MYR / SGD',
      warehouse: '海外中转仓地址',
    },
    guideItems: {
      workflow: '4步合作流程',
      warehouseMarking: '中转仓与唛头生成',
      faq: '西加进口常见问题',
    },
    chatWhatsapp: 'WhatsApp 咨询',
    chatWhatsappAdmin: '联系客服 WhatsApp',
    calculatorMobile: '进口费用试算器',
    trackingMobile: '运单追踪 / 实时查询',
    warehouseMobile: '中转仓地址与唛头',
    rfqMobile: '提交需求 / RFQ 询价表',
    faqMobile: '进口常见问题 FAQ',
    adminDashboard: '管理员后台',
    openMenuAria: '打开导航菜单',
    closeMenuAria: '关闭导航菜单',
    waGreeting: (companyName) =>
      `您好 ${companyName} 客服，我想咨询从海外进口至坤甸 / 西加里曼丹的服务。`,
  },
  hero: {
    imageAlt: '印尼西加里曼丹坤甸港口集装箱货轮与门式起重机',
    headline: '值得信赖的坤甸进口代购与国际货代专家',
    subtitle:
      '覆盖中国、马来西亚/古晋及新加坡直达印尼西加里曼丹全境，报价透明、双清包税、专业团队全程护航。',
    bullets: [
      '一口价全包直达坤甸',
      '货物轨迹实时追踪',
      '专业中文与印尼语团队对接',
    ],
    ctaPrimary: '立即试算进口费用',
    ctaSecondary: '了解全部服务',
  },
  services: {
    eyebrow: '核心服务',
    heading: '一站式进口解决方案',
    cards: {
      titipBeli: {
        title: '代购采购 / Sourcing',
        desc: '粘贴 1688、淘宝、阿里巴巴或 Shopee 马来链接，我们代办采购、质检并安排发货。',
      },
      forwarder: {
        title: '国际货代（集运专线）',
        desc: '支持中国、马来古晋及新加坡直发坤甸双清门到门。',
      },
      transferValas: {
        title: 'RMB / MYR 货款代付',
        desc: (fee) =>
          `支持印尼盾结算代付供应商货款，单笔固定手续费仅 ${fee}。`,
      },
      gudang: {
        title: '海外中转仓与唛头',
        desc: '提供广州、古晋及新加坡专属中转仓地址与货物唛头生成器。',
      },
    },
  },
  workflow: {
    eyebrow: '服务流程',
    heading: '简单、透明、省心',
    steps: [
      {
        title: '1. 发送商品链接 / 询价需求',
        desc: '通过 RFQ 表单提交商品链接或上传商品图片',
      },
      {
        title: '2. 获取全包报价单',
        desc: '印尼盾明细报价：含货款、国际运费及清关税费',
      },
      {
        title: '3. 验货打包与发运',
        desc: '始发仓收货核验、安全加固包装并发往坤甸',
      },
      {
        title: '4. 坤甸收货或全境派送',
        desc: '支持坤甸仓库自提或转运至西加各县市地址',
      },
    ],
  },
  quickTrack: {
    title: '运单查询 / 实时追踪',
    subtitle: '随时掌握货物国际运输与清关动态',
    inputLabel: '输入运单号或货物唛头',
    inputPlaceholder: '请输入运单号 (如 IMP-PNK-2026-0001)...',
    trackBtn: '查询',
    demoLabel: '示例单号:',
  },
  scenarios: {
    heading: '西加里曼丹真实线路成本试算示例',
    shippingForwardingLabel: '国际运费 + 西加境内转运:',
    etaLabel: '预计时效:',
    daysUnit: '天',
    loadInCalcBtn: '载入试算器',
    dotAria: (idx) => `查看示例线路 ${idx}`,
    prevAria: '上一个示例',
    nextAria: '下一个示例',
    items: {
      'cn-lcl': {
        title: '义乌 / 广州商用设备与包装耗材海运拼箱',
        routeSummary: '中国海运 LCL · 0.35 CBM · 电子设备 -> 坤甸市区',
        detail: '报价已含海运双清关至坤甸仓库及坤甸市区专车派送。',
      },
      'my-darat': {
        title: '古晋跨境陆运服饰鞋包批发补货',
        routeSummary: '马来陆运 Entikong/Aruk 口岸 · 25 Kg · 服饰 -> 山口洋',
        detail: '砂拉越直发 2 至 4 个工作日陆运通关，直达山口洋市区。',
      },
      'sg-udara': {
        title: '新加坡工业精密配件空运加急专线',
        routeSummary: '新加坡空运 · 4 Kg · 电子配件 -> 坤甸仓库自提',
        detail: '新加坡大士仓直飞快速清关，到货坤甸仓即可通知提货。',
      },
    },
  },
  calculator: {
    title: '进口全包试算器',
    subtitle: '一键估算直达坤甸及西加各市的全包进口成本',
    badge: '坤甸及西加',
    originTabLabels: {
      china: '中国',
      malaysia: '马来西亚 / 古晋',
      singapura: '新加坡',
    },
    routeLabels: {
      air: '空运专线',
      sea: '海运拼箱',
      landCbm: '陆运 (按方 CBM)',
      landKg: '陆运 (按公斤 Kg)',
    },
    inputs: {
      volumeCbm: '货物体积 (CBM)',
      volumePlaceholder: '例: 0.35',
      weightKg: '货物重量 (Kg)',
      weightPlaceholder: '输入重量...',
      dimensions: '单件尺寸 (长 × 宽 × 高 cm)',
      dimLengthAria: '长度厘米',
      dimWidthAria: '宽度厘米',
      dimHeightAria: '高度厘米',
      dimLengthPlaceholder: '长',
      dimWidthPlaceholder: '宽',
      dimHeightPlaceholder: '高',
      categoryLabel: '货物类别',
      destinationLabel: '西加目的城市',
      includeGoodsLabel: (currency, feePercent) =>
        `同时估算货值 (${currency}) 与代购服务费 ${feePercent}%`,
      goodsValueLabel: (currency) => `货物总价 (${currency})`,
      qtyLabel: '数量 (件)',
    },
    categoryOptions: {
      general: '普货 (General Cargo)',
      fashion: '服装鞋帽与纺织品',
      elektronik: '电子产品 / 小型机械',
      khusus: '敏感货 / 特殊品类',
    },
    applyRfqBtn: '携带此估算结果提交询价单',
    summary: {
      estimateTitle: '预计总费用 (全包 All-In)',
      etaText: (min, max, qtyFormatted, unit, isVolumetric) =>
        `预计时效 ${min}-${max} 天 · ${qtyFormatted} ${unit}${isVolumetric ? ' (按抛重计费)' : ''}`,
      intlShipping: '国际运费 + 双清税费:',
      localForwarding: '西加末端转运费:',
      goodsLine: (amount, currency) => `货物成本 (${amount} ${currency}):`,
      sourcingFee: '代购服务费:',
      hppPerUnit: (qty) => `单件综合到手价 (${qty} 件):`,
      updatingRates: '该线路运价正在更新中。',
      consultWaBtn: '通过 WhatsApp 咨询详细报价',
    },
    waTemplate: (p) =>
      [
        `您好 ${p.companyName} 客服，我想咨询试算器中的运输报价：`,
        `- 始发国: ${p.originLabel}`,
        `- 渠道: ${p.methodLabel}`,
        `- 品类: ${p.categoryLabel}`,
        `- 计费数量: ${p.chargeableQty} ${p.unit}`,
        `- 目的地: ${p.destination}`,
        `- 预计全包总价: ${p.totalFormatted}`,
      ].join('\n'),
    rfqSummaryTemplate: (p) =>
      `运费试算参考：${p.originLabel} (${p.methodLabel})，${p.chargeableQty} ${p.unit}，发往 ${p.destination}，预计全包 ${p.totalFormatted}。`,
  },
  warehouse: {
    eyebrow: '官方海外中转仓',
    heading: '中转仓收货地址与唛头生成器',
    descriptionPart1:
      '使用纯货代集运服务时，请务必让中国、马来西亚或新加坡供应商在纸箱外贴上您的专属 ',
    markingCodeHighlight: '货物唛头 (Marking Code)',
    descriptionPart2: '，避免合箱入库时错漏混淆。',
    previewLabel: '实时生成您的专属唛头（输入店铺名称或缩写）',
    previewPlaceholder: '店铺名 / 客户缩写',
    copyMarkingAria: '复制货物唛头',
    tablistAria: '选择海外中转仓国家',
    postalCode: '邮编',
    localAddrLabel: '当地语言仓库地址（直接发给供应商）',
    copyAddr: '复制仓库地址',
    copyAddrAria: '复制当地仓库地址',
    copied: '已复制',
    copy: '复制',
    engAddrLabel: '英文参考地址',
    copyEngAria: '复制英文参考地址',
    recipientLabel: '收件人格式与纸箱外贴唛头',
    copyRecipientAria: '复制收件人格式',
    importantNotes: '重要操作提示:',
    supportedMethodsLabel: '该仓库支持的发货渠道:',
    emptyState: '中转仓地址正在加载或暂未配置。',
    localizedMeta: {
      china: {
        name: '广州白云中转仓（Importir Pontianak 坤甸专线）',
        city: '中国广东省广州市',
        notes:
          '请务必在纸箱外标注您的专属唛头 (Marking Code)，并将国内快递单号（顺丰 / 中通 / 圆通 / 韵达等）提交给客服或填写至 RFQ 表单，以便仓库精准核对入库。',
      },
      malaysia: {
        name: '马来西亚古晋跨境仓 & 吉隆坡集散站',
        city: '砂拉越古晋（经 Entikong / Aruk 陆路口岸）',
        notes:
          'Shopee MY 或砂拉越本地货源可直接寄至古晋仓，经陆路快线 2-4 个工作日直达坤甸；西马货物可发往吉隆坡空运站或邮寄至古晋仓。',
      },
      singapura: {
        name: '新加坡大士 (Tuas) 中转仓',
        city: '新加坡西部大士工业区',
        notes:
          '货物通过本地物流（NinjaVan / J&T SG / Lalamove）送达大士仓时，请随附商业发票与装箱单（PDF 或照片）发给客服建档。',
      },
    },
  },
  rfq: {
    eyebrow: '在线询价单 (RFQ)',
    heading: '提交代购需求、仓位预约或货款代付',
    subtitle:
      '粘贴 1688、淘宝、阿里巴巴、Shopee 马来商品链接或上传图片，系统将自动保存单号并一键对接坤甸客服 WhatsApp。',
    success: {
      badge: '询价申请已成功提交',
      thankYou: (name) => `感谢您的信任，${name}！`,
      desc: '您的 RFQ 询价单号已录入系统，请点击下方 WhatsApp 按钮联系客服确认最终报价。',
      codeLabel: 'RFQ 单号:',
      copy: '复制',
      copied: '已复制',
      sendWaBtn: '发送询价单至客服 WhatsApp',
      newOrderBtn: '继续提交新询价',
    },
    formHeader: {
      title: '进口报价需求申请表',
      subtitle: '提交后几秒内即同步至坤甸业务团队',
      fastReplyBadge: 'WhatsApp 极速响应',
    },
    serviceSelector: {
      label: '选择服务类型',
      ariaLabel: '选择 RFQ 服务类型',
      items: {
        titip_beli: {
          title: '代购采购 / Sourcing',
          desc: '我们代为在 1688、淘宝、阿里采购并在仓库验货。',
        },
        forwarder: {
          title: '国际货代（纯发运）',
          desc: '您已自主采购，只需将货物发至我司海外仓。',
        },
        transfer_valas: {
          title: 'RMB / MYR 货款代付',
          desc: '代付供应商支付宝或银行账户，安全合规。',
        },
      },
    },
    prefillBanner: {
      title: '已自动填入试算器估算参数:',
      estimateTotalLabel: '预计总价:',
      removeAria: '清除试算器参数',
    },
    fields: {
      fullNameLabel: '联系人姓名 *',
      fullNamePlaceholder: '例: Budi Santoso / 林先生',
      whatsappLabel: '常用 WhatsApp 号码 *',
      whatsappPlaceholder: '例: 081256789012',
      companyLabel: '店铺 / 公司名称（选填）',
      companyPlaceholder: '例: Borneo Jaya 商行',
      originLabel: '始发国家 *',
      originOptions: {
        china: '中国（广州 / 义乌）',
        malaysia: '马来西亚 / 古晋',
        singapura: '新加坡',
      },
      methodLabel: '运输方式 *',
      methodOptions: {
        udara: '空运专线（快速）',
        laut: '海运拼箱 LCL（高性价比）',
        darat: '跨境陆运 Entikong / Aruk',
      },
      categoryLabel: '货物类别',
      categoryOptions: {
        general: '普货 (General Cargo)',
        fashion: '服饰箱包与配件',
        elektronik: '电子产品 / 机械',
        khusus: '敏感货 / 特殊品类',
      },
      destinationLabel: '西加目的城市 *',
      productNameLabel: '商品名称 / 订单说明 *',
      productNamePlaceholder: '例: 全自动封口机 / 女式手提包 50 个',
      productUrlLabel: '商品链接 (1688 / 淘宝 / 阿里巴巴 / Shopee MY)',
      productUrlPlaceholder: 'https://detail.1688.com/offer/...',
      currencyLabel: '交易币种',
      currencyOptions: {
        RMB: 'RMB (人民币)',
        MYR: 'MYR (马币林吉特)',
        SGD: 'SGD (新币)',
        IDR: 'IDR (印尼盾)',
      },
      goodsValueLabel: '货值 / 代付金额',
      goodsValuePlaceholder: '例: 1500',
      qtyLabel: '数量 (件)',
      weightLabel: '预估重量 (Kg)',
      cbmLabel: '预估体积 (CBM)',
      optionalPlaceholder: '选填',
      photoLabel: '上传商品图片 / 发票凭证（选填，最大 3 MB）',
      photoAlt: '已上传的商品图片预览',
      photoUploaded: '图片上传成功，可随单提交',
      photoDeleteAria: '删除已上传图片',
      photoUploading: '正在上传图片...',
      photoPick: '选择 JPG / PNG / WebP 图片（最大 3 MB）',
      notesLabel: '备注信息（规格颜色、国内快递单号或特别要求）',
      notesPlaceholder: '例：黑色 20 件、白色 30 件，发货前请帮忙开箱核对数量。',
    },
    footerDisclaimer: '提交询价完全免费，确认正式全包报价后再支付定金。',
    submitIdle: '提交询价单并跳转 WhatsApp',
    submitLoading: '正在提交 RFQ...',
    errors: {
      uploadFail: '上传图片失败，请重试。',
      submitFail: '提交询价单失败，请检查输入信息。',
      networkFail: '网络连接异常，请稍后再试。',
    },
  },
  faq: {
    eyebrow: '西加进口百科 FAQ',
    heading: '常见问题解答',
    description:
      '为您详细解答从海外采购、双清通关、古晋 Entikong 陆运专线到西加里曼丹各县市派送的常见疑问。',
    askWaBtn: 'WhatsApp 在线提问',
    waGreeting: (companyName) =>
      `您好 ${companyName} 客服，我想咨询进口流程和发往坤甸 / 西加里曼丹的运费标准。`,
    items: [
      {
        q: '通过 Importir Pontianak 发货与通过雅加达货代有什么区别？',
        a: '多数雅加达货代只报送到雅加达仓库的运费，西加卖家还需额外自行安排并支付雅加达至坤甸的国内空运或船运费用。在 Importir Pontianak，我们的试算报价直接包含清关直达坤甸仓及转运西加各县市的一口价服务。',
      },
      {
        q: '代购采购服务 (1688 / 淘宝 / 阿里巴巴 / Shopee MY) 如何操作？',
        a: '您只需在 RFQ 表单提交商品链接或上传图片，我们团队会向供应商核实库存并出具印尼盾全包报价（含货款、汇率、运费、税费及服务费）。确认付款后，我们代为下单并在始发仓验货后直接发往坤甸。',
      },
      {
        q: '不会中文或没有海外银行账户/支付宝可以进口吗？',
        a: '完全没问题。1688/淘宝供应商沟通以及人民币 (RMB)、马币 (MYR)、新币 (SGD) 付款全部由我们团队代办，您只需使用印尼本地银行转账印尼盾 (IDR) 即可。',
      },
      {
        q: '从马来西亚古晋陆运到坤甸需要几天？',
        a: '货物进入砂拉越古晋中转仓后，经 Entikong 或 Aruk 陆路口岸清关直达坤甸仓库，通常需要 2 至 4 个工作日。',
      },
      {
        q: '什么时候能拿到货物唛头 (Marking Code) 和追踪运单号？',
        a: '纯货代客户可直接在页面“海外中转仓”生成专属唛头，并在 RFQ 或 WhatsApp 登记供应商快递单号。管理员确认建单后，即可通过正式运单号 (IMP-PNK-...) 在查询页实时追踪。',
      },
      {
        q: '起运门槛要求是多少重量或体积？',
        a: '空运专线低至 1 Kg 起运，古晋跨境陆运 3 Kg 起运，海运拼箱 LCL 低至 0.1 CBM 起运。',
      },
    ],
  },
  tracking: {
    title: '运单查询 / 实时物流追踪',
    subtitle: '实时掌握中国、马来西亚及新加坡发往坤甸的货物状态',
    searchAriaLabel: '运单号、货物唛头或供应商单号',
    searchPlaceholder: '输入运单号 (例: IMP-PNK-2026-0001)...',
    searchBtn: '查询',
    searchingBtn: '查询中...',
    demoLabel: '体验示例单号:',
    demoLabels: {
      'IMP-PNK-2026-0001': '中国海运（运输中）',
      'IMP-PNK-2026-0002': '古晋陆运（已抵坤甸）',
      'IMP-PNK-2026-0003': '新加坡空运（已签收）',
    },
    askWaBtn: '联系客服 WhatsApp 查询',
    waInquiryQuery: (companyName, q) =>
      `您好 ${companyName} 客服，我想查询运单号 / 唛头状态：${q}`,
    waUpdateResi: (companyName, trackingNo, markingCode) =>
      `您好 ${companyName} 客服，我想咨询运单 ${trackingNo} (${markingCode}) 的最新物流进度。`,
    result: {
      trackingNoLabel: 'Importir Pontianak 正式运单号',
      paymentPrefix: '付款状态:',
      outForDeliveryNotice: (city) =>
        `您的包裹正在安排本地快递或专车派送往 ${city}，请保持电话畅通。`,
      customerMarking: '客户与专属唛头',
      markingPrefix: '唛头:',
      routeMethod: '线路与运输方式',
      goodsWarehouse: '货物描述与入仓规格',
      colliUnit: '件 (箱)',
      destinationInvoice: '目的地与账单',
      etaPrefix: '预计到达:',
      historyHeading: '货物物流轨迹详情',
      supplierResiPrefix: '供应商快递单号:',
      noEvents: '该运单暂无更多历史节点记录。',
      needUpdatePrompt: '需要确认坤甸仓库提货时间或发票付款事宜？',
      contactAdminBtn: 'WhatsApp 联系管理员',
    },
    empty: {
      title: '还没有运单号，或准备安排新一批货物发运？',
      desc: '立即使用运费试算器估算成本，或通过 RFQ 表单登记您的海外采购需求。',
      cta: '提交询价 / 发货单',
    },
    errors: {
      notFound: '未查询到相关运单记录。',
      serverError: '物流查询服务器连接异常，请稍后重试。',
    },
  },
  footer: {
    quickLink: '快捷导航',
    links: {
      home: '首页',
      services: '核心服务',
      calculator: '运费试算',
      warehouse: '海外中转仓',
      tracking: '运单查询',
      rfq: '在线询价',
      faq: '常见问题',
      admin: '管理后台',
    },
    contactUs: '联系方式',
    quickAccess: '快速入口',
    waAria: 'Importir Pontianak WhatsApp',
    emailAria: 'Importir Pontianak 官方邮箱',
    trackingAria: '实时运单查询页面',
    warehouseAria: '海外中转仓地址位置',
    allRightsReserved: '保留所有权利。',
    locationLabel: '印尼西加里曼丹省坤甸市',
    operatingHoursDefault: '周一至周六 08:30 - 17:30 WIB (西加时间)',
    waGreeting: (companyName) =>
      `您好 ${companyName} 客服，我想咨询发往坤甸 / 西加里曼丹的进口业务。`,
  },
  domain: {
    originLabels: {
      china: '中国（广州 / 义乌）',
      malaysia: '马来西亚 / 古晋',
      singapura: '新加坡（大士 / 樟宜）',
    },
    methodLabels: {
      udara: '空运专线',
      laut: '海运拼箱 LCL',
      darat: '跨境陆运专线',
      transfer_only: '纯外汇代付',
    },
    categoryLabels: {
      general: '普货 (General Cargo)',
      fashion: '服装鞋包饰品',
      elektronik: '电子产品 / 小型机械',
      khusus: '敏感货 / 特殊限制品',
    },
    serviceLabels: {
      titip_beli: '代购采购 / Sourcing',
      forwarder: '国际货代（纯发运）',
      transfer_valas: '外汇代付服务 (RMB/MYR/SGD)',
    },
    paymentStatusLabels: {
      belum_bayar: '未付款',
      dp: '已付定金',
      lunas: '已结清',
    },
    shipmentStepShortLabels: {
      order_confirmed: '已确认',
      received_origin_warehouse: '始发仓收货',
      in_transit: '国际运输中',
      customs_clearance: '清关通关',
      arrived_pontianak: '抵达坤甸仓',
      delivered: '已签收',
    },
    shipmentStatusLabels: {
      order_confirmed: '订单已确认',
      received_origin_warehouse: '已入海外始发仓',
      in_transit: '正发往西加里曼丹途中',
      customs_clearance: '清关 / 口岸通关中',
      arrived_pontianak: '已抵达坤甸仓库',
      out_for_delivery: '正在派送至收货地址',
      delivered: '客户已签收完成',
    },
  },
  api: {
    trackingMinChars: '请至少输入 3 个字符的运单号、唛头或供应商单号。',
    trackingNotFound: (query) =>
      `未找到单号或唛头 "${query}"，请核对后重试或联系客服 WhatsApp。`,
    trackingEventsError: '加载物流轨迹失败。',
    trackingServerError: '查询物流状态时发生系统错误。',
    rfqInvalidService: '服务类型无效。',
    rfqMissingName: '请填写联系人姓名。',
    rfqInvalidWhatsapp: '请填写有效的常用 WhatsApp 号码。',
    rfqMissingDestination: '请选择西加里曼丹目的城市。',
    rfqInvalidOrigin: '始发国家无效。',
    rfqInvalidMethod: '运输方式无效。',
    rfqInvalidCategory: '货物类别无效。',
    rfqMissingProduct: '请填写商品名称或订单说明。',
    rfqSaveError: '保存 RFQ 询价单失败，请重试。',
    rfqServerError: '处理 RFQ 请求时发生系统错误。',
    rfqWaTemplate: {
      greeting: (companyName) =>
        `您好 ${companyName} 客服，我提交了一份进口询价申请 (RFQ)：`,
      code: 'RFQ 单号',
      service: '服务类型',
      name: '联系人',
      originRoute: '始发国与渠道',
      category: '货物类别',
      product: '商品名称',
      productUrl: '商品链接',
      goodsValue: '货值',
      weight: '预估重量',
      cbm: '预估体积',
      calcEstimate: '试算参考总价',
      destination: '目的城市',
      notes: '备注',
      closing: '请协助提供正式全包报价与到手成本明细，谢谢！',
    },
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  id: ID_DICTIONARY,
  en: EN_DICTIONARY,
  zh: ZH_DICTIONARY,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? ID_DICTIONARY;
}

export function formatDestinationLabel(cityName: string, locale: Locale): string {
  if (locale === 'en') {
    if (cityName === 'Pontianak (Ambil di Gudang)') {
      return 'Pontianak (Warehouse Pickup)';
    }
    if (cityName === 'Pontianak (Kurir Dalam Kota)') {
      return 'Pontianak (Inner-City Courier)';
    }
  }
  if (locale === 'zh') {
    if (cityName === 'Pontianak (Ambil di Gudang)') {
      return '坤甸市区（仓库自提）';
    }
    if (cityName === 'Pontianak (Kurir Dalam Kota)') {
      return '坤甸市区（同城专送）';
    }
  }
  return cityName;
}

export function formatOperatingHours(raw: string, locale: Locale): string {
  if (locale === 'id') return raw;
  const normalized = raw.toLowerCase();
  if (normalized.includes('senin') && normalized.includes('sabtu')) {
    return locale === 'en'
      ? EN_DICTIONARY.footer.operatingHoursDefault
      : ZH_DICTIONARY.footer.operatingHoursDefault;
  }
  return raw;
}
