import type { Locale } from './types';

export interface ExplainerSceneCopy {
  pillLabel: string;
  badge: string;
  headline: string;
  subline: string;
  subtitle: string;
}

export interface ExplainerDictionary {
  subtitleIntro: string;
  modeInteractive: string;
  modeMp4: string;
  playBtn: string;
  pauseBtn: string;
  restartBtn: string;
  muteBtn: string;
  unmuteBtn: string;
  speedLabel: string;
  downloadMp4Btn: string;
  shareWaBtn: string;
  shareWaMessage: (siteUrl: string) => string;
  ctaRegister: string;
  ctaNewOrder: string;
  ctaCatalog: string;
  tapToPlayOverlay: string;
  scenes: [
    ExplainerSceneCopy,
    ExplainerSceneCopy,
    ExplainerSceneCopy,
    ExplainerSceneCopy,
    ExplainerSceneCopy,
  ];
  visuals: {
    scene1Pills: [string, string, string];
    scene1FloatTitle: string;
    scene1FloatDesc: string;
    scene2CardHeader: string;
    scene2MemberLabel: string;
    scene2SyncNote: string;
    scene3CustomUrlLabel: string;
    scene3QuoteHeader: string;
    scene3QuoteItem: string;
    scene3QuoteSpec: string;
    scene3QuoteTotalLabel: string;
    scene3QuoteApproved: string;
    scene3QuotePending: string;
    scene4BatchHeader: string;
    scene4BatchSub: string;
    scene4AllInBadge: string;
    scene4FilledLabel: string;
    scene4RemainLabel: string;
    scene4MemberSlot: string;
    scene5ResiHeader: string;
    scene5Milestones: [string, string, string, string];
    scene5CtaTitle: string;
    scene5CtaDesc: string;
  };
}

