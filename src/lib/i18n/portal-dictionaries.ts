import type { RfqStatus } from '@/lib/types';
import type { Locale } from './types';

export interface PortalDictionary {
  auth: {
    backToHome: string;
    benefitsTitle: string;
    benefitsSubtitle: string;
    benefits: string[];
    loginTitle: string;
    loginSubtitle: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginBtn: string;
    loggingInBtn: string;
    noAccountText: string;
    goToRegister: string;
    registerTitle: string;
    registerSubtitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    destinationLabel: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    passwordHint: string;
    registerBtn: string;
    registeringBtn: string;
    haveAccountText: string;
    goToLogin: string;
    errors: {
      passwordMismatch: string;
      passwordTooShort: string;
      networkError: string;
      genericLoginFail: string;
      genericRegisterFail: string;
    };
  };
  rfqGate: {
    badge: string;
    title: string;
    subtitle: string;
    prefillSavedHint: string;
    registerCta: string;
    loginCta: string;
    benefitsList: [string, string, string];
    loggedInBadge: (memberCode: string, fullName: string) => string;
    viewMyDashboard: string;
    lclBatchSelectLabel: string;
    lclBatchNoneOption: string;
  };
  shell: {
    portalTitle: string;
    memberCodeLabel: string;
    nav: {
      overview: string;
      newOrder: string;
      orders: string;
      shipments: string;
      warehouses: string;
      profile: string;
    };
    publicSiteLink: string;
    catalogLink: string;
    logoutBtn: string;
    mobileToggleAria: string;
  };
  overview: {
    welcome: (name: string) => string;
    subtitle: string;
    newOrderCta: string;
    viewCatalogCta: string;
    kpis: {
      totalOrders: string;
      pendingOrders: string;
      quotedOrders: string;
      activeShipments: string;
      totalInvoice: string;
    };
    markingCardTitle: string;
    markingCardSubtitle: string;
    copyBtn: string;
    copiedBtn: string;
    recentOrdersTitle: string;
    viewAllOrders: string;
    noOrders: string;
    recentShipmentsTitle: string;
    viewAllShipments: string;
    noShipments: string;
    quoteLabel: string;
    estLabel: string;
  };
  newOrder: {
    title: string;
    subtitle: string;
    backToOverview: string;
    selectBatchHint: string;
    successTitle: string;
    successViewOrders: string;
    successCreateAnother: string;
  };
  orders: {
    title: string;
    subtitle: string;
    newOrderBtn: string;
    searchPlaceholder: string;
    allStatusOption: string;
    emptyTitle: string;
    emptyDesc: string;
    columns: {
      codeDate: string;
      product: string;
      route: string;
      price: string;
      status: string;
      actions: string;
    };
    statusLabels: Record<RfqStatus, string>;
    quotedBadge: string;
    estimatedBadge: string;
    kloterBadge: string;
    detailBtn: string;
    modal: {
      serviceRoute: string;
      destination: string;
      qtySpec: string;
      supplierLink: string;
      photoLabel: string;
      yourNotes: string;
      adminQuoteBox: string;
      adminNotesLabel: string;
      waitingQuoteHint: string;
      approveQuoteBtn: string;
      approvingBtn: string;
      cancelOrderBtn: string;
      cancellingBtn: string;
      cancelConfirm: string;
      trackShipmentBtn: string;
      chatWaBtn: string;
      approveSuccess: string;
      cancelSuccess: string;
      actionFail: string;
    };
  };
  shipments: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    searchPlaceholder: string;
    markingLabel: string;
    supplierResiLabel: string;
    colliLabel: string;
    weightVolLabel: string;
    invoiceLabel: string;
    etaLabel: string;
    timelineTitle: string;
    noEvents: string;
    uploadProofBtn: string;
    updateProofBtn: string;
    proofUploadedBadge: string;
    proofModal: {
      title: string;
      subtitle: (trackingNumber: string) => string;
      selectFileLabel: string;
      pickFileBtn: string;
      uploadingFile: string;
      noteLabel: string;
      notePlaceholder: string;
      saveBtn: string;
      savingBtn: string;
      cancelBtn: string;
      successMsg: string;
      uploadError: string;
      saveError: string;
    };
  };
  warehouses: {
    title: string;
    subtitle: string;
    yourMarkingLabel: string;
    copyMarkingBtn: string;
    copiedBtn: string;
    localAddrLabel: string;
    engAddrLabel: string;
    recipientLabel: string;
    copyAddrBtn: string;
    notesLabel: string;
    supportedMethodsLabel: string;
  };
  profile: {
    title: string;
    subtitle: string;
    accountInfoTitle: string;
    memberCodeLabel: string;
    markingBaseLabel: string;
    emailLabel: string;
    fullNameLabel: string;
    whatsappLabel: string;
    companyLabel: string;
    destinationLabel: string;
    addressLabel: string;
    addressPlaceholder: string;
    saveProfileBtn: string;
    savingProfileBtn: string;
    profileSavedMsg: string;
    profileErrorMsg: string;
    passwordTitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmNewPasswordLabel: string;
    savePasswordBtn: string;
    savingPasswordBtn: string;
    passwordSavedMsg: string;
    passwordMismatchMsg: string;
    passwordTooShortMsg: string;
    passwordErrorMsg: string;
  };
}

