// ============================================================
// Hak akses (RBAC) — Admin Utama vs Admin Produksi vs Kasir
// Catatan: login di bawah ini bersifat DEMO (client-side).
// Untuk produksi nyata, pindahkan autentikasi & pengecekan izin ke backend.
// ============================================================

export const PERMISSIONS = [
  // Perencanaan & keuangan
  { id: "finance.view", group: "Keuangan", label: "Melihat laba, margin, HPP, dan modal", utama: true, produksi: false, kasir: false },
  { id: "plan.simulate", group: "Perencanaan", label: "Mengatur modal bulanan & menjalankan simulasi", utama: true, produksi: false, kasir: false },
  { id: "plan.approve", group: "Perencanaan", label: "Menyetujui & menerbitkan rencana bulanan", utama: true, produksi: false, kasir: false },
  { id: "plan.view", group: "Perencanaan", label: "Melihat rencana produksi yang sudah disetujui", utama: true, produksi: true, kasir: false },
  { id: "optimasi.view", group: "Perencanaan", label: "Membuka halaman Optimasi (MILP) & Peramalan finansial", utama: true, produksi: false, kasir: false },
  // Produksi
  { id: "sales.record", group: "Produksi", label: "Mencatat penjualan, stok barang jadi, dan roti terbuang", utama: true, produksi: true, kasir: true },
  { id: "production.report", group: "Produksi", label: "Input realisasi produksi harian", utama: true, produksi: true, kasir: false },
  { id: "schedule.view", group: "Produksi", label: "Melihat jadwal produksi", utama: true, produksi: true, kasir: false },
  { id: "order.create", group: "Produksi", label: "Menambah & memperbarui status pesanan", utama: true, produksi: true, kasir: true },
  // Gudang
  { id: "stock.view", group: "Gudang", label: "Melihat stok & prediksi ketahanan bahan", utama: true, produksi: true, kasir: true },
  { id: "stock.out", group: "Gudang", label: "Mencatat distribusi bahan ke produksi (keluar)", utama: true, produksi: true, kasir: false },
  { id: "stock.in", group: "Gudang", label: "Mencatat barang masuk langsung (pembelian)", utama: true, produksi: false, kasir: false },
  { id: "stock.adjust", group: "Gudang", label: "Koreksi / opname stok manual", utama: true, produksi: false, kasir: false },
  { id: "request.create", group: "Pembelian", label: "Mengajukan pembelian bahan baku", utama: true, produksi: true, kasir: false },
  { id: "request.approve", group: "Pembelian", label: "Menyetujui / menolak pengajuan pembelian", utama: true, produksi: false, kasir: false },
  { id: "request.receive", group: "Pembelian", label: "Mencatat penerimaan barang dari pengajuan yang disetujui", utama: true, produksi: true, kasir: false },
  // Administrasi
  { id: "material.manage", group: "Gudang", label: "Mengelola data bahan baku (tambah, ubah, hapus bahan)", utama: true, produksi: false, kasir: false },
  { id: "master.edit", group: "Administrasi", label: "Mengubah produk & resep (harga jual, HPP, BOM)", utama: true, produksi: false, kasir: false },
  { id: "report.finance", group: "Administrasi", label: "Laporan keuangan & analitik laba", utama: true, produksi: false, kasir: false },
  { id: "audit.view", group: "Administrasi", label: "Melihat log aktivitas (audit) & matriks hak akses", utama: true, produksi: false, kasir: false },
  { id: "settings.manage", group: "Administrasi", label: "Pengaturan sistem & reset data", utama: true, produksi: false, kasir: false },
];