const ID_EXPLAINER: ExplainerDictionary = {
  subtitleIntro:
    'Tonton penjelasan 1 menit bagaimana sistem Member, Marking Code, dan konsolidasi LCL bekerja — atau unduh versi MP4 untuk dibagikan ke grup WhatsApp.',
  modeInteractive: 'Interactive Player (ID / EN / 中文)',
  modeMp4: 'Video MP4 (Share WA)',
  playBtn: 'Putar',
  pauseBtn: 'Jeda',
  restartBtn: 'Ulang',
  muteBtn: 'Bisukan',
  unmuteBtn: 'Suara',
  speedLabel: 'Kecepatan',
  downloadMp4Btn: 'Download MP4 (1,7 MB)',
  shareWaBtn: 'Bagikan Video ke Grup WA',
  shareWaMessage: (siteUrl) =>
    `Halo rekan importir Pontianak & Kalbar! Cek video singkat cara kerja titip beli China 1688 & gabung kontainer LCL bersama mulai 0,1 CBM di Importir Pontianak:\n\nTonton / download videonya langsung di: ${siteUrl}/#alur-kerja\nLink file MP4: ${siteUrl}/videos/explainer-cara-kerja-importir-pontianak.mp4`,
  ctaRegister: 'Daftar Member Gratis',
  ctaNewOrder: 'Buat Order Sekarang',
  ctaCatalog: 'Lihat Katalog LCL',
  tapToPlayOverlay: 'Putar Explainer Cara Kerja (01:02)',
  scenes: [
    {
      pillLabel: 'Intro',
      badge: 'SOLUSI IMPOR LCL KALBAR',
      headline: 'Impor China, Malaysia & Singapura Mulai 0,1 CBM Saja',
      subline:
        'Tidak perlu beli 1 kontainer penuh. Gabung pengiriman LCL bersama dengan harga all-in sampai ke Pontianak & seluruh Kalimantan Barat.',
      subtitle:
        'Mau impor barang ke Pontianak tanpa harus sewa 1 kontainer penuh? Mulai dari 0,1 kubik saja.',
    },
    {
      pillLabel: '1. Daftar',
      badge: 'LANGKAH 1 · REGISTRASI 30 DETIK',
      headline: 'Daftar Member Gratis & Langsung Dapat Marking Code',
      subline:
        'Setiap Member mendapat ID resmi dan Marking Code permanen untuk gudang transit Guangzhou, Kuching, dan Tuas Singapura.',
      subtitle:
        'Daftar akun Member gratis dalam 30 detik dan langsung dapatkan Marking Code pribadi untuk 3 gudang transit.',
    },
    {
      pillLabel: '2. Order',
      badge: 'LANGKAH 2 · KATALOG, TITIP BELI & PENAWARAN',
      headline: 'Pilih Katalog Cuan 1688 atau Ajukan Link Supplier',
      subline:
        'Ajukan Titip Beli, Forwarder, atau Transfer Valas. Tim kami hitung harga all-in hingga Pontianak untuk Anda setujui di Portal.',
      subtitle:
        'Pilih produk cuan di Katalog atau paste link 1688, lalu setujui penawaran resmi all-in di dashboard Member.',
    },
    {
      pillLabel: '3. Kloter LCL',
      badge: 'LANGKAH 3 · KONSOLIDASI KONTAINER BERSAMA',
      headline: 'Barang Digabung ke Kloter Kontainer LCL Kalbar',
      subline:
        'Di gudang asal, kargo Anda di-QC dan digabung bersama importir Kalbar lain — ongkir jauh lebih hemat, transparan per CBM/kg, sudah termasuk bea cukai.',
      subtitle:
        'Barang Anda digabung ke kontainer LCL bersama importir Kalbar lain — hemat ongkir, transparan & all-in bea cukai.',
    },
    {
      pillLabel: '4. Tracking',
      badge: 'LANGKAH 4 · TRACKING & TERIMA DI KALBAR',
      headline: 'Lacak Resi Real-Time & Terima Hingga Seluruh Kalbar',
      subline:
        'Pantau milestone kapal, unggah bukti transfer DP/pelunasan di dashboard, dan ambil barang di Pontianak atau teruskan ke Singkawang, Sintang, Ketapang.',
      subtitle:
        'Pantau tracking real-time dari dashboard Member hingga barang tiba di Pontianak & seluruh Kalimantan Barat.',
    },
  ],
  visuals: {
    scene1Pills: ['Mulai 0,1 CBM', '3 Hub: CN · MY · SG', '15 Kota Kalbar'],
    scene1FloatTitle: 'Hemat Biaya Kontainer s/d 60%',
    scene1FloatDesc: 'Belanja grosir 1688 digabung 1 kontainer ke Pontianak',
    scene2CardHeader: 'KARTU MEMBER IMPORTIR',
    scene2MemberLabel: 'MEMBER CODE RESMI',
    scene2SyncNote: 'Otomatis sinkron dengan kuotasi, tagihan & resi',
    scene3CustomUrlLabel: 'Atau paste link 1688 / Alibaba Anda sendiri:',
    scene3QuoteHeader: 'PENAWARAN RESMI ALL-IN ADMIN',
    scene3QuoteItem: 'Grinder Kopi Komersial 600N (5 Unit)',
    scene3QuoteSpec: 'Estimasi 0,35 CBM · Jalur Laut Guangzhou -> PNK',
    scene3QuoteTotalLabel: 'Total Biaya All-In Sampai Pontianak:',
    scene3QuoteApproved: 'PENAWARAN DISETUJUI MEMBER',
    scene3QuotePending: 'Klik Setujui Penawaran di Portal',
    scene4BatchHeader: 'KLOTER AKTIF: LCL-GZ-PNK-2612A',
    scene4BatchSub: 'Guangzhou -> Pontianak · 20ft (28 CBM)',
    scene4AllInBadge: 'ALL-IN BEA CUKAI',
    scene4FilledLabel: 'Terisi Bersama',
    scene4RemainLabel: 'Sisa Slot',
    scene4MemberSlot: 'PAKET ANDA (Member)',
    scene5ResiHeader: 'RESI: IMP-PNK-2026-0001',
    scene5Milestones: [
      'Diterima & Diukur di Gudang Guangzhou',
      'Stuffing & Kapal Berlayar Menuju Kalbar',
      'Customs Clearance Selesai Lancar',
      'Tiba di Pontianak & Diteruskan ke Kalbar',
    ],
    scene5CtaTitle: 'Siap Mulai Impor Lebih Hemat?',
    scene5CtaDesc: 'Daftar Member gratis sekarang & ikut kloter terdekat.',
  },
};