const ID_PORTAL: PortalDictionary = {
  auth: {
    backToHome: 'Kembali ke Beranda',
    benefitsTitle: 'Satu Akun Member untuk Semua Aktivitas Impor Kalbar',
    benefitsSubtitle:
      'Daftar gratis dalam 30 detik untuk mengakses portal order, penawaran resmi, alamat gudang personal, dan tracking pengiriman terintegrasi.',
    benefits: [
      'Dapatkan Member Code & Marking Code permanen untuk gudang Guangzhou, Kuching & Singapura',
      'Ajukan order Titip Beli 1688/Alibaba, Forwarder LCL, & Transfer Valas dalam satu tempat',
      'Pantau penawaran resmi admin, setujui kuotasi, dan unggah bukti transfer DP/pelunasan',
      'Lacak posisi kargo real-time lengkap dengan riwayat resi dan invoice tagihan',
    ],
    loginTitle: 'Masuk Akun Member',
    loginSubtitle:
      'Gunakan Email atau nomor WhatsApp yang terdaftar untuk mengakses Dashboard Impor Anda.',
    identifierLabel: 'Email atau Nomor WhatsApp',
    identifierPlaceholder: 'nama@email.com atau 0812xxxxxxxx',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Masukkan password Anda',
    loginBtn: 'Masuk ke Portal Member',
    loggingInBtn: 'Memverifikasi...',
    noAccountText: 'Belum punya akun Member?',
    goToRegister: 'Daftar Akun Baru',
    registerTitle: 'Daftar Akun Importir',
    registerSubtitle:
      'Buat akun gratis agar order dan marking code gudang Anda tercatat rapi di sistem.',
    fullNameLabel: 'Nama Lengkap *',
    fullNamePlaceholder: 'cth: Hendra Wijaya',
    emailLabel: 'Alamat Email *',
    emailPlaceholder: 'hendra@tokokopi.id',
    whatsappLabel: 'Nomor WhatsApp Aktif *',
    whatsappPlaceholder: '0812xxxxxxxx / 62812xxxxxxxx',
    companyLabel: 'Nama Toko / Usaha (Opsional)',
    companyPlaceholder: 'cth: Toko Cahaya Pontianak',
    destinationLabel: 'Kota Tujuan Utama di Kalbar',
    confirmPasswordLabel: 'Konfirmasi Password *',
    confirmPasswordPlaceholder: 'Ulangi password minimal 6 karakter',
    passwordHint: 'Minimal 6 karakter.',
    registerBtn: 'Daftar & Masuk Sekarang',
    registeringBtn: 'Membuat Akun...',
    haveAccountText: 'Sudah terdaftar sebagai Member?',
    goToLogin: 'Masuk di Sini',
    errors: {
      passwordMismatch: 'Konfirmasi password tidak cocok.',
      passwordTooShort: 'Password minimal 6 karakter.',
      networkError: 'Koneksi bermasalah. Silakan coba lagi.',
      genericLoginFail: 'Gagal masuk. Periksa email/WhatsApp dan password.',
      genericRegisterFail: 'Gagal mendaftarkan akun. Periksa data Anda.',
    },
  },
  rfqGate: {
    badge: 'Akses Order Member',
    title: 'Daftar atau Masuk untuk Mengajukan Order',
    subtitle:
      'Setiap pengajuan Titip Beli, Booking Slot LCL Kontainer, maupun Forwarder wajib masuk akun Member agar kode order, penawaran harga, marking code gudang, dan resi tersimpan rapi di Dashboard Anda.',
    prefillSavedHint:
      'Pilihan produk / kalkulator / kloter LCL Anda sudah disimpan otomatis dan akan langsung terisi setelah Anda masuk.',
    registerCta: 'Daftar Akun Gratis',
    loginCta: 'Masuk / Login',
    benefitsList: [
      'Dapat Marking Code pribadi permanen CN / MY / SG',
      'Pantau penawaran harga admin & setujui order langsung di web',
      'Upload bukti transfer & lacak seluruh pengiriman dalam 1 dashboard',
    ],
    loggedInBadge: (memberCode, fullName) =>
      `Masuk sebagai ${fullName} (${memberCode})`,
    viewMyDashboard: 'Buka Dashboard Saya',
    lclBatchSelectLabel: 'Gabung Kloter Kontainer LCL (Opsional)',
    lclBatchNoneOption: '-- Bebas / Konsultasi Jadwal Terdekat --',
  },
  shell: {
    portalTitle: 'Portal Member Importir',
    memberCodeLabel: 'ID Member',
    nav: {
      overview: 'Ringkasan',
      newOrder: 'Buat Order / RFQ',
      orders: 'Order Saya',
      shipments: 'Pengiriman & Tagihan',
      warehouses: 'Gudang & Marking Code',
      profile: 'Profil & Keamanan',
    },
    publicSiteLink: 'Beranda Website',
    catalogLink: 'Katalog Produk China',
    logoutBtn: 'Keluar',
    mobileToggleAria: 'Buka menu portal member',
  },
  overview: {
    welcome: (name) => `Halo, ${name}`,
    subtitle:
      'Pantau pengajuan order, status penawaran, pergerakan kontainer LCL, dan kode gudang pribadi Anda.',
    newOrderCta: 'Buat Order / RFQ Baru',
    viewCatalogCta: 'Pilih Produk Katalog',
    kpis: {
      totalOrders: 'Total Order / RFQ',
      pendingOrders: 'Menunggu Proses',
      quotedOrders: 'Siap Disetujui (Penawaran)',
      activeShipments: 'Pengiriman Berjalan',
      totalInvoice: 'Total Tagihan Aktif',
    },
    markingCardTitle: 'Marking Code Pribadi Anda',
    markingCardSubtitle:
      'Cantumkan kode ini pada label dus / resi supplier di China, Kuching Malaysia, atau Singapura agar paket otomatis teridentifikasi milik Anda.',
    copyBtn: 'Salin',
    copiedBtn: 'Tersalin',
    recentOrdersTitle: 'Order & RFQ Terbaru',
    viewAllOrders: 'Lihat Semua',
    noOrders: 'Belum ada pengajuan order. Klik "Buat Order / RFQ Baru" untuk memulai.',
    recentShipmentsTitle: 'Pengiriman & Tracking Terbaru',
    viewAllShipments: 'Lihat Semua',
    noShipments: 'Belum ada resi pengiriman aktif untuk akun Anda.',
    quoteLabel: 'Penawaran Resmi',
    estLabel: 'Estimasi Awal',
  },
  newOrder: {
    title: 'Buat Order Impor / Pengajuan RFQ Baru',
    subtitle:
      'Ajukan titip beli 1688/Alibaba, booking slot LCL forwarder, atau jasa transfer valas RMB/MYR/SGD langsung dari akun Anda.',
    backToOverview: 'Kembali ke Ringkasan',
    selectBatchHint:
      'Kloter yang Anda pilih akan tercatat di order ini untuk alokasi slot kontainer.',
    successTitle: 'Order Berhasil Masuk ke Akun Anda',
    successViewOrders: 'Pantau di Order Saya',
    successCreateAnother: 'Buat Order Lagi',
  },
  orders: {
    title: 'Daftar Order & Pengajuan RFQ Saya',
    subtitle:
      'Tinjau status order, bandingkan penawaran resmi all-in dari admin, setujui kuotasi untuk lanjut proses pengiriman, atau batalkan jika belum diproses.',
    newOrderBtn: 'Order Baru',
    searchPlaceholder: 'Cari kode RFQ, produk, atau kloter LCL...',
    allStatusOption: 'Semua Status',
    emptyTitle: 'Belum Ada Order',
    emptyDesc:
      'Anda belum memiliki pengajuan order yang cocok. Silakan buat order baru atau pilih produk dari katalog China.',
    columns: {
      codeDate: 'Kode & Tanggal',
      product: 'Produk & Layanan',
      route: 'Rute & Tujuan',
      price: 'Estimasi / Penawaran',
      status: 'Status',
      actions: 'Aksi',
    },
    statusLabels: {
      baru: 'Menunggu Dicek',
      diproses: 'Sedang Dicek Tim',
      penawaran_dikirim: 'Penawaran Masuk',
      disetujui: 'Disetujui / Lanjut',
      dibatalkan: 'Dibatalkan',
    },
    quotedBadge: 'Penawaran Final',
    estimatedBadge: 'Estimasi Kalkulator',
    kloterBadge: 'Kloter LCL',
    detailBtn: 'Detail & Aksi',
    modal: {
      serviceRoute: 'Layanan & Jalur Pengiriman',
      destination: 'Tujuan Pengiriman Kalbar',
      qtySpec: 'Kuantitas & Spesifikasi',
      supplierLink: 'Tautan Produk Supplier',
      photoLabel: 'Foto Referensi Produk',
      yourNotes: 'Catatan Anda',
      adminQuoteBox: 'Penawaran Resmi All-In dari Admin',
      adminNotesLabel: 'Catatan Tim Importir Pontianak',
      waitingQuoteHint:
        'Tim kami sedang memeriksa stok supplier & ongkir aktual untuk memberikan penawaran final.',
      approveQuoteBtn: 'Setujui Penawaran & Proses',
      approvingBtn: 'Memproses...',
      cancelOrderBtn: 'Batalkan Order',
      cancellingBtn: 'Membatalkan...',
      cancelConfirm: 'Yakin ingin membatalkan order ini?',
      trackShipmentBtn: 'Lihat Resi Pengiriman',
      chatWaBtn: 'Tanya Admin via WhatsApp',
      approveSuccess:
        'Penawaran berhasil disetujui! Tim kami akan segera menerbitkan Marking Code & Resi Pengiriman.',
      cancelSuccess: 'Order berhasil dibatalkan.',
      actionFail: 'Gagal memperbarui status order.',
    },
  },
  shipments: {
    title: 'Pengiriman, Tracking & Tagihan Saya',
    subtitle:
      'Pantau pergerakan kargo Anda dari gudang asal sampai Pontianak serta unggah bukti transfer pembayaran invoice.',
    emptyTitle: 'Belum Ada Pengiriman Aktif',
    emptyDesc:
      'Setelah penawaran order Anda disetujui dan dikonversi admin menjadi resi, seluruh progres kargo dan tagihan akan tampil di sini.',
    searchPlaceholder: 'Cari nomor resi, marking code, atau nama barang...',
    markingLabel: 'Marking Code',
    supplierResiLabel: 'Resi Supplier',
    colliLabel: 'Jumlah Koli',
    weightVolLabel: 'Berat / Volume',
    invoiceLabel: 'Tagihan Invoice',
    etaLabel: 'Estimasi Tiba',
    timelineTitle: 'Riwayat Perjalanan Kargo',
    noEvents: 'Belum ada pembaruan log perjalanan.',
    uploadProofBtn: 'Upload Bukti Bayar',
    updateProofBtn: 'Ganti Bukti Bayar',
    proofUploadedBadge: 'Bukti Pembayaran Terunggah',
    proofModal: {
      title: 'Unggah Bukti Pembayaran / Transfer',
      subtitle: (trackingNumber) =>
        `Resi ${trackingNumber} — foto bukti transfer akan diteruskan ke admin untuk verifikasi DP/Pelunasan.`,
      selectFileLabel: 'Foto / Screenshot Bukti Transfer (JPG, PNG, WebP maks 3 MB)',
      pickFileBtn: 'Pilih Gambar Bukti Transfer',
      uploadingFile: 'Mengunggah gambar...',
      noteLabel: 'Catatan Pembayaran (Nama Pengirim / Bank / Nominal)',
      notePlaceholder: 'cth: Transfer BCA a.n. Hendra Rp 2.500.000 DP 50%',
      saveBtn: 'Kirim Bukti Pembayaran',
      savingBtn: 'Menyimpan...',
      cancelBtn: 'Tutup',
      successMsg: 'Bukti pembayaran berhasil dikirim ke admin.',
      uploadError: 'Gagal mengunggah gambar bukti pembayaran.',
      saveError: 'Gagal menyimpan data bukti pembayaran.',
    },
  },
  warehouses: {
    title: 'Alamat Gudang Transit & Marking Code Pribadi',
    subtitle:
      'Gunakan alamat gudang dan Marking Code resmi akun Anda di bawah ini setiap kali memesan langsung ke supplier di China, Malaysia, atau Singapura.',
    yourMarkingLabel: 'Marking Code Khusus Pengiriman Ini',
    copyMarkingBtn: 'Salin Marking Code',
    copiedBtn: 'Tersalin',
    localAddrLabel: 'Alamat Gudang (Bahasa Lokal / Mandarin / Melayu)',
    engAddrLabel: 'Alamat Bahasa Inggris (Referensi Internasional)',
    recipientLabel: 'Format Nama Penerima (Wajib Dicantumkan)',
    copyAddrBtn: 'Salin Alamat',
    notesLabel: 'Catatan Penting Gudang',
    supportedMethodsLabel: 'Jalur tersedia:',
  },
  profile: {
    title: 'Profil Akun & Keamanan',
    subtitle:
      'Perbarui data kontak WhatsApp, nama toko/usaha, alamat pengantaran di Kalbar, atau ubah password akun Anda.',
    accountInfoTitle: 'Informasi Member & Alamat Pengiriman',
    memberCodeLabel: 'ID Member',
    markingBaseLabel: 'Kode Dasar Marking',
    emailLabel: 'Email Terdaftar',
    fullNameLabel: 'Nama Lengkap *',
    whatsappLabel: 'Nomor WhatsApp *',
    companyLabel: 'Nama Toko / Perusahaan',
    destinationLabel: 'Kota / Area Tujuan Default',
    addressLabel: 'Alamat Lengkap Pengiriman Kalbar',
    addressPlaceholder:
      'cth: Jl. Gajah Mada No. 88, Pontianak Selatan (dekat Bank Kalbar)',
    saveProfileBtn: 'Simpan Perubahan Profil',
    savingProfileBtn: 'Menyimpan...',
    profileSavedMsg: 'Profil berhasil diperbarui.',
    profileErrorMsg: 'Gagal memperbarui profil.',
    passwordTitle: 'Ubah Password Login',
    currentPasswordLabel: 'Password Saat Ini *',
    newPasswordLabel: 'Password Baru (min. 6 karakter) *',
    confirmNewPasswordLabel: 'Ulangi Password Baru *',
    savePasswordBtn: 'Perbarui Password',
    savingPasswordBtn: 'Memperbarui...',
    passwordSavedMsg: 'Password berhasil diubah.',
    passwordMismatchMsg: 'Konfirmasi password baru tidak cocok.',
    passwordTooShortMsg: 'Password baru minimal 6 karakter.',
    passwordErrorMsg: 'Gagal mengubah password.',
  },
};

