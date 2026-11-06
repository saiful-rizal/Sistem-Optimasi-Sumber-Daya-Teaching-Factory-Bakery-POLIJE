# Pembaruan Sistem Tefa: Perencanaan Modal + Hak Akses

Timpa folder `src/` proyek Anda dengan folder `src/` di zip ini, lalu jalankan `npm install && npm run dev`.

Akun demo (client-side, ganti dengan backend untuk produksi):
- admin.utama / utama123
- admin.produksi / produksi123
- kasir / kasir123

## Alur sistem
Admin Utama isi modal bulanan -> sistem hitung alokasi roti vs kering -> produksi per siklus (MILP bulat)
-> kebutuhan bahan baku & daftar belanja -> prediksi omzet & laba -> Admin Utama setujui rencana
-> Admin Produksi menerima perintah kerja harian, input realisasi (stok bahan otomatis berkurang)
-> kekurangan bahan diajukan -> Admin Utama setujui -> Admin Produksi catat penerimaan (stok bertambah).

## File baru
lib/planner.js, lib/roles.js (ditulis ulang), components/Login.jsx,
modules/PerencanaanModule, RencanaProduksiModule, PengajuanModule, MasterDataModule, HakAksesModule, DashboardProduksi.
## File diubah
App.jsx, ModulePage, Sidebar, Topbar, Dashboard, GudangModule, QuickAdd, PeramalanModule, styles.css, data/tefa-data.json (modalBulanan).

## Pembaruan 2: sidebar dropdown & menu Bahan Baku
- Sidebar berupa grup yang bisa dibuka-tutup (Perencanaan, Bahan Baku, Produksi, Laporan, Sistem), grup aktif terbuka otomatis, ada pencarian menu.
- Bahan Baku dipecah: Stok Bahan Baku, Pengelolaan Bahan Baku (tambah/ubah/hapus), Barang Masuk, Distribusi Bahan, Pengajuan Bahan, Riwayat Mutasi.
- Baru: Laporan Produksi, izin material.manage. Master Data berganti nama menjadi Produk & Resep.

## Pembaruan 3: stok barang jadi, masa simpan, frekuensi produksi
- Stok Barang Jadi (Admin Utama & Produksi): catat penjualan, stok per batch (FIFO), roti kedaluwarsa, saran jumlah produksi berikutnya.
- Frekuensi Produksi (Admin Utama): bandingkan rencana sekarang vs 2x vs 1x seminggu berdasarkan penjualan, masa simpan, dan biaya tetap per hari produksi.
- Perencanaan Modal: opsi "Batasi produksi sesuai penjualan nyata".
- Master Data: kolom masa simpan produk. Dashboard: panel alur kerja per peran.
- Asumsi: roti sisa dijual lagi sampai masa simpan habis, lalu dibuang. Biaya tetap per hari produksi default Rp100.000 (perkiraan, ubah sesuai kondisi pabrik).