const EN_EXPLAINER: ExplainerDictionary = {
  subtitleIntro:
    'Watch our 1-minute overview showing how Member registration, personal Marking Codes, and shared LCL consolidation work — or download the MP4 for WhatsApp.',
  modeInteractive: 'Interactive Player (ID / EN / 中文)',
  modeMp4: 'MP4 Video (Indonesian Audio)',
  playBtn: 'Play',
  pauseBtn: 'Pause',
  restartBtn: 'Restart',
  muteBtn: 'Mute',
  unmuteBtn: 'Sound',
  speedLabel: 'Speed',
  downloadMp4Btn: 'Download MP4 (1.7 MB)',
  shareWaBtn: 'Share to WhatsApp Group',
  shareWaMessage: (siteUrl) =>
    `Check out how Importir Pontianak works: assisted sourcing from 1688/Alibaba & shared LCL container consolidation starting from 0.1 CBM directly to Pontianak & West Kalimantan:\n\nWatch interactive explainer: ${siteUrl}/#alur-kerja\nDirect MP4 video: ${siteUrl}/videos/explainer-cara-kerja-importir-pontianak.mp4`,
  ctaRegister: 'Create Free Member Account',
  ctaNewOrder: 'Create Order Now',
  ctaCatalog: 'Browse LCL Catalog',
  tapToPlayOverlay: 'Play How It Works Explainer (01:02)',
  scenes: [
    {
      pillLabel: 'Intro',
      badge: 'WEST KALIMANTAN LCL SOLUTION',
      headline: 'Import from China, Malaysia & Singapore from Just 0.1 CBM',
      subline:
        'No need to rent a full 20ft container. Join our shared LCL shipments with transparent all-in rates straight to Pontianak & across Kalbar.',
      subtitle:
        'Want to import goods to Pontianak without booking an entire container? Start from just 0.1 CBM.',
    },
    {
      pillLabel: '1. Sign Up',
      badge: 'STEP 1 · 30-SECOND MEMBER REGISTRATION',
      headline: 'Register Free & Instantly Get Personal Marking Codes',
      subline:
        'Every member receives a permanent Member ID and warehouse Marking Codes for Guangzhou (China), Kuching (Malaysia), and Tuas (Singapore).',
      subtitle:
        'Sign up free in 30 seconds to get your official Member ID and personal transit warehouse Marking Codes.',
    },
    {
      pillLabel: '2. Order',
      badge: 'STEP 2 · CATALOG, SOURCING & QUOTATION',
      headline: 'Pick High-Margin 1688 Products or Paste Your Own Link',
      subline:
        'Submit Assisted Purchasing, Freight Forwarder, or FX Transfer requests. Our team sends a clear all-in IDR quotation ready for approval inside your portal.',
      subtitle:
        'Choose curated 1688 catalog items or submit your supplier link, then approve your official all-in quote online.',
    },
    {
      pillLabel: '3. LCL Pool',
      badge: 'STEP 3 · SHARED CONTAINER CONSOLIDATION',
      headline: 'Cargo Consolidates into Active West Kalimantan LCL Containers',
      subline:
        'Origin teams inspect and consolidate parcels from multiple Kalbar importers into one shared container — lower freight cost, customs clearance included.',
      subtitle:
        'Your cargo joins a shared Kalbar LCL container — lower shipping rates, transparent CBM/kg pricing & all-in customs.',
    },
    {
      pillLabel: '4. Tracking',
      badge: 'STEP 4 · LIVE TRACKING & KALBAR DELIVERY',
      headline: 'Track Milestones Real-Time & Receive Across Kalbar',
      subline:
        'Follow every shipping event in your Member Dashboard, upload transfer receipts, and collect at Pontianak or forward to Singkawang, Sintang & Ketapang.',
      subtitle:
        'Track shipments live inside your Member Dashboard, upload transfer proof, and receive anywhere in West Kalimantan.',
    },
  ],
  visuals: {
    scene1Pills: ['From 0.1 CBM', '3 Hubs: CN · MY · SG', '15 Kalbar Cities'],
    scene1FloatTitle: 'Save up to 60% vs Full Container',
    scene1FloatDesc: 'Combine 1688 wholesale orders into one shared container',
    scene2CardHeader: 'IMPORTER MEMBER PASS',
    scene2MemberLabel: 'OFFICIAL MEMBER CODE',
    scene2SyncNote: 'Synced automatically with quotes, invoices & tracking',
    scene3CustomUrlLabel: 'Or paste your own 1688 / Alibaba link:',
    scene3QuoteHeader: 'OFFICIAL ALL-IN QUOTATION',
    scene3QuoteItem: 'Commercial Coffee Grinder 600N (5 Units)',
    scene3QuoteSpec: 'Est. 0.35 CBM · Sea Freight Guangzhou -> PNK',
    scene3QuoteTotalLabel: 'All-In Landed Cost to Pontianak:',
    scene3QuoteApproved: 'QUOTE APPROVED BY MEMBER',
    scene3QuotePending: 'Click Approve Quote in Portal',
    scene4BatchHeader: 'ACTIVE BATCH: LCL-GZ-PNK-2612A',
    scene4BatchSub: 'Guangzhou -> Pontianak · 20ft (28 CBM)',
    scene4AllInBadge: 'ALL-IN CUSTOMS',
    scene4FilledLabel: 'Pool Filled',
    scene4RemainLabel: 'Available',
    scene4MemberSlot: 'YOUR PARCEL (Member)',
    scene5ResiHeader: 'TRACKING: IMP-PNK-2026-0001',
    scene5Milestones: [
      'Received & Measured at Guangzhou Hub',
      'Stuffed & Departed via Sea Freight',
      'Customs Clearance Completed',
      'Arrived in Pontianak -> Across Kalbar',
    ],
    scene5CtaTitle: 'Ready to Import Smarter?',
    scene5CtaDesc: 'Create your free Member account & join the next LCL slot.',
  },
};