const EN_PORTAL: PortalDictionary = {
  auth: {
    backToHome: 'Back to Home',
    benefitsTitle: 'One Member Account for All West Kalimantan Import Operations',
    benefitsSubtitle:
      'Sign up free in 30 seconds to access the order portal, official all-in quotes, personal transit warehouse markings, and live cargo tracking.',
    benefits: [
      'Receive a permanent Member Code & Marking Code across Guangzhou, Kuching & Singapore hubs',
      'Submit 1688/Alibaba sourcing requests, LCL consolidation bookings, and FX transfers in one place',
      'Review official all-in quotations, approve orders online, and upload payment transfer receipts',
      'Track every shipment timeline, package count, weight/CBM, and billing status in real time',
    ],
    loginTitle: 'Member Sign In',
    loginSubtitle:
      'Use your registered Email or WhatsApp number to access your Import Dashboard.',
    identifierLabel: 'Email or WhatsApp Number',
    identifierPlaceholder: 'name@email.com or 0812xxxxxxxx',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginBtn: 'Sign In to Member Portal',
    loggingInBtn: 'Verifying...',
    noAccountText: 'New to Importir Pontianak?',
    goToRegister: 'Create Free Account',
    registerTitle: 'Create Member Account',
    registerSubtitle:
      'Register once so all your orders, quotes, and warehouse marking codes stay organized.',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'e.g. Hendra Wijaya',
    emailLabel: 'Email Address *',
    emailPlaceholder: 'hendra@store.id',
    whatsappLabel: 'Active WhatsApp Number *',
    whatsappPlaceholder: '0812xxxxxxxx / 62812xxxxxxxx',
    companyLabel: 'Store / Company Name (Optional)',
    companyPlaceholder: 'e.g. Cahaya Coffee Supply Pontianak',
    destinationLabel: 'Default West Kalimantan Destination',
    confirmPasswordLabel: 'Confirm Password *',
    confirmPasswordPlaceholder: 'Repeat password (min. 6 chars)',
    passwordHint: 'Minimum 6 characters.',
    registerBtn: 'Register & Continue',
    registeringBtn: 'Creating Account...',
    haveAccountText: 'Already have a Member account?',
    goToLogin: 'Sign In Here',
    errors: {
      passwordMismatch: 'Password confirmation does not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
      networkError: 'Network error. Please try again.',
      genericLoginFail: 'Sign in failed. Check your email/WhatsApp and password.',
      genericRegisterFail: 'Registration failed. Please check your details.',
    },
  },
  rfqGate: {
    badge: 'Member Order Portal',
    title: 'Register or Sign In to Place an Order',
    subtitle:
      'All Assisted Purchasing, Shared LCL Container Bookings, and Freight Forwarder orders require a Member account so your quotations, warehouse marking code, and live shipments stay linked to your dashboard.',
    prefillSavedHint:
      'Your selected product / calculator / LCL batch details are saved and will auto-fill right after you sign in.',
    registerCta: 'Create Free Account',
    loginCta: 'Sign In',
    benefitsList: [
      'Permanent CN / MY / SG warehouse Marking Code included',
      'Review official all-in admin quotes & approve orders online',
      'Upload transfer receipts & track all shipments from one dashboard',
    ],
    loggedInBadge: (memberCode, fullName) =>
      `Signed in as ${fullName} (${memberCode})`,
    viewMyDashboard: 'Open My Dashboard',
    lclBatchSelectLabel: 'Join Shared LCL Container Batch (Optional)',
    lclBatchNoneOption: '-- Flexible / Next Available Departure --',
  },
  shell: {
    portalTitle: 'Member Import Portal',
    memberCodeLabel: 'Member ID',
    nav: {
      overview: 'Overview',
      newOrder: 'New Order / RFQ',
      orders: 'My Orders',
      shipments: 'Shipments & Billing',
      warehouses: 'Warehouses & Marking',
      profile: 'Profile & Security',
    },
    publicSiteLink: 'Public Website',
    catalogLink: 'China Product Catalog',
    logoutBtn: 'Sign Out',
    mobileToggleAria: 'Open member navigation menu',
  },
  overview: {
    welcome: (name) => `Hello, ${name}`,
    subtitle:
      'Monitor your import requests, official quotes, LCL container slots, and personal warehouse marking codes.',
    newOrderCta: 'New Order / RFQ',
    viewCatalogCta: 'Browse China Catalog',
    kpis: {
      totalOrders: 'Total Orders / RFQs',
      pendingOrders: 'Pending Review',
      quotedOrders: 'Quotes Ready to Approve',
      activeShipments: 'Active Shipments',
      totalInvoice: 'Total Active Billing',
    },
    markingCardTitle: 'Your Personal Warehouse Marking Codes',
    markingCardSubtitle:
      'Include the corresponding marking code on your supplier parcel label in China, Kuching Malaysia, or Singapore so packages match your account automatically.',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    recentOrdersTitle: 'Recent Orders & RFQs',
    viewAllOrders: 'View All',
    noOrders: 'No orders yet. Click "New Order / RFQ" to submit your first request.',
    recentShipmentsTitle: 'Recent Shipments & Tracking',
    viewAllShipments: 'View All',
    noShipments: 'No shipments registered under your account yet.',
    quoteLabel: 'Official Quote',
    estLabel: 'Web Estimate',
  },
  newOrder: {
    title: 'Submit New Import Order / RFQ',
    subtitle:
      'Request 1688/Alibaba sourcing, book an LCL container slot, or initiate supplier FX transfers directly from your Member account.',
    backToOverview: 'Back to Overview',
    selectBatchHint:
      'Selecting a batch attaches that LCL container schedule directly to your order.',
    successTitle: 'Order Submitted to Your Account',
    successViewOrders: 'View in My Orders',
    successCreateAnother: 'Create Another Order',
  },
  orders: {
    title: 'My Import Orders & RFQs',
    subtitle:
      'Track verification progress, review official all-in quotations from our team, approve quotes to start fulfillment, or cancel unstarted requests.',
    newOrderBtn: 'New Order',
    searchPlaceholder: 'Search RFQ code, product name, or LCL batch...',
    allStatusOption: 'All Statuses',
    emptyTitle: 'No Matching Orders',
    emptyDesc:
      'You have no orders matching the selected filters. Submit a new order or pick an item from our China catalog.',
    columns: {
      codeDate: 'Code & Date',
      product: 'Product & Service',
      route: 'Route & Destination',
      price: 'Estimate / Quote',
      status: 'Status',
      actions: 'Action',
    },
    statusLabels: {
      baru: 'Pending Review',
      diproses: 'In Review',
      penawaran_dikirim: 'Quote Sent',
      disetujui: 'Approved',
      dibatalkan: 'Cancelled',
    },
    quotedBadge: 'Official Quote',
    estimatedBadge: 'Web Estimate',
    kloterBadge: 'LCL Batch',
    detailBtn: 'Details & Action',
    modal: {
      serviceRoute: 'Service & Shipping Method',
      destination: 'West Kalimantan Destination',
      qtySpec: 'Quantity & Cargo Specs',
      supplierLink: 'Supplier Product URL',
      photoLabel: 'Product Reference Image',
      yourNotes: 'Your Notes',
      adminQuoteBox: 'Official All-In Quote from Team',
      adminNotesLabel: 'Team Notes',
      waitingQuoteHint:
        'Our team is confirming supplier pricing & actual freight rates to prepare your final quote.',
      approveQuoteBtn: 'Approve Quote & Proceed',
      approvingBtn: 'Approving...',
      cancelOrderBtn: 'Cancel Order',
      cancellingBtn: 'Cancelling...',
      cancelConfirm: 'Are you sure you want to cancel this order?',
      trackShipmentBtn: 'View Linked Shipment',
      chatWaBtn: 'Ask Admin via WhatsApp',
      approveSuccess:
        'Quote approved! Our team will finalize your warehouse Marking Code & shipment receipt shortly.',
      cancelSuccess: 'Order cancelled successfully.',
      actionFail: 'Failed to update order status.',
    },
  },
  shipments: {
    title: 'My Shipments, Tracking & Invoices',
    subtitle:
      'Follow real-time cargo milestones from origin warehouses to Pontianak and upload your transfer receipts.',
    emptyTitle: 'No Active Shipments Yet',
    emptyDesc:
      'Once your order quote is approved and converted to a tracking number by our team, full tracking and invoice details appear here.',
    searchPlaceholder: 'Search tracking number, marking code, or item...',
    markingLabel: 'Marking Code',
    supplierResiLabel: 'Supplier Tracking',
    colliLabel: 'Colli / Boxes',
    weightVolLabel: 'Weight / Volume',
    invoiceLabel: 'Invoice Amount',
    etaLabel: 'Estimated Arrival',
    timelineTitle: 'Cargo Movement History',
    noEvents: 'No tracking updates posted yet.',
    uploadProofBtn: 'Upload Payment Proof',
    updateProofBtn: 'Replace Payment Proof',
    proofUploadedBadge: 'Payment Proof Uploaded',
    proofModal: {
      title: 'Upload Payment / Transfer Receipt',
      subtitle: (trackingNumber) =>
        `Shipment ${trackingNumber} — our admin team will verify your transfer proof for DP/settlement.`,
      selectFileLabel: 'Transfer Receipt Photo (JPG, PNG, WebP max 3 MB)',
      pickFileBtn: 'Choose Receipt Image',
      uploadingFile: 'Uploading image...',
      noteLabel: 'Payment Note (Sender Name / Bank / Amount)',
      notePlaceholder: 'e.g. BCA Transfer under Hendra IDR 2,500,000 DP 50%',
      saveBtn: 'Submit Payment Proof',
      savingBtn: 'Saving...',
      cancelBtn: 'Close',
      successMsg: 'Payment receipt submitted to admin.',
      uploadError: 'Failed to upload image file.',
      saveError: 'Failed to save payment proof.',
    },
  },
  warehouses: {
    title: 'Transit Warehouses & Personal Marking Codes',
    subtitle:
      'Provide your exact warehouse address and personal Marking Code to suppliers in China, Malaysia, or Singapore whenever shipping cargo.',
    yourMarkingLabel: 'Your Marking Code for This Hub',
    copyMarkingBtn: 'Copy Marking Code',
    copiedBtn: 'Copied',
    localAddrLabel: 'Local Warehouse Address (Chinese / Malay)',
    engAddrLabel: 'English Warehouse Address (International Reference)',
    recipientLabel: 'Recipient Name Format (Required on Label)',
    copyAddrBtn: 'Copy Address',
    notesLabel: 'Important Hub Instructions',
    supportedMethodsLabel: 'Supported routes:',
  },
  profile: {
    title: 'Account Profile & Security',
    subtitle:
      'Keep your WhatsApp number, store/company name, West Kalimantan delivery address, or login password up to date.',
    accountInfoTitle: 'Member Profile & Default Delivery Address',
    memberCodeLabel: 'Member ID',
    markingBaseLabel: 'Base Marking Code',
    emailLabel: 'Registered Email',
    fullNameLabel: 'Full Name *',
    whatsappLabel: 'Active WhatsApp Number *',
    companyLabel: 'Store / Company Name',
    destinationLabel: 'Default Destination City',
    addressLabel: 'Full Delivery Address in West Kalimantan',
    addressPlaceholder:
      'e.g. Jl. Gajah Mada No. 88, Pontianak Selatan',
    saveProfileBtn: 'Save Profile Changes',
    savingProfileBtn: 'Saving...',
    profileSavedMsg: 'Profile updated successfully.',
    profileErrorMsg: 'Failed to update profile.',
    passwordTitle: 'Change Password',
    currentPasswordLabel: 'Current Password *',
    newPasswordLabel: 'New Password (min. 6 chars) *',
    confirmNewPasswordLabel: 'Repeat New Password *',
    savePasswordBtn: 'Update Password',
    savingPasswordBtn: 'Updating...',
    passwordSavedMsg: 'Password updated successfully.',
    passwordMismatchMsg: 'New password confirmation does not match.',
    passwordTooShortMsg: 'New password must be at least 6 characters.',
    passwordErrorMsg: 'Failed to change password.',
  },
};