export const ROLES = {
  utama: {
    id: "utama",
    label: "Admin Utama",
    name: "Admin Utama",
    initials: "AU",
    tagline: "Pemilik / manajer: mengatur modal, menyetujui rencana, mengontrol keuangan.",
    pages: ["Dashboard", "Perencanaan Modal", "Optimasi", "Frekuensi Produksi", "Peramalan", "Bahan Baku", "Pengelolaan Bahan Baku", "Barang Masuk", "Distribusi Bahan", "Pengajuan Bahan", "Riwayat Mutasi", "Rencana Produksi", "Stok Barang Jadi", "Penjadwalan", "Pesanan", "Master Data", "Laporan", "Laporan Produksi", "Hak Akses", "Pengaturan", "Bantuan", "Keluar"],
    duties: [
      "Menetapkan modal bulanan dan parameter kapasitas (oven, mixer, SDM).",
      "Menjalankan simulasi: modal → kebutuhan bahan baku → produksi → laba.",
      "Menyetujui dan menerbitkan rencana bulanan agar menjadi perintah kerja bagi Admin Produksi.",
      "Menyetujui atau menolak pengajuan pembelian bahan baku.",
      "Mengelola data bahan baku (tambah, ubah, hapus) serta produk & resep (harga jual, HPP, BOM).",
      "Membandingkan produksi 1x vs 2x seminggu berdasarkan penjualan dan masa simpan roti.",
      "Koreksi stok (opname), reset data, dan memantau log aktivitas semua pengguna.",
    ],
    limits: ["Tidak ada pembatasan fungsi; semua tindakan tercatat di log aktivitas."],
  },
  produksi: {
    id: "produksi",
    label: "Admin Produksi",
    name: "Admin Produksi",
    initials: "AP",
    tagline: "Pelaksana lapangan: menjalankan rencana yang disetujui, mengelola bahan harian.",
    pages: ["Dashboard", "Peramalan", "Bahan Baku", "Distribusi Bahan", "Pengajuan Bahan", "Riwayat Mutasi", "Rencana Produksi", "Stok Barang Jadi", "Penjadwalan", "Pesanan", "Laporan Produksi", "Bantuan", "Keluar"],
    duties: [
      "Membaca perintah kerja harian dari rencana yang sudah disetujui Admin Utama.",
      "Mencatat realisasi produksi (jumlah jadi, reject) — stok bahan berkurang otomatis sesuai resep.",
      "Mencatat penjualan harian dan roti terbuang; sistem menyarankan jumlah produksi berikutnya.",
      "Mencatat distribusi bahan baku ke produksi dan memantau stok kritis.",
      "Mengajukan pembelian bahan; mencatat penerimaan hanya untuk pengajuan yang sudah disetujui.",
      "Menambah pesanan dan memperbarui status pesanan.",
    ],
    limits: [
      "Tidak dapat melihat laba, margin, HPP, maupun modal bulanan.",
      "Tidak dapat mengubah parameter, master data, atau menyetujui rencana.",
      "Tidak dapat menambah stok langsung atau koreksi stok manual.",
      "Tidak dapat mereset data atau membuka log aktivitas.",
    ],
  },
  kasir: {
    id: "kasir",
    label: "Kasir",
    name: "Kasir",
    initials: "KR",
    tagline: "Front office: mencatat penjualan harian, mencatat pesanan pelanggan, dan memantau stok siap jual.",
    pages: ["Dashboard", "Stok Barang Jadi", "Pesanan", "Bahan Baku", "Bantuan", "Keluar"],
    duties: [
      "Mencatat penjualan harian roti dan stok barang jadi yang laku.",
      "Mencatat pesanan pelanggan (rutin dan khusus).",
      "Memantau stok barang jadi dan pemberitahuan roti kedaluwarsa.",
      "Melihat ketersediaan bahan baku di gudang (hanya baca).",
    ],
    limits: [
      "Tidak dapat melihat laba, margin, HPP, maupun modal bulanan.",
      "Tidak dapat menyetujui rencana produksi atau pengajuan pembelian.",
      "Tidak dapat mengubah data bahan baku, produk, atau resep.",
      "Tidak dapat mencatat barang masuk/koreksi stok maupun realisasi produksi.",
      "Tidak dapat mereset data atau membuka log aktivitas.",
    ],
  },
};

export const DEFAULT_ROLE = "produksi";

// Akun demo — ganti dengan autentikasi backend untuk produksi
export const USERS = [
  { username: "admin.utama", password: "utama123", role: "utama", name: "Admin Utama" },
  { username: "admin.produksi", password: "produksi123", role: "produksi", name: "Admin Produksi" },
  { username: "kasir", password: "kasir123", role: "kasir", name: "Kasir" },
];

export function getRole(roleId) {
  return ROLES[roleId] || ROLES[DEFAULT_ROLE];
}

export function can(roleId, perm) {
  const p = PERMISSIONS.find((x) => x.id === perm);
  return !!(p && p[roleId]);
}