const ZH_EXPLAINER: ExplainerDictionary = {
  subtitleIntro:
    '观看 1 分钟动画演示，快速了解会员注册、专属海外仓唛头与 LCL 拼箱集运全流程 — 也可下载 MP4 视频直接转发到微信/WhatsApp 商家群。',
  modeInteractive: '多语言互动演示 (ID / EN / 中文)',
  modeMp4: 'MP4 原声视频 (印尼语配音)',
  playBtn: '播放',
  pauseBtn: '暂停',
  restartBtn: '重播',
  muteBtn: '静音',
  unmuteBtn: '开启声音',
  speedLabel: '倍速',
  downloadMp4Btn: '下载 MP4 视频 (1.7 MB)',
  shareWaBtn: '转发至 WhatsApp 群',
  shareWaMessage: (siteUrl) =>
    `推荐坤甸与西加里曼丹同行了解 Importir Pontianak：支持 1688/阿里巴巴代购采购 + 0.1立方起 LCL 拼柜直达坤甸，查看 1 分钟操作演示：\n\n网页互动演示：${siteUrl}/#alur-kerja\nMP4 视频直链：${siteUrl}/videos/explainer-cara-kerja-importir-pontianak.mp4`,
  ctaRegister: '免费注册会员',
  ctaNewOrder: '立即在线下单',
  ctaCatalog: '浏览 1688 选品目录',
  tapToPlayOverlay: '点击播放运作流程演示 (01:02)',
  scenes: [
    {
      pillLabel: '简介',
      badge: '西加里曼丹 LCL 拼柜方案',
      headline: '中国、马来西亚、新加坡进口直达坤甸，0.1 立方即可发运',
      subline:
        '无需包整柜！通过共享 LCL 拼箱把 1688/工厂货物集运至坤甸及西加全境，双清包税价格全包透明。',
      subtitle:
        '想从中国、马来或新加坡进口到坤甸却货量不够整柜？在 Importir Pontianak，最低 0.1 立方起即可拼柜！',
    },
    {
      pillLabel: '1. 注册',
      badge: '第 1 步 · 30 秒免费成为会员',
      headline: '快速注册会员，立即领取三仓永久专属唛头',
      subline:
        '注册即获得正式会员编号与广州、马来古晋、新加坡大士中转仓的个人专属唛头 (Marking Code)。',
      subtitle:
        '30 秒免费注册会员，即可拥有中国广州、马来古晋与新加坡中转仓的永久个人专属唛头。',
    },
    {
      pillLabel: '2. 下单',
      badge: '第 2 步 · 选品、代购与全包报价',
      headline: '挑选高毛利选品目录或提交 1688 商品链接',
      subline:
        '在线发起代购采购、纯货代或外汇代付委托，客服核价后发送一口价全包印尼盾报价单，会员中心一键确认。',
      subtitle:
        '从高毛利目录选品或粘贴 1688 链接，并在会员后台一键确认官方一口价全包报价。',
    },
    {
      pillLabel: '3. 拼柜',
      badge: '第 3 步 · 西加同行拼入 LCL 集装箱',
      headline: '始发仓收货验货并装入西加专属共享集装箱',
      subline:
        '货物在广州/古晋仓质检并与其他西加买家包裹拼入同一集装箱，海运成本大幅降低，含全包清关税费。',
      subtitle:
        '货物与西加里曼丹同行包裹拼入同一 LCL 货柜，按立方或公斤透明计费，含双清包税。',
    },
    {
      pillLabel: '4. 追踪',
      badge: '第 4 步 · 实时轨迹与西加派送',
      headline: '会员中心实时追踪轨迹，全西加门到门收货',
      subline:
        '随时查看装船清关节点、上传转账水单，货到后可于坤甸仓自提或转运至山口洋、新当、吉打邦等全境。',
      subtitle:
        '登录会员中心实时掌控物流轨迹、上传付款凭证，直达坤甸及西加全境各大城市。',
    },
  ],
  visuals: {
    scene1Pills: ['0.1 立方起拼', '中/马/新三仓', '直达西加 15 城'],
    scene1FloatTitle: '比独自发整柜节省高达 60%',
    scene1FloatDesc: '1688 批发采购拼入同一集装箱发往坤甸',
    scene2CardHeader: '进口商会员通行证',
    scene2MemberLabel: '官方会员编号',
    scene2SyncNote: '自动关联所有询价单、账单与物流运单',
    scene3CustomUrlLabel: '或直接粘贴您的 1688 / 阿里巴巴商品链接：',
    scene3QuoteHeader: '官方一口价全包报价',
    scene3QuoteItem: '商用咖啡磨豆机 600N (5 台)',
    scene3QuoteSpec: '预估 0.35 立方 · 广州海运至坤甸',
    scene3QuoteTotalLabel: '坤甸门到门全包总价:',
    scene3QuoteApproved: '会员已确认此报价',
    scene3QuotePending: '于会员后台点击确认报价',
    scene4BatchHeader: '正在开放拼柜: LCL-GZ-PNK-2612A',
    scene4BatchSub: '广州仓 -> 坤甸港 · 20尺标柜 (28 CBM)',
    scene4AllInBadge: '双清包税全包',
    scene4FilledLabel: '当前拼柜进度',
    scene4RemainLabel: '剩余舱位',
    scene4MemberSlot: '您的货物 (会员舱位)',
    scene5ResiHeader: '运单号: IMP-PNK-2026-0001',
    scene5Milestones: [
      '广州仓库已收货核验重量体积',
      '已完成装柜并开船发往西加',
      '清关顺利放行完毕',
      '抵达坤甸并派送至西加各市',
    ],
    scene5CtaTitle: '准备好更省钱、更省心地进口了吗？',
    scene5CtaDesc: '立即免费注册会员，锁定最近一期 LCL 拼柜舱位。',
  },
};

const EXPLAINER_DICTIONARIES: Record<Locale, ExplainerDictionary> = {
  id: ID_EXPLAINER,
  en: EN_EXPLAINER,
  zh: ZH_EXPLAINER,
};

export function getExplainerDictionary(locale: Locale): ExplainerDictionary {
  return EXPLAINER_DICTIONARIES[locale] ?? ID_EXPLAINER;
}