const ZH_PORTAL: PortalDictionary = {
  auth: {
    backToHome: '返回首页',
    benefitsTitle: '一个会员账号，统筹您的西加里曼丹全部进口业务',
    benefitsSubtitle:
      '30秒免费注册会员，即可解锁在线下单、官方报价确认、专属海外仓唛头及物流全链路追踪。',
    benefits: [
      '自动获取广州、古晋及新加坡中转仓的永久专属会员编号与进仓唛头',
      '一站提交 1688/阿里巴巴代购采购、LCL 拼箱订舱及 RMB/MYR/SGD 外汇代付需求',
      '实时查看管理员正式全包报价、在线确认下单并上传付款/定金水单',
      '随时掌控货物实测重量体积、物流轨迹节点与账单结算状态',
    ],
    loginTitle: '会员登录',
    loginSubtitle: '请使用已注册的邮箱或 WhatsApp 号码登录您的进口工作台。',
    identifierLabel: '注册邮箱或 WhatsApp 号码',
    identifierPlaceholder: 'name@email.com 或 0812xxxxxxxx',
    passwordLabel: '登录密码',
    passwordPlaceholder: '请输入密码',
    loginBtn: '登录会员中心',
    loggingInBtn: '正在验证...',
    noAccountText: '还没有会员账号？',
    goToRegister: '立即免费注册',
    registerTitle: '注册会员账号',
    registerSubtitle: '一次注册，您的所有询价单、运单和专属仓位唛头都将永久关联保存。',
    fullNameLabel: '联系人姓名 *',
    fullNamePlaceholder: '例如：Hendra Wijaya',
    emailLabel: '电子邮箱 *',
    emailPlaceholder: 'hendra@store.id',
    whatsappLabel: '常用 WhatsApp 号码 *',
    whatsappPlaceholder: '0812xxxxxxxx / 62812xxxxxxxx',
    companyLabel: '店铺 / 公司名称（选填）',
    companyPlaceholder: '例如：坤甸永兴商行',
    destinationLabel: '西加里曼丹常用目的城市',
    confirmPasswordLabel: '确认密码 *',
    confirmPasswordPlaceholder: '再次输入密码（至少6位）',
    passwordHint: '密码长度至少为 6 个字符。',
    registerBtn: '完成注册并进入工作台',
    registeringBtn: '正在创建账号...',
    haveAccountText: '已有会员账号？',
    goToLogin: '点击此处登录',
    errors: {
      passwordMismatch: '两次输入的密码不一致。',
      passwordTooShort: '密码至少需要 6 个字符。',
      networkError: '网络连接异常，请稍后重试。',
      genericLoginFail: '登录失败，请检查账号和密码是否正确。',
      genericRegisterFail: '注册失败，请检查填写的信息。',
    },
  },
  rfqGate: {
    badge: '会员下单通道',
    title: '请先注册或登录以提交正式订单',
    subtitle:
      '为确保您的采购询价、LCL 拼柜锁位、专属海外仓唛头及物流运单准确归档到个人名下，所有正式下单均需登录会员账号后操作。',
    prefillSavedHint:
      '您刚刚选择的选品、试算参数或拼柜批次已自动暂存，登录后将直接为您带入表单！',
    registerCta: '免费注册账号',
    loginCta: '会员登录',
    benefitsList: [
      '注册即送中/马/新三仓通用永久专属唛头 (Marking Code)',
      '在线查看正式报价、一键确认下单或取消未处理订单',
      '在一个工作台上传付款凭证并实时追踪全部货柜轨迹',
    ],
    loggedInBadge: (memberCode, fullName) =>
      `已登录会员：${fullName} (${memberCode})`,
    viewMyDashboard: '进入我的会员中心',
    lclBatchSelectLabel: '绑定拼箱船期 / 批次（选填）',
    lclBatchNoneOption: '-- 灵活安排 / 咨询最近船期 --',
  },
  shell: {
    portalTitle: 'Importir 会员中心',
    memberCodeLabel: '会员编号',
    nav: {
      overview: '账户概览',
      newOrder: '新建订单 / RFQ',
      orders: '我的订单与报价',
      shipments: '运单追踪与账单',
      warehouses: '中转仓与专属唛头',
      profile: '个人资料与密码',
    },
    publicSiteLink: '返回官网首页',
    catalogLink: '浏览中国选品目录',
    logoutBtn: '退出登录',
    mobileToggleAria: '打开会员导航菜单',
  },
  overview: {
    welcome: (name) => `您好，${name}`,
    subtitle: '随时查看您的进口询价单、正式报价确认、LCL 拼柜进度及专属进仓唛头。',
    newOrderCta: '新建订单 / 询价',
    viewCatalogCta: '浏览中国爆款选品',
    kpis: {
      totalOrders: '累计订单 / RFQ',
      pendingOrders: '待核价处理',
      quotedOrders: '待确认报价',
      activeShipments: '运输中运单',
      totalInvoice: '关联账单总额',
    },
    markingCardTitle: '您的永久专属进仓唛头 (Marking Code)',
    markingCardSubtitle:
      '在 1688、淘宝下单寄往中国广州仓、古晋仓或新加坡仓时，请务必在外箱标注对应唛头，系统将自动匹配至您的账户。',
    copyBtn: '复制',
    copiedBtn: '已复制',
    recentOrdersTitle: '最近订单 / RFQ',
    viewAllOrders: '查看全部',
    noOrders: '暂无订单记录，点击上方「新建订单 / 询价」即可发起采购或集运申请。',
    recentShipmentsTitle: '最近运单与物流追踪',
    viewAllShipments: '查看全部',
    noShipments: '您的账户名下暂无已发出的国际运单。',
    quoteLabel: '正式报价',
    estLabel: '网页估算',
  },
  newOrder: {
    title: '提交新订单 / RFQ 进口需求',
    subtitle:
      '通过会员中心直接提交 1688/阿里巴巴代购、LCL 拼箱锁位或外汇代付委托单。',
    backToOverview: '返回账户概览',
    selectBatchHint: '选择正在开放的 LCL 拼柜批次后，订单将自动标注对应船期。',
    successTitle: '订单已成功提交至您的账户',
    successViewOrders: '在「我的订单」中查看',
    successCreateAnother: '继续提交新订单',
  },
  orders: {
    title: '我的订单与 RFQ 报价',
    subtitle:
      '查看核价状态、审阅管理员给出的全包报价、在线确认启动发货，或在未开船前取消订单。',
    newOrderBtn: '新建订单',
    searchPlaceholder: '搜索 RFQ 单号、商品名称或拼柜批次...',
    allStatusOption: '全部状态',
    emptyTitle: '暂无符合条件的订单',
    emptyDesc: '您目前没有匹配的订单，点击「新建订单」或前往选品目录挑选商品下单。',
    columns: {
      codeDate: '单号与日期',
      product: '商品与服务',
      route: '线路与目的地',
      price: '预估 / 正式报价',
      status: '状态',
      actions: '操作',
    },
    statusLabels: {
      baru: '待受理',
      diproses: '核价中',
      penawaran_dikirim: '已发正式报价',
      disetujui: '已确认 / 进行中',
      dibatalkan: '已取消',
    },
    quotedBadge: '官方全包报价',
    estimatedBadge: '网页估算',
    kloterBadge: '拼柜批次',
    detailBtn: '详情与确认',
    modal: {
      serviceRoute: '服务类型与渠道',
      destination: '西加里曼丹目的地',
      qtySpec: '数量与货物规格',
      supplierLink: '供应商商品链接',
      photoLabel: '商品参考图片',
      yourNotes: '您的下单备注',
      adminQuoteBox: '团队官方全包报价',
      adminNotesLabel: '管理员备注说明',
      waitingQuoteHint: '客服团队正在与供应商核对货期及准确运费，完成后将更新正式报价。',
      approveQuoteBtn: '确认接受此报价',
      approvingBtn: '正在确认...',
      cancelOrderBtn: '取消订单',
      cancellingBtn: '正在取消...',
      cancelConfirm: '确定要取消该订单吗？',
      trackShipmentBtn: '查看关联运单追踪',
      chatWaBtn: '联系管理员 WhatsApp',
      approveSuccess: '报价已确认！管理员将尽快为您生成进仓唛头与正式国际运单。',
      cancelSuccess: '订单已成功取消。',
      actionFail: '更新订单状态失败。',
    },
  },
  shipments: {
    title: '我的运单追踪与账单结算',
    subtitle: '掌握货物从海外集运仓到坤甸及西加全境的每一步轨迹，并可随时上传付款凭证。',
    emptyTitle: '暂无进行中的运单',
    emptyDesc: '当您的订单报价确认并由管理员转成国际运单后，物流轨迹与账单会显示在此处。',
    searchPlaceholder: '搜索运单号、唛头或商品摘要...',
    markingLabel: '专属唛头',
    supplierResiLabel: '国内/供应商单号',
    colliLabel: '件数',
    weightVolLabel: '实测重量 / 体积',
    invoiceLabel: '应付账单',
    etaLabel: '预计到达 (ETA)',
    timelineTitle: '物流轨迹动态',
    noEvents: '暂无物流节点更新记录。',
    uploadProofBtn: '上传付款水单',
    updateProofBtn: '更换付款水单',
    proofUploadedBadge: '已上传付款凭证',
    proofModal: {
      title: '上传转账 / 付款凭证',
      subtitle: (trackingNumber) =>
        `运单 ${trackingNumber} — 上传水单后将由财务与客服核对确认入账。`,
      selectFileLabel: '转账截图 / 水单图片（支持 JPG / PNG / WebP，最大 3 MB）',
      pickFileBtn: '选择水单图片',
      uploadingFile: '正在上传图片...',
      noteLabel: '付款备注（打款人 / 银行 / 金额）',
      notePlaceholder: '例如：BCA 转账 Hendra 定金 50% Rp 2.500.000',
      saveBtn: '提交付款凭证',
      savingBtn: '正在保存...',
      cancelBtn: '关闭',
      successMsg: '付款凭证已提交至管理员。',
      uploadError: '上传水单图片失败。',
      saveError: '保存付款凭证记录失败。',
    },
  },
  warehouses: {
    title: '海外中转仓地址与个人专属唛头',
    subtitle:
      '在中国、马来西亚或新加坡向供应商采购发货时，请直接复制下方对应仓库地址并务必注明您的专属唛头。',
    yourMarkingLabel: '本仓库专用个人唛头 (Marking Code)',
    copyMarkingBtn: '复制唛头',
    copiedBtn: '已复制',
    localAddrLabel: '当地语言仓库地址（下单寄件请复制此处）',
    engAddrLabel: '英文仓库地址（国际快递参考）',
    recipientLabel: '收件人格式（务必附带唛头）',
    copyAddrBtn: '复制地址',
    notesLabel: '进仓重要须知',
    supportedMethodsLabel: '支持物流渠道:',
  },
  profile: {
    title: '个人资料与账号安全',
    subtitle: '修改您的常用 WhatsApp 联系方式、商号名称、西加默认收货地址或登录密码。',
    accountInfoTitle: '会员档案与默认收货地址',
    memberCodeLabel: '会员编号',
    markingBaseLabel: '基础唛头码',
    emailLabel: '注册邮箱',
    fullNameLabel: '联系人姓名 *',
    whatsappLabel: '常用 WhatsApp 号码 *',
    companyLabel: '店铺 / 公司名称',
    destinationLabel: '默认目的城市',
    addressLabel: '西加里曼丹详细收货地址',
    addressPlaceholder: '例如：Jl. Gajah Mada No. 88, Pontianak Selatan',
    saveProfileBtn: '保存资料修改',
    savingProfileBtn: '正在保存...',
    profileSavedMsg: '个人资料已更新。',
    profileErrorMsg: '更新个人资料失败。',
    passwordTitle: '修改登录密码',
    currentPasswordLabel: '当前密码 *',
    newPasswordLabel: '新密码（至少 6 位）*',
    confirmNewPasswordLabel: '确认新密码 *',
    savePasswordBtn: '更新密码',
    savingPasswordBtn: '正在更新...',
    passwordSavedMsg: '登录密码已成功修改。',
    passwordMismatchMsg: '两次输入的新密码不一致。',
    passwordTooShortMsg: '新密码至少需要 6 个字符。',
    passwordErrorMsg: '修改密码失败。',
  },
};

const PORTAL_DICTIONARIES: Record<Locale, PortalDictionary> = {
  id: ID_PORTAL,
  en: EN_PORTAL,
  zh: ZH_PORTAL,
};

export function getPortalDictionary(locale: Locale): PortalDictionary {
  return PORTAL_DICTIONARIES[locale] ?? ID_PORTAL;
}
